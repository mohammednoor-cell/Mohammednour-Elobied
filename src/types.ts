export type ProjectStatus = 'Planning' | 'In Progress' | 'Review' | 'Completed' | 'On Hold';
export type ProjectPriority = 'High' | 'Medium' | 'Low';
export type ProjectCategory = 'Experiential' | 'Brand & Design' | 'VIP & Protocol' | 'Interactive Tech' | 'Strategy';

export interface DeliverableItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  dueTime?: string;
  reminderAt?: string;
  timerSeconds?: number;
  isTimerRunning?: boolean;
  timerStartedAt?: number;
  smartPriorityScore?: number;
  smartPriorityTier?: 'critical' | 'high' | 'medium' | 'low';
  smartPriorityReason?: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  category?: ProjectCategory;
  status: ProjectStatus;
  priority: ProjectPriority;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:mm
  notes?: string;
  deliverables?: DeliverableItem[];
  budget?: string;
  lead?: string;
  createdAt?: string;
  updatedAt?: string;
  timerSeconds?: number;
  isTimerRunning?: boolean;
  timerStartedAt?: number;
  archived?: boolean;
  archivedAt?: string;
  smartPriorityScore?: number;
  smartPriorityTier?: 'critical' | 'high' | 'medium' | 'low';
  smartPriorityReason?: string;
  tags?: string[];
  sheetUrl?: string;
  ownerId?: string;
}

export type ProjectTemplateId = 
  | 'event-planning' 
  | 'brand-campaign' 
  | 'client-onboarding' 
  | 'vip-protocol' 
  | 'interactive-tech';

export interface ProjectTemplate {
  id: ProjectTemplateId;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: ProjectCategory;
  defaultPriority: ProjectPriority;
  icon: string;
  badge: string;
  deliverables: { text: string; textAr?: string }[];
}

export type WorkspaceView = 'home' | 'dashboard' | 'projects' | 'board' | 'pages' | 'analytics' | 'files' | 'integrations';

export type Language = 'en' | 'ar';

export type ThemeId = 
  | 'emerald-gold'
  | 'obsidian'
  | 'classic-slate'
  | 'royal-indigo'
  | 'warm-sand'
  | 'cyber-teal'
  | 'azure-blue';

export interface ThemeConfig {
  id: ThemeId;
  nameEn: string;
  nameAr: string;
  isDark: boolean;
  primaryColor: string;
  accentColor: string;
  previewColors: string[];
}

export interface TaskReminder {
  id: string;
  projectId: string;
  projectName: string;
  taskTitle: string;
  deliverableId?: string;
  dueDateTime: string; // ISO string or YYYY-MM-DDTHH:mm
  isCompleted: boolean;
  isDismissed?: boolean;
  isSnoozed?: boolean;
  snoozedUntil?: string;
  createdAt: string;
  priority?: ProjectPriority;
}

export interface TaskTimer {
  id: string;
  projectId: string;
  taskId?: string;
  title: string;
  elapsedSeconds: number;
  isRunning: boolean;
  lastStartedTimestamp?: number;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  category: 'presentation' | 'spreadsheet' | 'document' | 'pdf' | 'image' | 'other';
  uploadedAt: string;
  projectId?: string;
  projectName?: string;
  dataUrl?: string; // base64 or blob URL for download/preview
  rawBlob?: Blob; // for unlimited binary storage in IndexedDB
}

export interface WhatsAppConfig {
  phoneNumber: string; // e.g. "501234567"
  countryCode: string; // e.g. "+966"
  recipientName: string; // e.g. "Mohammed Noor"
  autoAlertsEnabled: boolean;
  notifyOnHighPriority: boolean;
  notifyOnDeadlines: boolean;
  notifyOnStatusChange: boolean;
  dailyBriefEnabled: boolean;
  lastSentAt?: string;
}

export interface StorageQuotaInfo {
  usedBytes: number;
  totalBytes: number;
  usedFormatted: string;
  totalFormatted: string;
  percentage: number;
  isUnlimited: boolean;
}

export interface QuickNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  color?: string;
  pinned?: boolean;
}

export type ReportKind = 'executive_summary' | 'client_status' | 'financial_burnup' | 'vip_protocol' | 'risk_audit';

export interface GeneratedReport {
  id: string;
  title: string;
  kind: ReportKind;
  generatedAt: string;
  summary: string;
  sections: { heading: string; body: string }[];
  metrics: { label: string; value: string; trend?: string }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  actionExecuted?: string;
  actionPayload?: any;
}

export interface DocPage {
  id: string;
  title: string;
  icon: string;
  category: string;
  summary: string;
  content: string;
  updatedAt: string;
}
