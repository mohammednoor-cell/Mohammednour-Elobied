// Real-time countdown and stopwatch utility functions

export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isOverdue: boolean;
  isDueToday: boolean;
  totalSecondsRemaining: number;
  formatted: string;
  badgeColor: string;
}

export function calculateCountdown(targetDateStr?: string, targetTimeStr?: string): CountdownResult | null {
  if (!targetDateStr) return null;

  try {
    const timePart = targetTimeStr || '18:00';
    const targetIso = targetDateStr.includes('T') ? targetDateStr : `${targetDateStr}T${timePart}:00`;
    const targetTime = new Date(targetIso).getTime();
    if (isNaN(targetTime)) return null;

    const now = Date.now();
    const diffMs = targetTime - now;
    const isOverdue = diffMs < 0;
    const absDiffMs = Math.abs(diffMs);

    const totalSecondsRemaining = Math.floor(diffMs / 1000);
    const days = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absDiffMs / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((absDiffMs / (1000 * 60)) % 60);
    const seconds = Math.floor((absDiffMs / 1000) % 60);

    const isDueToday = days === 0 && !isOverdue;

    let formatted = '';
    let badgeColor = '';

    if (isOverdue) {
      if (days > 0) {
        formatted = `-${days}d ${hours}h ${minutes}m`;
      } else {
        formatted = `-${hours}h ${minutes}m ${seconds}s`;
      }
      badgeColor = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900';
    } else if (days > 3) {
      formatted = `${days}d ${hours}h left`;
      badgeColor = 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
    } else if (days >= 1) {
      formatted = `${days}d ${hours}h ${minutes}m`;
      badgeColor = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900';
    } else {
      // Under 24 hours: Live ticking clock
      formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      badgeColor = 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-900 animate-pulse';
    }

    return {
      days,
      hours,
      minutes,
      seconds,
      isOverdue,
      isDueToday,
      totalSecondsRemaining,
      formatted,
      badgeColor
    };
  } catch (err) {
    return null;
  }
}

export function formatStopwatchTime(totalSeconds: number = 0): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Synthesize a pleasant reminder bell chime using Web Audio API
export function playReminderChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First harmonic note (523.25 Hz = C5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.8);

    // Second harmonic note (880 Hz = A5) - delayed 120ms
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.25, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 1.2);
  } catch (e) {
    // AudioContext may require prior user interaction
  }
}

export const playAlarmChime = playReminderChime;

