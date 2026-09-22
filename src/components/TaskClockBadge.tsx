import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, AlertCircle, CheckCircle2 } from 'lucide-react';
import { calculateCountdown, formatStopwatchTime } from '../utils/clockUtils';

interface TaskClockBadgeProps {
  targetDate?: string;
  targetTime?: string;
  isCompleted?: boolean;
  timerSeconds?: number;
  isTimerRunning?: boolean;
  onToggleTimer?: () => void;
  compact?: boolean;
}

export const TaskClockBadge: React.FC<TaskClockBadgeProps> = ({
  targetDate,
  targetTime,
  isCompleted = false,
  timerSeconds = 0,
  isTimerRunning = false,
  onToggleTimer,
  compact = false,
}) => {
  const [, setTick] = useState(0);

  // Re-render every second for real-time live clock countdown and stopwatch
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (isCompleted) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>Delivered</span>
      </span>
    );
  }

  const countdown = calculateCountdown(targetDate, targetTime);

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      {/* Active Stopwatch / Time Tracker if present or timer is running */}
      {(timerSeconds > 0 || isTimerRunning || onToggleTimer) && (
        <div 
          onClick={onToggleTimer}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-mono font-medium border transition-all cursor-pointer ${
            isTimerRunning
              ? 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800 shadow-2xs animate-pulse'
              : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-700'
          }`}
          title={isTimerRunning ? 'Pause Task Timer' : 'Start Task Timer'}
        >
          {isTimerRunning ? (
            <Pause className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400 shrink-0" />
          ) : (
            <Play className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
          )}
          <span>{formatStopwatchTime(timerSeconds)}</span>
        </div>
      )}

      {/* Live Deadline Ticker */}
      {countdown && (
        <span 
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium border font-mono ${countdown.badgeColor}`}
          title={countdown.isOverdue ? 'Task Deadline Overdue!' : `Target Deadline: ${targetDate} ${targetTime || ''}`}
        >
          <Clock className={`w-3 h-3 ${countdown.isOverdue ? 'text-red-500 animate-bounce' : 'text-zinc-400'}`} />
          <span>{countdown.formatted}</span>
        </span>
      )}
    </div>
  );
};
