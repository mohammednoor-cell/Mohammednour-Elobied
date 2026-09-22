import { UploadedFile, WhatsAppConfig, StorageQuotaInfo } from '../types';

const DB_NAME = 'tartibat_executive_db';
const DB_VERSION = 2;
const STORE_FILES = 'files_store';
const STORE_CONFIG = 'config_store';
const STORE_SNAPSHOTS = 'snapshots_store';

let dbInstance: IDBDatabase | null = null;

// Initialize IndexedDB with persistent stores
export async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        db.createObjectStore(STORE_FILES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_CONFIG)) {
        db.createObjectStore(STORE_CONFIG, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORE_SNAPSHOTS)) {
        db.createObjectStore(STORE_SNAPSHOTS, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('IndexedDB open error:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

// Format bytes into readable string
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Calculate disk and browser storage usage
export async function getStorageQuota(): Promise<StorageQuotaInfo> {
  try {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const usedBytes = estimate.usage || 0;
      const totalBytes = estimate.quota || (100 * 1024 * 1024 * 1024); // default 100GB
      const percentage = totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0;
      return {
        usedBytes,
        totalBytes,
        usedFormatted: formatBytes(usedBytes),
        totalFormatted: formatBytes(totalBytes),
        percentage: Math.min(100, Math.max(0.1, parseFloat(percentage.toFixed(2)))),
        isUnlimited: true,
      };
    }
  } catch (e) {
    console.warn('Could not query navigator.storage.estimate', e);
  }

  return {
    usedBytes: 1024 * 1024 * 5, // 5MB estimation
    totalBytes: 100 * 1024 * 1024 * 1024, // 100GB
    usedFormatted: '5.2 MB',
    totalFormatted: '100+ GB (Unlimited)',
    percentage: 0.1,
    isUnlimited: true,
  };
}

// Save an individual file into unlimited IndexedDB storage
export async function saveFileToStorage(file: UploadedFile): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_FILES, 'readwrite');
      const store = tx.objectStore(STORE_FILES);
      
      // Store clean serializable object without circular refs
      const record = {
        id: file.id,
        name: file.name,
        size: file.size,
        type: file.type,
        category: file.category,
        uploadedAt: file.uploadedAt,
        projectId: file.projectId,
        projectName: file.projectName,
        dataUrl: file.dataUrl,
      };

      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save file to IndexedDB:', err);
  }
}

// Bulk save multiple files
export async function saveMultipleFilesToStorage(files: UploadedFile[]): Promise<void> {
  for (const file of files) {
    await saveFileToStorage(file);
  }
}

// Retrieve all files stored in IndexedDB
export async function getAllFilesFromStorage(): Promise<UploadedFile[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_FILES, 'readonly');
      const store = tx.objectStore(STORE_FILES);
      const req = store.getAll();

      req.onsuccess = () => {
        resolve(req.result || []);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to retrieve files from IndexedDB:', err);
    return [];
  }
}

// Delete file from IndexedDB
export async function deleteFileFromStorage(id: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_FILES, 'readwrite');
      const store = tx.objectStore(STORE_FILES);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to delete file from IndexedDB:', err);
  }
}

// Direct file download using Blob or DataURL
export function downloadFile(file: UploadedFile): void {
  try {
    if (file.dataUrl && file.dataUrl.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = file.dataUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // If text or plain payload
    const blob = new Blob([file.dataUrl || `Tartibat Asset: ${file.name}\nProject: ${file.projectName || 'General'}\nDate: ${file.uploadedAt}`], {
      type: file.type || 'application/octet-stream'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  } catch (err) {
    console.error('Download error:', err);
  }
}

// Bulk download all files as a unified JSON package / export bundle
export function downloadAllFilesArchive(files: UploadedFile[]): void {
  const archivePayload = {
    exportedAt: new Date().toISOString(),
    organization: 'Tartibat Experiential Events Agency',
    fileCount: files.length,
    totalSizeBytes: files.reduce((acc, f) => acc + f.size, 0),
    files: files.map(f => ({
      id: f.id,
      name: f.name,
      category: f.category,
      type: f.type,
      size: f.size,
      uploadedAt: f.uploadedAt,
      projectName: f.projectName,
      projectId: f.projectId,
      dataUrl: f.dataUrl,
    }))
  };

  const jsonStr = JSON.stringify(archivePayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Tartibat-Unlimited-Assets-Archive-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// Save WhatsApp Config
export const DEFAULT_WHATSAPP_CONFIG: WhatsAppConfig = {
  phoneNumber: '501234567',
  countryCode: '+966',
  recipientName: 'Mohammed Noor (Lead)',
  autoAlertsEnabled: true,
  notifyOnHighPriority: true,
  notifyOnDeadlines: true,
  notifyOnStatusChange: true,
  dailyBriefEnabled: true,
};

export async function saveWhatsAppConfig(config: WhatsAppConfig): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CONFIG, 'readwrite');
      const store = tx.objectStore(STORE_CONFIG);
      const req = store.put({ key: 'whatsapp_config', value: config });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    // Fallback to localStorage
    localStorage.setItem('tartibat_whatsapp_cfg', JSON.stringify(config));
  }
}

export async function getWhatsAppConfig(): Promise<WhatsAppConfig> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_CONFIG, 'readonly');
      const store = tx.objectStore(STORE_CONFIG);
      const req = store.get('whatsapp_config');
      req.onsuccess = () => {
        if (req.result && req.result.value) {
          resolve(req.result.value);
        } else {
          // Check localStorage fallback
          const saved = localStorage.getItem('tartibat_whatsapp_cfg');
          if (saved) {
            resolve(JSON.parse(saved));
          } else {
            resolve(DEFAULT_WHATSAPP_CONFIG);
          }
        }
      };
      req.onerror = () => {
        resolve(DEFAULT_WHATSAPP_CONFIG);
      };
    });
  } catch (e) {
    const saved = localStorage.getItem('tartibat_whatsapp_cfg');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_WHATSAPP_CONFIG;
      }
    }
    return DEFAULT_WHATSAPP_CONFIG;
  }
}

// Generate clean WhatsApp direct dispatch URL
export function generateWhatsAppUrl(countryCode: string, phoneNumber: string, message: string): string {
  const cleanCode = countryCode.replace(/\D/g, '');
  const cleanPhone = phoneNumber.replace(/\D/g, '').replace(/^0+/, ''); // remove leading 0
  const fullNumber = `${cleanCode}${cleanPhone}`;
  return `https://api.whatsapp.com/send?phone=${fullNumber}&text=${encodeURIComponent(message)}`;
}
