// src/utils/taskMapper.js

export const TASK_STATUSES = ['Pending', 'In progress', 'Completed', 'Overdue', 'Cancelled'];
export const TASK_PRIORITIES = ['low', 'medium', 'high'];

export function getTaskId(task) {
  if (!task) return undefined;
  return task._id || task.id;
}

export function normalizeTask(task) {
  if (!task) return null;

  const id = getTaskId(task);

  const title = task.title ?? task.task ?? task.name ?? '';
  const description = task.description ?? '';

  const assignedToName = task.assignedToName ?? task.assignee ?? task.name ?? '';
  const assignedToInitials =
    task.assignedToInitials ??
    task.initials ??
    getInitialsFromName(assignedToName);

  const department = task.department ?? task.dept ?? '';
  const priority = (task.priority ?? '').toString().toLowerCase();

  const dueDate = task.dueDate ?? '';
  const estimatedHours = task.estimatedHours ?? 0;

  const progress =
    task.progress === undefined || task.progress === null || task.progress === ''
      ? 0
      : Number(task.progress);

  const status = normalizeStatus(task.status);

  return {
    ...task,
    _id: id,
    id,
    title,
    description,
    assignedToName,
    assignedToInitials,
    department,
    priority: priority || undefined,
    dueDate,
    estimatedHours,
    progress: Number.isNaN(progress) ? 0 : Math.max(0, Math.min(100, progress)),
    status,
  };
}

export function normalizeTaskList(tasks) {
  if (!Array.isArray(tasks)) return [];
  return tasks.map(normalizeTask).filter(Boolean);
}

export function normalizeStatus(status) {
  if (!status) return 'Pending';
  const s = status.toString().trim();
  const lower = s.toLowerCase();

  if (lower === 'pending' || lower === 'todo') return 'Pending';
  if (lower === 'in progress' || lower === 'in-progress' || lower === 'inprogress') return 'In progress';
  if (lower === 'completed' || lower === 'done') return 'Completed';
  if (lower === 'overdue') return 'Overdue';
  if (lower === 'cancelled' || lower === 'canceled') return 'Cancelled';
  if (lower === 'review') return 'In progress';

  if (TASK_STATUSES.includes(s)) return s;
  return s;
}

export function statusToColumn(status) {
  switch (normalizeStatus(status)) {
    case 'In progress':
      return 'inProgress';
    case 'Completed':
      return 'done';
    case 'Pending':
    case 'Overdue':
    case 'Cancelled':
    default:
      return 'todo';
  }
}

export function columnToStatus(columnId) {
  switch (columnId) {
    case 'inProgress':
      return 'In progress';
    case 'done':
      return 'Completed';
    case 'todo':
    default:
      return 'Pending';
  }
}

export function groupTasksByKanban(tasks) {
  const list = normalizeTaskList(tasks);
  return {
    todo: list.filter(t => ['Pending', 'Overdue', 'Cancelled'].includes(t.status)),
    inProgress: list.filter(t => t.status === 'In progress'),
    done: list.filter(t => t.status === 'Completed'),
  };
}

export function deriveStatusFromProgress(progress) {
  if (progress >= 100) return 'Completed';
  if (progress > 0) return 'In progress';
  return 'Pending';
}

export function formatPriorityLabel(priority) {
  if (!priority) return '';
  const p = priority.toString().toLowerCase();
  return p.charAt(0).toUpperCase() + p.slice(1);
}

export function getInitialsFromName(name) {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();
}

export function isTaskOverdue(task) {
  if (!task?.dueDate || task.status === 'Completed') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

export function calculateTaskStats(tasks) {
  const list = normalizeTaskList(tasks);
  return {
    total: list.length,
    completed: list.filter(t => t.status === 'Completed').length,
    inProgress: list.filter(t => t.status === 'In progress').length,
    pending: list.filter(t => t.status === 'Pending').length,
    overdue: list.filter(t => isTaskOverdue(t) || t.status === 'Overdue').length,
  };
}

export function filterTasks(tasks, { search, status, priority, department, assignee } = {}) {
  let filtered = normalizeTaskList(tasks);

  if (department && department !== 'All' && department !== 'All departments') {
    filtered = filtered.filter(t => t.department === department);
  }
  if (status && status !== 'All') {
    filtered = filtered.filter(t => t.status === status);
  }
  if (priority && priority !== 'All') {
    const p = priority.toString().toLowerCase();
    filtered = filtered.filter(t => (t.priority || '').toLowerCase() === p);
  }
  if (assignee && assignee !== 'all') {
    filtered = filtered.filter(t => t.assignedToName === assignee);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      t =>
        (t.title || '').toLowerCase().includes(q) ||
        (t.assignedToName || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q)
    );
  }

  return filtered;
}
