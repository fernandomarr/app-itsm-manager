import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  if (!date) return '-';
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return '-';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(parsedDate);
  } catch (error) {
    return '-';
  }
}

export function formatRelativeTime(date: string | Date): string {
  if (!date) return '-';
  const now = new Date();
  const past = new Date(date);
  if (isNaN(past.getTime())) return '-';
  
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(date);
}

export function getTicketTypeColor(type: string): string {
  const colors: Record<string, string> = {
    incident: 'bg-incident text-incident-foreground',
    request: 'bg-request text-request-foreground',
    problem: 'bg-problem text-problem-foreground',
    change: 'bg-change text-change-foreground',
  };
  return colors[type] || 'bg-gray-500 text-white';
}

export function getTicketStatusColor(status: string): string {
  const colors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    critical: 'text-priority-critical',
    high: 'text-priority-high',
    medium: 'text-priority-medium',
    low: 'text-priority-low',
  };
  return colors[priority] || 'text-gray-500';
}

export function getPriorityBadgeColor(priority: string): string {
  const colors: Record<string, string> = {
    critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
}

export function getChangeTypeColor(type: string): string {
  const colors: Record<string, string> = {
    standard: 'bg-green-100 text-green-800',
    normal: 'bg-blue-100 text-blue-800',
    emergency: 'bg-red-100 text-red-800',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
}

export function getChangeStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    submitted: 'bg-blue-100 text-blue-800',
    assessing: 'bg-yellow-100 text-yellow-800',
    authorized: 'bg-green-100 text-green-800',
    scheduled: 'bg-purple-100 text-purple-800',
    implementing: 'bg-orange-100 text-orange-800',
    reviewing: 'bg-indigo-100 text-indigo-800',
    completed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function generateTicketNumber(type: string, year: number, number: number): string {
  const prefix = {
    incident: 'INC',
    request: 'REQ',
    problem: 'PRB',
    change: 'CHG',
  }[type] || 'TKT';

  return `${prefix}-${year}-${String(number).padStart(5, '0')}`;
}

export function calculateSLARemaining(slaDueAt?: string): { remaining: number; percentage: number; isBreached: boolean } {
  if (!slaDueAt) return { remaining: 0, percentage: 100, isBreached: false };

  const now = new Date().getTime();
  const due = new Date(slaDueAt).getTime();
  const remaining = due - now;

  // Assume 24 hours as baseline for percentage calculation
  const total = 24 * 60 * 60 * 1000;
  const percentage = Math.max(0, Math.min(100, (remaining / total) * 100));

  return {
    remaining,
    percentage,
    isBreached: remaining < 0,
  };
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
