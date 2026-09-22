import React, { useState, useEffect } from 'react';
import { UploadedFile, Language, StorageQuotaInfo } from '../types';
import { getTranslation } from '../utils/i18n';
import { 
  downloadFile, 
  downloadAllFilesArchive, 
  getStorageQuota,
  deleteFileFromStorage
} from '../utils/storageEngine';
import { 
  File, 
  Presentation, 
  FileSpreadsheet, 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Trash2, 
  Search, 
  Plus, 
  ExternalLink,
  Eye,
  Filter,
  HardDrive,
  Sparkles,
  Archive,
  CheckCircle2,
  X
} from 'lucide-react';

interface FilesViewProps {
  files: UploadedFile[];
  onDeleteFile: (id: string) => void;
  onOpenFileUpload: () => void;
  lang: Language;
}

export const FilesView: React.FC<FilesViewProps> = ({
  files,
  onDeleteFile,
  onOpenFileUpload,
  lang,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [quotaInfo, setQuotaInfo] = useState<StorageQuotaInfo | null>(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const t = getTranslation(lang);

  // Load storage quota estimate
  useEffect(() => {
    getStorageQuota().then(info => setQuotaInfo(info));
  }, [files.length]);

  const filteredFiles = files.filter(f => {
    const matchesSearch = !search || f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.projectName && f.projectName.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = categoryFilter === 'All' || f.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const getFileIcon = (cat: UploadedFile['category']) => {
    switch (cat) {
      case 'presentation':
        return <Presentation className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'document':
      case 'pdf':
        return <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <File className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />;
    }
  };

  const handleDownloadSingle = (file: UploadedFile) => {
    downloadFile(file);
  };

  const handleDownloadAll = () => {
    if (files.length === 0) return;
    setIsDownloadingAll(true);
    downloadAllFilesArchive(files);
    setTimeout(() => setIsDownloadingAll(false), 1500);
  };

  const handleDelete = async (fileId: string) => {
    await deleteFileFromStorage(fileId);
    onDeleteFile(fileId);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5" />
            <span>Tartibat Unlimited Cloud & Asset Vault</span>
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            {t.filesTitle}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-0.5">
            {lang === 'ar'
              ? 'مستودع الأصول الرقمية بسعة تخزين وتنزيل غير محدودة مدعوم بمحرك IndexedDB المحلي السريع.'
              : 'Unlimited local file storage and batch downloads powered by high-speed IndexedDB.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {files.length > 0 && (
            <button
              onClick={handleDownloadAll}
              disabled={isDownloadingAll}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
              title="Download all files as unified backup archive"
            >
              <Archive className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isDownloadingAll ? 'Packaging...' : (lang === 'ar' ? 'تنزيل جميع الملفات' : 'Download All Files')}</span>
            </button>
          )}

          <button
            onClick={onOpenFileUpload}
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.uploadFile}</span>
          </button>
        </div>
      </div>

      {/* Storage Quota & Capacity Indicator Bar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <span>{lang === 'ar' ? 'سعة التخزين: محرك غير محدود نشط' : 'Storage Engine: Unlimited Mode Active'}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-[11px] text-zinc-400">
                {lang === 'ar' ? 'مساحة القرص المتاحة للتخزين والتنزيل المباشر:' : 'Direct disk capacity available for upload/download:'}{' '}
                <span className="font-semibold text-zinc-700 dark:text-zinc-300 font-mono">
                  {quotaInfo?.totalFormatted || '100+ GB'}
                </span>
                {' '}({files.length} {lang === 'ar' ? 'ملف مسجل' : 'files stored'})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto text-xs">
            <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
              {quotaInfo?.usedFormatted || '0 B'} used
            </span>
            <div className="w-28 sm:w-36 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-200/60 dark:border-zinc-700/60">
              <div 
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${Math.max(2, quotaInfo?.percentage || 1)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={lang === 'ar' ? 'بحث في الملفات، العروض التقديمية، الجداول أو المشاريع...' : 'Search files, presentations, spreadsheets, or projects...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#f8f8f7] dark:bg-zinc-800/80 text-xs text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 pl-9 pr-3 py-2 rounded-lg border border-zinc-200/70 dark:border-zinc-700 focus:outline-none focus:border-zinc-400 focus:bg-white dark:focus:bg-zinc-900"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['All', 'presentation', 'spreadsheet', 'document', 'pdf', 'image'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {cat === 'All' ? t.all : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Files Grid / Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
        {filteredFiles.length === 0 ? (
          <div className="py-16 text-center text-zinc-400 space-y-3">
            <File className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700" />
            <p className="text-sm font-medium">{lang === 'ar' ? 'لم يتم العثور على ملفات مطابقة' : 'No files found matching your query.'}</p>
            <button
              onClick={onOpenFileUpload}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              {lang === 'ar' ? 'رفع ملفات أو عروض جديدة' : 'Upload presentations, spreadsheets, or briefs'}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
            {filteredFiles.map((file) => (
              <div 
                key={file.id}
                className="p-3.5 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 flex items-center justify-center shrink-0">
                    {getFileIcon(file.category)}
                  </div>
                  <div className="min-w-0">
                    <div 
                      className="font-bold text-zinc-900 dark:text-white text-xs truncate hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer" 
                      onClick={() => handleDownloadSingle(file)}
                    >
                      {file.name}
                    </div>
                    <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                      {file.projectName && (
                        <span className="font-semibold text-zinc-600 dark:text-zinc-300">
                          {file.projectName}
                        </span>
                      )}
                      <span>•</span>
                      <span className="font-mono">{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{file.uploadedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  {file.category === 'image' && file.dataUrl && (
                    <button
                      onClick={() => setPreviewFile(file)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-xs transition-colors"
                      title={t.preview}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{t.preview}</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDownloadSingle(file)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-xs transition-colors"
                    title={t.download}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.download}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title={t.delete}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal for Images */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 max-w-2xl w-full p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                {previewFile.name}
              </span>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-hidden rounded-lg flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
              <img 
                src={previewFile.dataUrl} 
                alt={previewFile.name} 
                className="max-h-[65vh] object-contain rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => handleDownloadSingle(previewFile)}
                className="flex items-center gap-1 px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.download}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
