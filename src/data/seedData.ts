import { Project, DocPage, UploadedFile, QuickNote, TaskReminder } from '../types';

// The user requested to remove all default examples, projects, and tasks
export const INITIAL_PROJECTS: Project[] = [];

export const INITIAL_DOCS: DocPage[] = [
  {
    id: 'doc-playbook',
    title: 'Tartibat Lead Strategic Playbook',
    icon: '📋',
    category: 'Executive Protocol',
    summary: 'Standard operating principles for high-stakes deliverables, VIP protocols, and milestone tracking.',
    content: `# Tartibat Executive Project Playbook
**Lead:** Mohammed Noor
**Workspace:** Strategic Delivery & AI Operations

### Core Operating Pillars:
1. **VIP & Sovereign Protocol:** Flawless attendee accreditation, luxury credentials, and fast-track transit.
2. **Interactive Tech Delivery:** Real-time interactive staging, LED curved installations, and robust offline redundancy.
3. **Smart Priority Prioritization:** Automated urgency re-ranking factoring in due dates and completion bottlenecks.
4. **Cloud Persistence:** Continuous Firebase Firestore synchronization with Google Authentication.`,
    updatedAt: new Date().toISOString().split('T')[0]
  }
];

export const INITIAL_FILES: UploadedFile[] = [];

export const INITIAL_NOTES: QuickNote[] = [];

export const INITIAL_REMINDERS: TaskReminder[] = [];
