import React, { useState, useEffect, useRef } from 'react';
import { 
  Project, 
  WorkspaceView, 
  DocPage, 
  ProjectStatus, 
  Language, 
  UploadedFile, 
  QuickNote,
  ThemeId,
  TaskReminder
} from './types';
import { INITIAL_PROJECTS, INITIAL_DOCS, INITIAL_FILES, INITIAL_NOTES, INITIAL_REMINDERS } from './data/seedData';
import { 
  auth, 
  db, 
  signInWithGoogle, 
  signOutUser, 
  testConnection, 
  handleFirestoreError, 
  OperationType 
} from './lib/firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { HomeView } from './components/HomeView';
import { DashboardView } from './components/DashboardView';
import { ProjectsTableView } from './components/ProjectsTableView';
import { BoardView } from './components/BoardView';
import { PagesView } from './components/PagesView';
import { PowerBiAnalyticsView } from './components/PowerBiAnalyticsView';
import { FilesView } from './components/FilesView';
import { ConnectedToolsView } from './components/ConnectedToolsView';
import { ProjectModal } from './components/ProjectModal';
import { ProjectDetailDrawer } from './components/ProjectDetailDrawer';
import { AiCopilotPanel } from './components/AiCopilotPanel';
import { QuickActionsFloatingMenu } from './components/QuickActionsFloatingMenu';
import { QuickNoteModal } from './components/QuickNoteModal';
import { FileUploadModal } from './components/FileUploadModal';
import { ThemePickerModal } from './components/ThemePickerModal';
import { ExportModal } from './components/ExportModal';
import { TaskRemindersModal } from './components/TaskRemindersModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { applyThemeToDOM } from './utils/theme';
import { playAlarmChime } from './utils/clockUtils';

const STORAGE_KEY_PROJECTS = 'mohammednoor_lead_projects_v2';
const STORAGE_KEY_DOCS = 'mohammednoor_lead_docs_v2';
const STORAGE_KEY_FILES = 'mohammednoor_lead_files_v1';
const STORAGE_KEY_NOTES = 'mohammednoor_lead_notes_v1';
const STORAGE_KEY_LANG = 'mohammednoor_lead_lang_v1';
const STORAGE_KEY_THEME = 'tartibat_theme_id_v1';
const STORAGE_KEY_DARK = 'tartibat_dark_mode_v1';
const STORAGE_KEY_REMINDERS = 'tartibat_task_reminders_v1';

export default function App() {
  // Language State
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG);
      if (saved === 'ar' || saved === 'en') return saved;
    } catch (e) {
      console.error(e);
    }
    return 'en';
  });

  // Color Theme & Dark Mode State
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved) return saved as ThemeId;
    } catch (e) {
      console.error(e);
    }
    return 'obsidian';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DARK);
      if (saved !== null) return saved === 'true';
    } catch (e) {
      console.error(e);
    }
    return true;
  });

  // Apply theme to DOM on state change
  useEffect(() => {
    applyThemeToDOM(currentTheme, isDark);
    localStorage.setItem(STORAGE_KEY_THEME, currentTheme);
    localStorage.setItem(STORAGE_KEY_DARK, String(isDark));
  }, [currentTheme, isDark]);

  // Firebase Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        console.log("Firebase user authenticated:", user.email);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      showToast(`Welcome, ${user.displayName || user.email}! Connected to Firebase.`);
    } catch (err) {
      console.error(err);
      showToast('Firebase Google sign-in failed. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      showToast('Signed out of Firebase.');
    } catch (err) {
      console.error(err);
      showToast('Sign out error.');
    }
  };

  // Load initial projects with backwards compatibility
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROJECTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load saved projects", e);
    }
    return INITIAL_PROJECTS.map(p => ({
      ...p,
      timerSeconds: p.timerSeconds || 0,
      isTimerRunning: false
    }));
  });

  // Real-time Firestore sync when user is authenticated
  useEffect(() => {
    if (!currentUser) return;
    const path = `users/${currentUser.uid}/projects`;
    const colRef = collection(db, 'users', currentUser.uid, 'projects');
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const firestoreList: Project[] = [];
        snapshot.forEach((snap) => {
          firestoreList.push(snap.data() as Project);
        });
        setProjects(firestoreList);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const [docs, setDocs] = useState<DocPage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DOCS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load saved docs", e);
    }
    return INITIAL_DOCS;
  });

  const [files, setFiles] = useState<UploadedFile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FILES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load saved files", e);
    }
    return INITIAL_FILES;
  });

  const [notes, setNotes] = useState<QuickNote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load saved notes", e);
    }
    return INITIAL_NOTES;
  });

  // Task Reminders State
  const [reminders, setReminders] = useState<TaskReminder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REMINDERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load saved reminders", e);
    }
    return INITIAL_REMINDERS;
  });

  const [currentView, setCurrentView] = useState<WorkspaceView>('home');
  const [viewHistory, setViewHistory] = useState<WorkspaceView[]>(['home']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const navigateToView = (view: WorkspaceView) => {
    if (view === currentView) return;
    const newHistory = viewHistory.slice(0, historyIndex + 1);
    newHistory.push(view);
    setViewHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentView(view);
  };

  const handleGoBack = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setCurrentView(viewHistory[prevIndex]);
    }
  };

  const handleGoForward = () => {
    if (historyIndex < viewHistory.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setCurrentView(viewHistory[nextIndex]);
    }
  };
  const [isAiOpen, setIsAiOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState<boolean>(false);
  const [isThemePickerOpen, setIsThemePickerOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState<boolean>(false);
  const [reminderTargetProject, setReminderTargetProject] = useState<Project | undefined>(undefined);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state with local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(docs));
  }, [docs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REMINDERS, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LANG, lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Keep selected project updated if projects change
  useEffect(() => {
    if (selectedProject) {
      const updated = projects.find(p => p.id === selectedProject.id);
      if (updated) setSelectedProject(updated);
    }
  }, [projects]);

  // Live Task Timer Ticker (increments running timers every second)
  useEffect(() => {
    const hasRunningTimers = projects.some(p => p.isTimerRunning);
    if (!hasRunningTimers) return;

    const timer = setInterval(() => {
      setProjects(prev => prev.map(p => {
        if (!p.isTimerRunning) return p;
        return {
          ...p,
          timerSeconds: (p.timerSeconds || 0) + 1
        };
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [projects]);

  // Task Reminders Checker Ticker (checks if reminders are due and chimes)
  const alertedRemindersRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const checkReminders = () => {
      const now = Date.now();
      reminders.forEach(r => {
        if (r.isCompleted) return;
        const dueTime = new Date(r.dueDateTime).getTime();
        // If due within the last 2 minutes and not yet alerted
        if (dueTime <= now && !alertedRemindersRef.current.has(r.id)) {
          alertedRemindersRef.current.add(r.id);
          playAlarmChime();
          showToast(`🔔 ${lang === 'ar' ? 'تنبيه موعد مهمة:' : 'Task Reminder:'} ${r.taskTitle}`);
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 10000);
    return () => clearInterval(interval);
  }, [reminders, lang]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ar' : 'en'));
    showToast(lang === 'en' ? 'تم تحويل الواجهة إلى اللغة العربية' : 'Switched to English interface');
  };

  // Workspace Project Actions
  const handleOpenNewProject = () => {
    setProjectToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setProjectToEdit(project);
    setIsModalOpen(true);
  };

  const handleSaveProject = (project: Project) => {
    const projectWithAudit: Project = {
      ...project,
      ownerId: currentUser?.uid || project.ownerId,
      updatedAt: new Date().toISOString()
    };

    setProjects((prev) => {
      const exists = prev.some((p) => p.id === project.id);
      if (exists) {
        return prev.map((p) => (p.id === project.id ? projectWithAudit : p));
      }
      return [projectWithAudit, ...prev];
    });

    if (currentUser) {
      const path = `users/${currentUser.uid}/projects/${project.id}`;
      setDoc(doc(db, 'users', currentUser.uid, 'projects', project.id), projectWithAudit)
        .catch(err => handleFirestoreError(err, OperationType.WRITE, path));
    }

    showToast(`Saved project: "${project.name}"`);
  };

  const handleDeleteProject = (projectId: string) => {
    const target = projects.find(p => p.id === projectId);
    if (!target) return;
    if (window.confirm(`Delete "${target.name}" from workspace?`)) {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      if (selectedProject?.id === projectId) setSelectedProject(null);

      if (currentUser) {
        const path = `users/${currentUser.uid}/projects/${projectId}`;
        deleteDoc(doc(db, 'users', currentUser.uid, 'projects', projectId))
          .catch(err => handleFirestoreError(err, OperationType.DELETE, path));
      }

      showToast(`Deleted "${target.name}"`);
    }
  };

  const handleUpdateStatus = (projectId: string, status: ProjectStatus) => {
    let updatedProj: Project | undefined;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          updatedProj = { ...p, status, updatedAt: new Date().toISOString() };
          return updatedProj;
        }
        return p;
      })
    );

    if (currentUser && updatedProj) {
      const path = `users/${currentUser.uid}/projects/${projectId}`;
      setDoc(doc(db, 'users', currentUser.uid, 'projects', projectId), updatedProj)
        .catch(err => handleFirestoreError(err, OperationType.UPDATE, path));
    }

    const target = projects.find(p => p.id === projectId);
    showToast(`Updated "${target?.name || 'Project'}" to ${status}`);
  };

  const handleArchiveProject = (projectId: string) => {
    let updatedProj: Project | undefined;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          updatedProj = { ...p, archived: true, archivedAt: new Date().toISOString() };
          return updatedProj;
        }
        return p;
      })
    );

    if (currentUser && updatedProj) {
      const path = `users/${currentUser.uid}/projects/${projectId}`;
      setDoc(doc(db, 'users', currentUser.uid, 'projects', projectId), updatedProj)
        .catch(err => handleFirestoreError(err, OperationType.UPDATE, path));
    }

    const target = projects.find(p => p.id === projectId);
    showToast(`Archived "${target?.name || 'Project'}" to archive storage`);
  };

  const handleRestoreProject = (projectId: string) => {
    let updatedProj: Project | undefined;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const { archived, archivedAt, ...rest } = p;
          updatedProj = { ...rest, archived: false, updatedAt: new Date().toISOString() };
          return updatedProj;
        }
        return p;
      })
    );

    if (currentUser && updatedProj) {
      const path = `users/${currentUser.uid}/projects/${projectId}`;
      setDoc(doc(db, 'users', currentUser.uid, 'projects', projectId), updatedProj)
        .catch(err => handleFirestoreError(err, OperationType.UPDATE, path));
    }

    const target = projects.find(p => p.id === projectId);
    showToast(`Restored "${target?.name || 'Project'}" to active projects`);
  };

  const handleToggleDeliverable = (projectId: string, deliverableId: string) => {
    let updatedProj: Project | undefined;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const updatedDeliverables = (p.deliverables || []).map((d) =>
          d.id === deliverableId ? { ...d, completed: !d.completed } : d
        );
        const allCompleted = updatedDeliverables.length > 0 && updatedDeliverables.every(d => d.completed);
        updatedProj = {
          ...p,
          deliverables: updatedDeliverables,
          status: allCompleted ? 'Completed' : (p.status === 'Completed' ? 'In Progress' : p.status),
          updatedAt: new Date().toISOString()
        };
        return updatedProj;
      })
    );

    if (currentUser && updatedProj) {
      const path = `users/${currentUser.uid}/projects/${projectId}`;
      setDoc(doc(db, 'users', currentUser.uid, 'projects', projectId), updatedProj)
        .catch(err => handleFirestoreError(err, OperationType.UPDATE, path));
    }
  };

  const handleClearAllData = () => {
    if (window.confirm("Are you sure you want to remove all projects, tasks, and notes? This will give you a clean slate.")) {
      setProjects([]);
      setNotes([]);
      setFiles([]);
      setReminders([]);
      try {
        localStorage.removeItem(STORAGE_KEY_PROJECTS);
        localStorage.removeItem(STORAGE_KEY_NOTES);
        localStorage.removeItem(STORAGE_KEY_FILES);
        localStorage.removeItem(STORAGE_KEY_REMINDERS);
        localStorage.removeItem('notion_ai_workspace_v1');
      } catch (e) {
        console.error(e);
      }
      showToast('All example projects, tasks, and notes have been cleared.');
    }
  };

  const handleUpdateProjectNotes = (projectId: string, newNotes: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, notes: newNotes, updatedAt: new Date().toISOString().split('T')[0] } : p))
    );
    showToast('Updated project notes');
  };

  // Toggle Live Task Timer (Play / Pause)
  const handleToggleProjectTimer = (projectId: string) => {
    setProjects((prev) => prev.map((p) => {
      if (p.id !== projectId) return p;
      const willRun = !p.isTimerRunning;
      showToast(willRun ? `⏱️ Timer started for "${p.name}"` : `⏸️ Timer paused for "${p.name}"`);
      return {
        ...p,
        isTimerRunning: willRun,
        timerSeconds: p.timerSeconds || 0
      };
    }));
  };

  // Reminders Management
  const handleScheduleReminder = (newReminder: TaskReminder) => {
    setReminders(prev => [newReminder, ...prev]);
    showToast(`Scheduled reminder for "${newReminder.taskTitle}"`);
  };

  const handleToggleReminderCompleted = (reminderId: string) => {
    setReminders(prev => prev.map(r => r.id === reminderId ? { ...r, isCompleted: !r.isCompleted } : r));
  };

  const handleDeleteReminder = (reminderId: string) => {
    setReminders(prev => prev.filter(r => r.id !== reminderId));
    showToast('Reminder deleted');
  };

  const handleSnoozeReminder = (reminderId: string, minutes: number) => {
    const newTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    setReminders(prev => prev.map(r => r.id === reminderId ? { ...r, dueDateTime: newTime, isSnoozed: true } : r));
    alertedRemindersRef.current.delete(reminderId);
    showToast(`Snoozed for ${minutes} minutes`);
  };


  const handleOpenReminderForProject = (project?: Project) => {
    setReminderTargetProject(project);
    setIsRemindersModalOpen(true);
  };

  // Files & Notes
  const handleAddFiles = (newFiles: UploadedFile[]) => {
    setFiles((prev) => [...newFiles, ...prev]);
    showToast(`Added ${newFiles.length} file(s)`);
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles((prev) => prev.filter(f => f.id !== fileId));
    showToast('File removed');
  };

  const handleSaveNote = (newNote: QuickNote) => {
    setNotes((prev) => [newNote, ...prev]);
    showToast(`Note saved: "${newNote.title}"`);
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter(n => n.id !== noteId));
    showToast('Note deleted');
  };

  const handleAddDoc = (newDoc: DocPage) => {
    setDocs((prev) => [newDoc, ...prev]);
    showToast(`Added playbook: "${newDoc.title}"`);
  };

  // Execute AI action returned from Gemini server
  const handleExecuteAction = (actionObj: any) => {
    if (!actionObj || !actionObj.action) return;
    const { action, payload } = actionObj;

    switch (action) {
      case 'CREATE_PROJECT': {
        if (payload && payload.name) {
          const newProj: Project = {
            id: `proj-${Date.now()}`,
            name: payload.name,
            client: payload.client || 'Tartibat Partner',
            status: payload.status || 'Planning',
            priority: payload.priority || 'High',
            date: payload.date || undefined,
            notes: payload.notes || 'Created via Mohammed Noor Lead AI Assistant.',
            deliverables: (payload.deliverables || []).map((text: string, idx: number) => ({
              id: `d-${Date.now()}-${idx}`,
              text,
              completed: false
            })),
            lead: 'Mohammed Noor',
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
            timerSeconds: 0,
            isTimerRunning: false
          };
          setProjects(prev => [newProj, ...prev]);
          showToast(`AI created lead: "${newProj.name}"`);
        }
        break;
      }

      case 'UPDATE_STATUS': {
        if (payload?.status) {
          setProjects(prev => {
            return prev.map(p => {
              const matches = (payload.projectId && p.id === payload.projectId) ||
                (payload.nameQuery && p.name.toLowerCase().includes(payload.nameQuery.toLowerCase()));
              if (matches) {
                return { ...p, status: payload.status, updatedAt: new Date().toISOString().split('T')[0] };
              }
              return p;
            });
          });
          showToast(`AI updated status to ${payload.status}`);
        }
        break;
      }

      case 'UPDATE_PRIORITY': {
        if (payload?.priority) {
          setProjects(prev => {
            return prev.map(p => {
              const matches = (payload.projectId && p.id === payload.projectId) ||
                (payload.nameQuery && p.name.toLowerCase().includes(payload.nameQuery.toLowerCase()));
              if (matches) {
                return { ...p, priority: payload.priority, updatedAt: new Date().toISOString().split('T')[0] };
              }
              return p;
            });
          });
          showToast(`AI updated priority to ${payload.priority}`);
        }
        break;
      }

      case 'DELETE_PROJECT': {
        if (payload?.projectId || payload?.nameQuery) {
          setProjects(prev => prev.filter(p => {
            const matches = (payload.projectId && p.id === payload.projectId) ||
              (payload.nameQuery && p.name.toLowerCase().includes(payload.nameQuery.toLowerCase()));
            return !matches;
          }));
          showToast(`AI removed project record`);
        }
        break;
      }

      case 'SWITCH_VIEW': {
        if (payload?.view) {
          setCurrentView(payload.view);
          showToast(`Switched view to ${payload.view}`);
        }
        break;
      }

      default:
        console.log("Unhandled AI action:", actionObj);
    }
  };

  // Export JSON backup
  const handleExportJson = () => {
    const data = {
      workspace: 'mohammednoor lead',
      exportedAt: new Date().toISOString(),
      lead: 'Mohammed Noor (Tartibat)',
      projects,
      docs,
      files,
      notes,
      reminders
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mohammednoor-lead-workspace-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported workspace backup JSON');
  };

  // Import JSON backup
  const handleImportJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (Array.isArray(parsed)) {
          setProjects(parsed);
          showToast(`Imported ${parsed.length} projects`);
        } else if (parsed.projects && Array.isArray(parsed.projects)) {
          setProjects(parsed.projects);
          if (parsed.docs && Array.isArray(parsed.docs)) setDocs(parsed.docs);
          if (parsed.files && Array.isArray(parsed.files)) setFiles(parsed.files);
          if (parsed.notes && Array.isArray(parsed.notes)) setNotes(parsed.notes);
          if (parsed.reminders && Array.isArray(parsed.reminders)) setReminders(parsed.reminders);
          showToast(`Imported workspace data successfully`);
        } else {
          showToast('Unrecognized JSON format');
        }
      } catch (err) {
        console.error(err);
        showToast('Error parsing imported JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleAskAiPrompt = (prompt: string) => {
    setIsAiOpen(true);
    const inputEl = document.querySelector('textarea') as HTMLTextAreaElement | null;
    if (inputEl) {
      inputEl.value = prompt;
      inputEl.focus();
    }
  };

  const activeCount = projects.filter(p => p.status !== 'Completed').length;
  const highPriorityCount = projects.filter(p => p.priority === 'High' && p.status !== 'Completed').length;
  const activeRemindersCount = reminders.filter(r => !r.isCompleted).length;

  return (
    <div className={`flex h-screen w-screen overflow-hidden bg-[#fafaf8] dark:bg-zinc-950 font-sans antialiased text-zinc-900 dark:text-zinc-100 transition-colors duration-200`}>
      {/* Primary Sidebar (Desktop persistent + Mobile/Tablet slide-over drawer) */}
      <Sidebar
        currentView={currentView}
        onSelectView={(view) => { navigateToView(view); setSearchQuery(''); }}
        isAiOpen={isAiOpen}
        onToggleAi={() => setIsAiOpen(prev => !prev)}
        onOpenNewProject={handleOpenNewProject}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onImportJson={handleImportJson}
        onOpenReminders={() => handleOpenReminderForProject()}
        onOpenThemes={() => setIsThemePickerOpen(true)}
        projectCount={projects.length}
        activeCount={activeCount}
        fileCount={files.length}
        activeRemindersCount={activeRemindersCount}
        lang={lang}
        onToggleLang={toggleLanguage}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />


      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Topbar */}
        <Topbar
          currentView={currentView}
          activeCount={activeCount}
          highPriorityCount={highPriorityCount}
          onOpenNewProject={handleOpenNewProject}
          onToggleAi={() => setIsAiOpen(prev => !prev)}
          isAiOpen={isAiOpen}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (q && currentView !== 'projects') navigateToView('projects');
          }}
          lang={lang}
          onToggleLang={toggleLanguage}
          onOpenQuickActions={() => setIsNoteModalOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenReminders={() => handleOpenReminderForProject()}
          activeRemindersCount={activeRemindersCount}
          onOpenThemes={() => setIsThemePickerOpen(true)}
          isDark={isDark}
          onToggleDark={() => {
            setIsDark(prev => !prev);
            showToast(!isDark ? '🌙 Dark Mode Enabled' : '☀️ Light Mode Enabled');
          }}
          onOpenExport={() => setIsExportModalOpen(true)}
          currentUser={currentUser}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          canGoBack={historyIndex > 0}
          canGoForward={historyIndex < viewHistory.length - 1}
          onGoBack={handleGoBack}
          onGoForward={handleGoForward}
          onSelectView={navigateToView}
          selectedProject={selectedProject}
          onClearSelectedProject={() => setSelectedProject(null)}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-7 bg-[#fafaf8] dark:bg-zinc-950 pb-24 md:pb-8">
          {currentView === 'home' && (
            <HomeView
              projects={projects}
              notes={notes}
              onSaveNote={(text, title) => {
                const newNote: QuickNote = {
                  id: `note-${Date.now()}`,
                  title: title || 'Executive Scratchpad',
                  content: text,
                  createdAt: new Date().toISOString()
                };
                setNotes(prev => [newNote, ...prev]);
                showToast(lang === 'ar' ? 'تم حفظ الملاحظة بنجاح' : 'Executive note saved');
              }}
              onSelectProject={(p) => setSelectedProject(p)}
              onEditProject={handleEditProject}
              onOpenNewProject={handleOpenNewProject}
              onSwitchView={(v) => navigateToView(v)}
              onAskAiPrompt={handleAskAiPrompt}
              onUpdateStatus={handleUpdateStatus}
              onToggleTaskComplete={handleToggleDeliverable}
              onOpenReminders={() => handleOpenReminderForProject()}
              onOpenThemes={() => setIsThemePickerOpen(true)}
              onOpenFileUpload={() => setIsFileModalOpen(true)}
              onToggleAi={() => setIsAiOpen(prev => !prev)}
              lang={lang}
            />
          )}

          {currentView === 'dashboard' && (
            <DashboardView
              projects={projects}
              onSelectProject={(p) => setSelectedProject(p)}
              onEditProject={handleEditProject}
              onOpenNewProject={handleOpenNewProject}
              onSwitchView={(v) => navigateToView(v)}
              onAskAiPrompt={handleAskAiPrompt}
              onUpdateStatus={handleUpdateStatus}
              onArchiveProject={handleArchiveProject}
              onRestoreProject={handleRestoreProject}
              onToggleTaskComplete={handleToggleDeliverable}
              onClearAllData={handleClearAllData}
              lang={lang}
              onOpenNewNote={() => setIsNoteModalOpen(true)}
              onOpenFileUpload={() => setIsFileModalOpen(true)}
              onToggleAi={() => setIsAiOpen(prev => !prev)}
            />
          )}

          {currentView === 'projects' && (
            <ProjectsTableView
              projects={projects}
              onSelectProject={(p) => setSelectedProject(p)}
              onEditProject={handleEditProject}
              onDeleteProject={handleDeleteProject}
              onOpenNewProject={handleOpenNewProject}
              onUpdateStatus={handleUpdateStatus}
              onArchiveProject={handleArchiveProject}
              onRestoreProject={handleRestoreProject}
              onToggleTimer={handleToggleProjectTimer}
              onOpenReminderModal={handleOpenReminderForProject}
              initialSearchQuery={searchQuery}
              lang={lang}
            />
          )}

          {currentView === 'board' && (
            <BoardView
              projects={projects}
              onSelectProject={(p) => setSelectedProject(p)}
              onEditProject={handleEditProject}
              onUpdateStatus={handleUpdateStatus}
              onArchiveProject={handleArchiveProject}
              onRestoreProject={handleRestoreProject}
              onOpenNewProject={handleOpenNewProject}
              onToggleTimer={handleToggleProjectTimer}
              lang={lang}
            />
          )}

          {currentView === 'analytics' && (
            <PowerBiAnalyticsView
              projects={projects}
              lang={lang}
              onSwitchView={(v) => navigateToView(v)}
              onOpenNewProject={handleOpenNewProject}
              onAskAiPrompt={handleAskAiPrompt}
            />
          )}

          {currentView === 'pages' && (
            <PagesView
              docs={docs}
              onAskAiPrompt={handleAskAiPrompt}
              onAddDoc={handleAddDoc}
            />
          )}

          {currentView === 'files' && (
            <FilesView
              files={files}
              onOpenFileUpload={() => setIsFileModalOpen(true)}
              onDeleteFile={handleDeleteFile}
              lang={lang}
            />
          )}

          {currentView === 'integrations' && (
            <ConnectedToolsView
              projects={projects}
              onUpdateProjectNotes={handleUpdateProjectNotes}
              lang={lang}
            />
          )}
        </main>
      </div>

      {/* Adaptive Mobile Bottom Navigation for iPad / Phone portrait */}
      <MobileBottomNav
        currentView={currentView}
        onSelectView={(v) => navigateToView(v)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenReminders={() => handleOpenReminderForProject()}
        activeRemindersCount={activeRemindersCount}
        lang={lang}
      />

      {/* AI Copilot Side Panel */}
      <AiCopilotPanel
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        projects={projects}
        onExecuteAction={handleExecuteAction}
        onSwitchView={(v) => navigateToView(v)}
      />

      {/* Quick Actions Floating Action Menu */}
      <QuickActionsFloatingMenu
        onOpenNewTask={handleOpenNewProject}
        onOpenNewNote={() => setIsNoteModalOpen(true)}
        onToggleAi={() => setIsAiOpen(prev => !prev)}
        onOpenFileUpload={() => setIsFileModalOpen(true)}
        onOpenAnalytics={() => navigateToView('analytics')}
        onOpenReminders={() => handleOpenReminderForProject()}
        onOpenThemes={() => setIsThemePickerOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        isAiOpen={isAiOpen}
        lang={lang}
      />

      {/* Quick Note Modal */}
      <QuickNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSaveNote={handleSaveNote}
        notes={notes}
        onDeleteNote={handleDeleteNote}
        lang={lang}
      />

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        projects={projects}
        onUpload={handleAddFiles}
        lang={lang}
      />

      {/* Edit/Create Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProject}
        projectToEdit={projectToEdit}
      />

      {/* Theme Picker Modal */}
      <ThemePickerModal
        isOpen={isThemePickerOpen}
        onClose={() => setIsThemePickerOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={(theme) => {
          setCurrentTheme(theme);
          showToast(`Theme updated: ${theme}`);
        }}
        isDark={isDark}
        onToggleDark={() => {
          setIsDark(prev => !prev);
          showToast(!isDark ? '🌙 Dark Mode Enabled' : '☀️ Light Mode Enabled');
        }}
        lang={lang}
      />

      {/* Universal Export Modal (All formats: Excel, CSV, PDF, Markdown) */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        projects={projects}
        docs={docs}
        files={files}
        notes={notes}
        reminders={reminders}
        lang={lang}
      />

      {/* Task Reminders & Alarms Modal */}
      <TaskRemindersModal
        isOpen={isRemindersModalOpen}
        onClose={() => setIsRemindersModalOpen(false)}
        reminders={reminders}
        projects={projects}
        onAddReminder={handleScheduleReminder}
        onToggleCompleteReminder={handleToggleReminderCompleted}
        onDeleteReminder={handleDeleteReminder}
        onSnoozeReminder={handleSnoozeReminder}
        selectedProject={reminderTargetProject}
        lang={lang}
      />


      {/* Project Detail Drawer */}
      <ProjectDetailDrawer
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onEdit={handleEditProject}
        onToggleDeliverable={handleToggleDeliverable}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div 
          id="workspace-toast" 
          className="fixed bottom-20 sm:bottom-5 left-5 sm:left-auto sm:right-24 z-50 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150 flex items-center gap-2 border border-zinc-700/50 dark:border-zinc-200"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

