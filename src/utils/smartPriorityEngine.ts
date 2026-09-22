import { Project, DeliverableItem, ProjectPriority, ProjectStatus } from '../types';

export interface RankedTaskItem {
  id: string;
  projectId: string;
  projectName: string;
  projectClient: string;
  projectPriority: ProjectPriority;
  projectStatus: ProjectStatus;
  text: string;
  completed: boolean;
  dueDate?: string;
  dueTime?: string;
  score: number;
  tier: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
  projectProgress: number; // 0-100%
  daysUntilDue?: number;
}

/**
 * Calculates priority score and rationale for a task given its project context and due date.
 */
export function calculateTaskPriority(
  task: DeliverableItem,
  project: Project
): { score: number; tier: 'critical' | 'high' | 'medium' | 'low'; reason: string; daysUntilDue?: number } {
  if (task.completed) {
    return {
      score: 0,
      tier: 'low',
      reason: 'Completed task'
    };
  }

  let score = 20; // baseline
  const reasons: string[] = [];

  // 1. Project Urgency / Base Priority Weight
  if (project.priority === 'High') {
    score += 35;
    reasons.push('High-priority project');
  } else if (project.priority === 'Medium') {
    score += 15;
  }

  // Project Status Weight
  if (project.status === 'Review') {
    score += 25;
    reasons.push('In final QA / Review');
  } else if (project.status === 'In Progress') {
    score += 15;
  }

  // 2. Project Progress Metrics
  const deliverables = project.deliverables || [];
  const totalDeliv = deliverables.length;
  const completedDeliv = deliverables.filter(d => d.completed).length;
  const progressPercent = totalDeliv > 0 ? (completedDeliv / totalDeliv) * 100 : 0;

  // 3. Due Date Analysis (Task date takes precedence, else project date)
  const targetDateStr = task.dueDate || project.date;
  let daysDiff: number | undefined;

  if (targetDateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(targetDateStr);
    dueDate.setHours(0, 0, 0, 0);

    const diffMs = dueDate.getTime() - today.getTime();
    daysDiff = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) {
      // Overdue
      const daysOverdue = Math.abs(daysDiff);
      score += 55 + Math.min(daysOverdue * 5, 30);
      reasons.unshift(`Overdue by ${daysOverdue} day${daysOverdue > 1 ? 's' : ''}`);
    } else if (daysDiff === 0) {
      score += 45;
      reasons.unshift('Due today');
    } else if (daysDiff <= 2) {
      score += 35;
      reasons.unshift(`Due in ${daysDiff} day${daysDiff > 1 ? 's' : ''}`);
    } else if (daysDiff <= 7) {
      score += 20;
      reasons.unshift(`Due within a week (${daysDiff}d)`);
    } else if (daysDiff <= 14) {
      score += 10;
    }
  } else {
    reasons.push('No deadline specified');
  }

  // 4. Bottleneck Detection: low progress near deadline
  if (daysDiff !== undefined && daysDiff <= 7 && progressPercent < 50) {
    score += 25;
    reasons.push(`Bottleneck risk (${Math.round(progressPercent)}% done)`);
  }

  // Assign Tier based on aggregate score
  let tier: 'critical' | 'high' | 'medium' | 'low';
  if (score >= 80) {
    tier = 'critical';
  } else if (score >= 55) {
    tier = 'high';
  } else if (score >= 35) {
    tier = 'medium';
  } else {
    tier = 'low';
  }

  return {
    score,
    tier,
    reason: reasons.slice(0, 2).join(' · ') || 'Standard priority',
    daysUntilDue: daysDiff
  };
}

/**
 * Extracts and re-ranks all pending tasks across all active projects.
 */
export function reRankPendingTasks(projects: Project[]): RankedTaskItem[] {
  const allTasks: RankedTaskItem[] = [];

  projects
    .filter(p => !p.archived && p.status !== 'Completed')
    .forEach(project => {
      const deliverables = project.deliverables || [];
      const totalDeliv = deliverables.length;
      const completedDeliv = deliverables.filter(d => d.completed).length;
      const progress = totalDeliv > 0 ? Math.round((completedDeliv / totalDeliv) * 100) : 0;

      deliverables.forEach(task => {
        if (!task.completed) {
          const { score, tier, reason, daysUntilDue } = calculateTaskPriority(task, project);
          allTasks.push({
            id: task.id,
            projectId: project.id,
            projectName: project.name,
            projectClient: project.client,
            projectPriority: project.priority,
            projectStatus: project.status,
            text: task.text,
            completed: task.completed,
            dueDate: task.dueDate || project.date,
            dueTime: task.dueTime || project.time,
            score,
            tier,
            reason,
            projectProgress: progress,
            daysUntilDue
          });
        }
      });
    });

  // Sort descending by calculated score
  return allTasks.sort((a, b) => b.score - a.score);
}

/**
 * Calculates a composite smart priority score for an entire project.
 */
export function calculateProjectSmartPriority(project: Project): {
  score: number;
  tier: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
} {
  if (project.status === 'Completed' || project.archived) {
    return { score: 0, tier: 'low', reason: 'Delivered / Archived' };
  }

  let score = 20;
  const reasons: string[] = [];

  if (project.priority === 'High') {
    score += 40;
    reasons.push('High executive priority');
  } else if (project.priority === 'Medium') {
    score += 20;
  }

  if (project.status === 'Review') {
    score += 25;
    reasons.push('In Review');
  } else if (project.status === 'In Progress') {
    score += 15;
  }

  // Deliverables completion
  const delivs = project.deliverables || [];
  const total = delivs.length;
  const done = delivs.filter(d => d.completed).length;
  const pendingCount = total - done;

  if (pendingCount > 0) {
    score += Math.min(pendingCount * 4, 20);
  }

  if (project.date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const projDate = new Date(project.date);
    projDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((projDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      score += 45;
      reasons.unshift(`Past target date (${Math.abs(diffDays)}d overdue)`);
    } else if (diffDays <= 3) {
      score += 35;
      reasons.unshift(`Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`);
    } else if (diffDays <= 7) {
      score += 20;
      reasons.unshift(`Targeted this week`);
    }
  }

  let tier: 'critical' | 'high' | 'medium' | 'low' = 'low';
  if (score >= 80) tier = 'critical';
  else if (score >= 55) tier = 'high';
  else if (score >= 35) tier = 'medium';

  return {
    score,
    tier,
    reason: reasons.slice(0, 2).join(' · ') || 'Normal queue'
  };
}
