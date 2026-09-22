import React, { useState, useRef } from 'react';
import { UploadedFile, Project, Language } from '../types';
import { getTranslation } from '../utils/i18n';
import { saveFileToStorage } from '../utils/storageEngine';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  Presentation, 
  FileText, 
  File, 
  Image as ImageIcon,
  CheckCircle2,
  FolderOpen,
  HardDrive,
  Sparkles
} from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: UploadedFile[]) => void;
  projects: Project[];
  lang: Language;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  projects,
  lang,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = getTranslation(lang);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const getFileCategory = (name: string, type: string): UploadedFile['category'] => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (['ppt', 'pptx', 'key'].includes(ext) || type.includes('presentation')) return 'presentation';
    if (['xls', 'xlsx', 'csv'].includes(ext) || type.includes('spreadsheet') || type.includes('csv')) return 'spreadsheet';
    if (['doc', 'docx', 'txt', 'rtf', 'md'].includes(ext) || type.includes('document') || type.includes('word')) return 'document';
    if (ext === 'pdf' || type.includes('pdf')) return 'pdf';
    if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext) || type.includes('image')) return 'image';
    return 'other';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setProgressPercent(10);
    const targetProject = projects.find(p => p.id === selectedProjectId);
    const uploadedList: UploadedFile[] = [];

    const total = selectedFiles.length;
    let completed = 0;

    for (const file of selectedFiles) {
      // Read data URL
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });

      const newFileRecord: UploadedFile = {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        category: getFileCategory(file.name, file.type),
        uploadedAt: new Date().toLocaleDateString(),
        projectId: targetProject?.id,
        projectName: targetProject?.name,
        dataUrl,
      };

      // Persist directly to unlimited IndexedDB engine
      await saveFileToStorage(newFileRecord);
      uploadedList.push(newFileRecord);

      completed++;
      setProgressPercent(Math.round((completed / total) * 100));
    }

    onUpload(uploadedList);
    setIsProcessing(false);
    setSelectedFiles([]);
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
      <div 
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>Unlimited Space Engine (IndexedDB)</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                {lang === 'ar' ? 'رفع ملفات بدون حد أقصى للحجم' : 'Upload Unlimited Files & Assets'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Project Association Selector */}
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              {lang === 'ar' ? 'ربط الملف بمشروع / عميل (اختياري)' : 'Associate with Lead / Project (Optional)'}
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-zinc-400 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            >
              <option value="">{lang === 'ar' ? 'ملف عام للمنظومة (بدون مشروع محدد)' : 'General Workspace Asset (No specific project)'}</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.client})
                </option>
              ))}
            </select>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 scale-[0.99]'
                : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 bg-[#fafaf9] dark:bg-zinc-850'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <UploadCloud className="w-8 h-8 mx-auto text-emerald-600 dark:text-emerald-400 mb-2" />
            <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
              {t.dropFilesHere}
            </p>
            <p className="text-[10.5px] text-zinc-400 mt-1">
              {lang === 'ar'
                ? 'يدعم ملفات PPTX, XLSX, DOCX, PDF, PNG, JPG, MP4, ZIP ونماذج 3D بدون قيود على الحجم'
                : 'Supports PPTX, XLSX, DOCX, PDF, PNG, JPG, MP4, ZIP, and CAD models with zero size limits'}
            </p>
          </div>

          {/* Upload Progress Bar */}
          {isProcessing && (
            <div className="space-y-1.5 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                <span>Storing into IndexedDB Unlimited Engine...</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-emerald-200 dark:bg-emerald-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Selected Files List */}
          {selectedFiles.length > 0 && !isProcessing && (
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              <span className="font-semibold text-zinc-600 dark:text-zinc-400 text-[11px] block">
                {lang === 'ar' ? `الملفات المختارة (${selectedFiles.length}):` : `Selected Files (${selectedFiles.length}):`}
              </span>
              {selectedFiles.map((file, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700"
                >
                  <div className="flex items-center gap-2 truncate">
                    <File className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">{file.name}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 shrink-0 font-mono">
                    {formatFileSize(file.size)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{lang === 'ar' ? 'سعة تخزين غير محدودة' : 'Unlimited local capacity'}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-xs font-semibold"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={selectedFiles.length === 0 || isProcessing}
                className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 disabled:opacity-40 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors"
              >
                {isProcessing ? 'Processing...' : `Upload ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
