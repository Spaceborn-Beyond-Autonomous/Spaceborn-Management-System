const Task = require('../models/Task');
const User = require('../models/User');
const Meeting = require('../models/Meeting');
const Resource = require('../models/Resource');
const ResourceRequest = require('../models/ResourceRequest');
const Report = require('../models/Report');
const Leave = require('../models/Leave');

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const getId = (value) => {
  if (!value) return '';
  if (value._id) return String(value._id);
  return String(value);
};

const sameId = (left, right) => getId(left) === getId(right);

const getUserName = (user) => {
  if (!user) return 'Unknown';
  return user.name || user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || 'Unknown';
};

const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const isTaskOverdue = (task) => {
  if (!task?.dueDate || task.status === 'Completed') return false;
  const due = parseDate(task.dueDate);
  if (!due) return false;
  due.setHours(0, 0, 0, 0);
  return due < startOfToday();
};

const formatPriority = (priority) => {
  const value = (priority || 'medium').toString().toLowerCase();
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const formatDueLabel = (dateValue) => {
  const date = parseDate(dateValue);
  if (!date) return 'TBD';

  const today = startOfToday();
  const due = new Date(date);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due - today) / MS_PER_DAY);

  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const dateParts = (dateValue) => {
  const date = parseDate(dateValue) || new Date();
  return {
    date: String(date.getDate()),
    month: date.toLocaleDateString('en-US', { month: 'short' }),
    fullDate: date.toISOString().split('T')[0],
  };
};

const taskBelongsToUser = (task, user) => {
  if (!task || !user) return false;
  const name = getUserName(user);
  return sameId(task.assignedTo, user._id) || sameId(task.assignedTo, user.id) || task.assignedToName === name;
};

const toUserDto = (user, allTasks = []) => {
  const name = getUserName(user);
  const userTasks = allTasks.filter(task => taskBelongsToUser(task, user));

  return {
    id: getId(user._id || user.id),
    _id: getId(user._id || user.id),
    employeeId: user.employeeId,
    name,
    initials: getInitials(name),
    email: user.email || '',
    phone: user.phone || '',
    role: user.designation || user.role || 'Member',
    systemRole: user.role || 'Member',
    department: user.department || '',
    team: user.team || '',
    manager: user.manager || '',
    joinDate: user.joinDate || user.createdAt,
    status: user.isActive === false ? 'Inactive' : 'Active',
    tasksCompleted: userTasks.filter(task => task.status === 'Completed').length,
    tasksInProgress: userTasks.filter(task => task.status === 'In progress').length,
    tasks: userTasks.filter(task => task.status !== 'Completed').length,
  };
};

const taskStats = (tasks) => {
  const total = tasks.length;
  const completed = tasks.filter(task => task.status === 'Completed').length;
  const inProgress = tasks.filter(task => task.status === 'In progress').length;
  const pending = tasks.filter(task => task.status === 'Pending').length;
  const overdue = tasks.filter(task => task.status === 'Overdue' || isTaskOverdue(task)).length;

  return {
    total,
    completed,
    inProgress,
    pending,
    overdue,
    completionRate: total ? Math.round((completed / total) * 100) : 0,
    averageProgress: total ? Math.round(tasks.reduce((sum, task) => sum + (Number(task.progress) || 0), 0) / total) : 0,
  };
};

const buildDepartmentProgress = (departments, users, tasks) => {
  return departments.map(department => {
    const departmentUsers = users.filter(user => user.department === department && user.isActive !== false);
    const departmentTasks = tasks.filter(task => task.department === department);
    const stats = taskStats(departmentTasks);

    return {
      name: department,
      members: departmentUsers.length,
      progress: stats.completionRate,
      completedTasks: stats.completed,
      pendingTasks: Math.max(0, stats.total - stats.completed),
    };
  });
};

const buildTopPerformers = (users, tasks, reports, limit = 5) => {
  const reportCountByName = new Map();
  reports.forEach(report => {
    const name = report.userName || report.name;
    if (name) reportCountByName.set(name, (reportCountByName.get(name) || 0) + 1);
  });

  return users
    .filter(user => user.isActive !== false)
    .map(user => {
      const dto = toUserDto(user, tasks);
      const score = dto.tasksCompleted + (reportCountByName.get(dto.name) || 0);
      return {
        name: dto.name,
        role: dto.role,
        department: dto.department,
        tasks: score,
        initials: dto.initials,
        avatar: dto.initials,
      };
    })
    .sort((a, b) => b.tasks - a.tasks)
    .slice(0, limit);
};

const buildUpcomingMeetings = (meetings, department = null, limit = 5, compactDate = false) => {
  const today = startOfToday();

  return meetings
    .filter(meeting => {
      const meetingDate = parseDate(meeting.date);
      if (!meetingDate || meetingDate < today) return false;
      if (!department) return true;
      return meeting.department === department || meeting.department === 'All';
    })
    .sort((a, b) => parseDate(a.date) - parseDate(b.date))
    .slice(0, limit)
    .map(meeting => {
      const parts = dateParts(meeting.date);
      return {
        id: getId(meeting._id),
        date: compactDate ? parts.date : parts.fullDate,
        month: parts.month,
        title: meeting.title,
        dept: meeting.department,
        department: meeting.department,
        time: meeting.time,
        status: meeting.status === 'upcoming' ? 'Pending' : meeting.status,
        duration: meeting.duration || '1 hour',
      };
    });
};

const buildResourceRequests = (requests, department = null, limit = 5, compactDate = false) => {
  return requests
    .filter(request => !department || request.department === department)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, limit)
    .map(request => {
      const parts = dateParts(request.createdAt);
      return {
        id: getId(request._id),
        date: compactDate ? parts.date : parts.fullDate,
        month: parts.month,
        item: request.resourceName,
        requester: request.requesterName,
        status: request.status,
        priority: request.priority || 'medium',
        department: request.department,
      };
    });
};

const buildActionItems = (tasks, requests, leaves, department = null, limit = 5) => {
  const pendingRequests = requests
    .filter(request => request.status === 'pending' && (!department || request.department === department))
    .map(request => ({
      id: getId(request._id),
      title: `Approve ${request.resourceName}`,
      due: 'Today',
      priority: formatPriority(request.priority || 'high'),
      status: 'pending',
      category: 'approval',
    }));

  const pendingLeaves = leaves
    .filter(leave => leave.status === 'Pending' && (!department || leave.department === department))
    .map(leave => ({
      id: getId(leave._id),
      title: `Review leave request - ${leave.userName}`,
      due: formatDueLabel(leave.startDate),
      priority: 'Medium',
      status: 'pending',
      category: 'leave',
    }));

  const priorityTasks = tasks
    .filter(task => {
      if (department && task.department !== department) return false;
      if (task.status === 'Completed') return false;
      return task.priority === 'high' || isTaskOverdue(task);
    })
    .map(task => ({
      id: getId(task._id),
      title: task.title,
      due: formatDueLabel(task.dueDate),
      priority: isTaskOverdue(task) ? 'High' : formatPriority(task.priority),
      status: task.status || 'pending',
      category: 'task',
    }));

  return [...pendingRequests, ...pendingLeaves, ...priorityTasks].slice(0, limit);
};

const buildRecentActivity = (tasks, reports, leaves, requests, department = null, limit = 8) => {
  const matchesDepartment = item => !department || item.department === department;

  const activities = [
    ...tasks
      .filter(task => task.status === 'Completed' && matchesDepartment(task))
      .map(task => ({
        action: `${task.assignedToName || 'A team member'} completed ${task.title}`,
        time: task.updatedAt || task.createdAt,
        user: task.assignedToName || 'Team',
        type: 'task',
      })),
    ...reports
      .filter(matchesDepartment)
      .map(report => ({
        action: `${report.userName} submitted a daily report`,
        time: report.submittedAt || report.createdAt,
        user: report.userName,
        type: 'report',
      })),
    ...leaves
      .filter(leave => leave.status === 'Approved' && matchesDepartment(leave))
      .map(leave => ({
        action: `${leave.userName}'s leave request was approved`,
        time: leave.approvedOn || leave.updatedAt || leave.createdAt,
        user: leave.userName,
        type: 'leave',
      })),
    ...requests
      .filter(matchesDepartment)
      .map(request => ({
        action: `${request.requesterName} requested ${request.resourceName}`,
        time: request.createdAt,
        user: request.requesterName,
        type: 'resource',
      })),
  ];

  return activities
    .filter(activity => activity.time)
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, limit);
};

const getAllDashboardCollections = async () => {
  const [users, tasks, meetings, resources, resourceRequests, reports, leaves] = await Promise.all([
    User.find({}).select('-password').lean(),
    Task.find({}).lean(),
    Meeting.find({}).lean(),
    Resource.find({}).lean(),
    ResourceRequest.find({}).lean(),
    Report.find({}).lean(),
    Leave.find({}).lean(),
  ]);

  return { users, tasks, meetings, resources, resourceRequests, reports, leaves };
};

const getDepartmentUsers = (users, department) => {
  return users.filter(user => user.department === department && user.isActive !== false);
};

const getDepartmentTasks = (tasks, department) => {
  return tasks.filter(task => task.department === department);
};

const hasCompanyWideAccess = (user) => ['CEO', 'COO', 'Manager'].includes(user?.role);

const getMemberTasks = (tasks, user) => {
  return tasks.filter(task => taskBelongsToUser(task, user));
};

const getDepartments = (users, tasks) => {
  return [
    ...new Set([
      ...users.map(user => user.department).filter(Boolean),
      ...tasks.map(task => task.department).filter(Boolean),
    ]),
  ];
};

const buildTeamLeadPayload = async (currentUser) => {
  const { users, tasks, reports } = await getAllDashboardCollections();
  const department = currentUser.department || '';
  const departmentMembers = getDepartmentUsers(users, department).filter(user => user.role === 'Member');
  const departmentTasks = getDepartmentTasks(tasks, department);
  const stats = taskStats(departmentTasks);
  const oneWeekAgo = new Date(Date.now() - 7 * MS_PER_DAY);
  const completedThisWeek = departmentTasks.filter(task => {
    const date = parseDate(task.updatedAt || task.createdAt);
    return task.status === 'Completed' && date && date >= oneWeekAgo;
  }).length;

  const teamMembers = departmentMembers.map(user => toUserDto(user, departmentTasks));
  const dailySummaries = reports
    .filter(report => report.department === department)
    .sort((a, b) => new Date(b.submittedAt || b.createdAt || 0) - new Date(a.submittedAt || a.createdAt || 0))
    .slice(0, 5)
    .map(report => ({
      id: getId(report._id),
      initials: getInitials(report.userName),
      name: report.userName,
      summary: report.completedTasks || report.ongoingWork || report.nextDayPlan || 'Daily report submitted.',
      date: report.date || report.submittedAt || report.createdAt,
    }));

  const userName = currentUser.name || getUserName(currentUser);

  return {
    name: userName,
    initials: getInitials(userName),
    role: 'Team Lead',
    title: `${currentUser.designation || 'Team Lead'} - ${department || 'Department'}`,
    description: `Leading the ${department || 'assigned'} team with focus on delivery, blockers, and daily progress.`,
    openTasks: departmentTasks.filter(task => task.status !== 'Completed').length,
    overdueTasks: stats.overdue,
    inProgress: stats.inProgress,
    blocked: departmentTasks.filter(task => task.status === 'Overdue' || isTaskOverdue(task)).length,
    completedThisWeek,
    blockedTasks: departmentTasks
      .filter(task => task.status === 'Overdue' || isTaskOverdue(task))
      .slice(0, 5)
      .map(task => ({
        id: getId(task._id),
        title: task.title,
        status: task.status === 'Overdue' ? 'Overdue' : 'Blocked',
        priority: task.priority || 'high',
        assignedTo: task.assignedToName || 'Unassigned',
        dueDate: task.dueDate,
      })),
    teamMembers,
    dailySummaries,
  };
};

const buildMemberPayload = async (currentUser) => {
  const { tasks } = await getAllDashboardCollections();
  const myTasks = getMemberTasks(tasks, currentUser);
  const stats = taskStats(myTasks);
  const dueTasks = myTasks
    .filter(task => task.status !== 'Completed' && task.dueDate)
    .sort((a, b) => parseDate(a.dueDate) - parseDate(b.dueDate))
    .slice(0, 5);

  const onTimeTasks = myTasks.filter(task => task.status === 'Completed' || !isTaskOverdue(task)).length;
  const estimatedHours = myTasks.reduce((sum, task) => sum + (Number(task.estimatedHours) || 0), 0);

  return {
    profile: {
      name: currentUser.name || getUserName(currentUser),
      role: currentUser.role || 'Member',
      title: `${currentUser.department || 'Department'} - ${currentUser.designation || currentUser.role || 'Member'}`,
      description: `Working in ${currentUser.department || 'your department'} with ${myTasks.length} assigned task${myTasks.length === 1 ? '' : 's'}.`,
    },
    myTasks,
    sprintOverview: {
      overallProgress: stats.averageProgress,
      tasksOnTime: myTasks.length ? Math.round((onTimeTasks / myTasks.length) * 100) : 0,
      hoursLogged: estimatedHours,
    },
    upcomingDeadlines: dueTasks.map(task => ({
      id: getId(task._id),
      name: task.title,
      dueDate: formatDueLabel(task.dueDate),
      priority: task.priority || 'medium',
    })),
  };
};

exports.getCeoDashboard = async (req, res) => {
  try {
    const { users, tasks, meetings, resources, resourceRequests, reports, leaves } = await getAllDashboardCollections();
    const departments = getDepartments(users, tasks);
    const stats = taskStats(tasks);
    const activeUsers = users.filter(user => user.isActive !== false);
    const pendingResourceRequests = resourceRequests.filter(request => request.status === 'pending');
    const resourceTotal = resources.reduce((sum, resource) => sum + (Number(resource.total) || 0), 0);
    const resourceAllocated = resources.reduce((sum, resource) => sum + (Number(resource.allocated) || 0), 0);
    const oneWeekAgo = new Date(Date.now() - 7 * MS_PER_DAY);
    const tasksThisWeek = tasks.filter(task => {
      const date = parseDate(task.createdAt || task.updatedAt);
      return date && date >= oneWeekAgo;
    });
    const tasksThisWeekCompleted = tasksThisWeek.filter(task => task.status === 'Completed').length;

    const departmentProgress = buildDepartmentProgress(departments, users, tasks);
    const atRiskProjects = departmentProgress
      .filter(department => getDepartmentTasks(tasks, department.name).some(isTaskOverdue))
      .map(department => ({ name: `${department.name} delivery`, completion: department.progress }));

    res.json({
      stats: {
        totalMembers: activeUsers.length,
        departments: departments.length,
        sprintVelocity: stats.completionRate,
        activeProjects: departments.filter(department => getDepartmentTasks(tasks, department).some(task => task.status !== 'Completed')).length,
        tasksThisWeek: tasksThisWeek.length ? Math.round((tasksThisWeekCompleted / tasksThisWeek.length) * 100) : 0,
        overdueTasks: stats.overdue,
        resourceUtilization: resourceTotal ? Math.round((resourceAllocated / resourceTotal) * 100) : 0,
        resourceConflicts: resources.filter(resource => (Number(resource.allocated) || 0) > (Number(resource.total) || 0)).length,
        pendingApprovals: pendingResourceRequests.length,
      },
      atRiskProjects,
      delayedProjects: atRiskProjects.slice(1),
      departmentProgress,
      topPerformers: buildTopPerformers(users, tasks, reports, 5),
      upcomingMeetings: buildUpcomingMeetings(meetings, null, 5, false),
      resourceRequests: buildResourceRequests(resourceRequests, null, 5, false),
      actionItems: buildActionItems(tasks, resourceRequests, leaves, null, 6),
      recentActivity: buildRecentActivity(tasks, reports, leaves, resourceRequests, null, 8),
      teamHealth: {
        active: activeUsers.length,
        newThisMonth: activeUsers.filter(user => {
          const joinDate = parseDate(user.joinDate || user.createdAt);
          const now = new Date();
          return joinDate && joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
        }).length,
        terminated: users.filter(user => user.isActive === false).length,
      },
    });
  } catch (error) {
    console.error('CEO dashboard error:', error);
    res.status(500).json({ message: error.message || 'Failed to load CEO dashboard' });
  }
};

exports.getManagerDashboard = async (req, res) => {
  try {
    const { users, tasks, meetings, resourceRequests, reports, leaves } = await getAllDashboardCollections();
    const department = hasCompanyWideAccess(req.user) ? null : req.user.department;
    const scopedUsers = department ? getDepartmentUsers(users, department) : users.filter(user => user.isActive !== false);
    const scopedTasks = department ? getDepartmentTasks(tasks, department) : tasks;
    const scopedReports = department ? reports.filter(report => report.department === department) : reports;
    const scopedLeaves = department ? leaves.filter(leave => leave.department === department) : leaves;
    const stats = taskStats(scopedTasks);
    const departments = department ? [department] : getDepartments(users, tasks);
    const departmentProgress = buildDepartmentProgress(departments, users, tasks);
    const teamMembers = scopedUsers.filter(user => user.role !== 'CEO');

    res.json({
      departmentProgress,
      upcomingMeetings: buildUpcomingMeetings(meetings, department, 5, true),
      resourceRequests: buildResourceRequests(resourceRequests, department, 5, true),
      actionItems: buildActionItems(scopedTasks, resourceRequests, leaves, department, 6),
      recentActivity: buildRecentActivity(scopedTasks, reports, leaves, resourceRequests, department, 8),
      stats: {
        totalTasks: stats.total,
        completedTasks: stats.completed,
        pendingApprovals: buildActionItems(scopedTasks, resourceRequests, leaves, department).filter(item => item.status === 'pending').length,
        resourceRequests: resourceRequests.filter(request => (!department || request.department === department) && request.status === 'pending').length,
        teamMembers: teamMembers.length,
        projectsActive: scopedTasks.filter(task => task.status !== 'Completed').length,
        sprintVelocity: stats.completionRate,
      },
      topPerformers: buildTopPerformers(teamMembers, scopedTasks, scopedReports, 5),
      teamHealth: {
        newJoinees: teamMembers.filter(user => {
          const joinDate = parseDate(user.joinDate || user.createdAt);
          const now = new Date();
          return joinDate && joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
        }).length,
        terminated: users.filter(user => (!department || user.department === department) && user.isActive === false).length,
        onLeave: scopedLeaves.filter(leave => leave.status === 'Approved').length,
        satisfaction: stats.completionRate,
      },
    });
  } catch (error) {
    console.error('Manager dashboard error:', error);
    res.status(500).json({ message: error.message || 'Failed to load manager dashboard' });
  }
};

exports.getTeamLeadDashboard = async (req, res) => {
  try {
    res.json(await buildTeamLeadPayload(req.user));
  } catch (error) {
    console.error('Team lead dashboard error:', error);
    res.status(500).json({ message: error.message || 'Failed to load team lead dashboard' });
  }
};

exports.getMemberDashboard = async (req, res) => {
  try {
    res.json(await buildMemberPayload(req.user));
  } catch (error) {
    console.error('Member dashboard error:', error);
    res.status(500).json({ message: error.message || 'Failed to load member dashboard' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const { users, tasks } = await getAllDashboardCollections();
    const stats = taskStats(tasks);

    res.json({
      totalEmployees: users.filter(user => user.isActive !== false).length,
      activeProjects: getDepartments(users, tasks).length,
      completedTasks: stats.completed,
      pendingTasks: stats.pending,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load dashboard stats' });
  }
};

exports.getManagerDepartmentProgress = async (req, res) => {
  try {
    const { users, tasks } = await getAllDashboardCollections();
    const departments = hasCompanyWideAccess(req.user) ? getDepartments(users, tasks) : [req.user.department];
    res.json(buildDepartmentProgress(departments, users, tasks));
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load department progress' });
  }
};

exports.getManagerUpcomingMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({}).lean();
    const department = hasCompanyWideAccess(req.user) ? null : req.user.department;
    res.json(buildUpcomingMeetings(meetings, department, 5, true));
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load meetings' });
  }
};

exports.getManagerResourceRequests = async (req, res) => {
  try {
    const requests = await ResourceRequest.find({}).lean();
    const department = hasCompanyWideAccess(req.user) ? null : req.user.department;
    res.json(buildResourceRequests(requests, department, 5, true));
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load resource requests' });
  }
};

exports.getManagerActionItems = async (req, res) => {
  try {
    const { tasks, resourceRequests, leaves } = await getAllDashboardCollections();
    const department = hasCompanyWideAccess(req.user) ? null : req.user.department;
    const scopedTasks = department ? getDepartmentTasks(tasks, department) : tasks;
    res.json(buildActionItems(scopedTasks, resourceRequests, leaves, department, 6));
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load action items' });
  }
};

exports.getManagerRecentActivity = async (req, res) => {
  try {
    const { tasks, reports, leaves, resourceRequests } = await getAllDashboardCollections();
    const department = hasCompanyWideAccess(req.user) ? null : req.user.department;
    const scopedTasks = department ? getDepartmentTasks(tasks, department) : tasks;
    res.json(buildRecentActivity(scopedTasks, reports, leaves, resourceRequests, department, 8));
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load recent activity' });
  }
};

exports.getTeamLeadProfile = async (req, res) => {
  try {
    const payload = await buildTeamLeadPayload(req.user);
    res.json({
      name: payload.name,
      initials: payload.initials,
      role: payload.role,
      title: payload.title,
      description: payload.description,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load profile' });
  }
};

exports.getTeamLeadStats = async (req, res) => {
  try {
    const payload = await buildTeamLeadPayload(req.user);
    res.json(payload);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load stats' });
  }
};

exports.submitTeamLeadDailyReport = async (req, res) => {
  try {
    const report = await Report.create({
      userId: getId(req.user._id || req.user.id),
      userName: req.user.name,
      userRole: req.user.role,
      department: req.user.department || '',
      employeeId: req.user.employeeId,
      date: new Date().toISOString().split('T')[0],
      completedTasks: req.body.highlights || '',
      ongoingWork: req.body.summary || '',
      issuesFaced: req.body.challenges || '',
      nextDayPlan: req.body.tomorrowPlan || '',
      status: 'submitted',
      submittedAt: new Date(),
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to submit daily report' });
  }
};

exports.getTeamLeadMembers = async (req, res) => {
  try {
    const { users, tasks } = await getAllDashboardCollections();
    const department = req.user.department;
    const search = (req.query.search || '').toLowerCase();
    const role = req.query.role;
    const status = req.query.status;

    let members = getDepartmentUsers(users, department)
      .filter(user => req.user.role === 'Team Lead' ? user.role === 'Member' : user.role !== 'CEO')
      .map(user => toUserDto(user, tasks));

    if (search) {
      members = members.filter(member =>
        member.name.toLowerCase().includes(search) ||
        member.email.toLowerCase().includes(search) ||
        member.role.toLowerCase().includes(search)
      );
    }

    if (role && role !== 'all') {
      members = members.filter(member => member.role === role || member.systemRole === role);
    }

    if (status && status !== 'all') {
      members = members.filter(member => member.status === status);
    }

    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load team members' });
  }
};

exports.getTeamLeadPerformance = async (req, res) => {
  try {
    const { users, tasks } = await getAllDashboardCollections();
    const department = req.user.department;
    const search = (req.query.search || '').toLowerCase();

    let members = getDepartmentUsers(users, department)
      .filter(user => req.user.role === 'Team Lead' ? user.role === 'Member' : user.role !== 'CEO')
      .map(user => {
        const dto = toUserDto(user, tasks);
        const assigned = dto.tasks + dto.tasksCompleted;
        const productivity = assigned ? Math.round((dto.tasksCompleted / assigned) * 100) : 0;

        return {
          id: dto.id,
          name: dto.name,
          role: dto.role,
          tasks: assigned,
          completed: dto.tasksCompleted,
          productivity,
          codeQuality: productivity,
          avatar: dto.initials,
          efficiency: productivity,
          onTimeDelivery: productivity,
        };
      });

    if (search) {
      members = members.filter(member =>
        member.name.toLowerCase().includes(search) ||
        member.role.toLowerCase().includes(search)
      );
    }

    res.json({ members });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load team performance' });
  }
};

exports.getMemberProfile = async (req, res) => {
  try {
    const payload = await buildMemberPayload(req.user);
    res.json(payload.profile);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load member profile' });
  }
};

exports.getMemberSprintOverview = async (req, res) => {
  try {
    const payload = await buildMemberPayload(req.user);
    res.json(payload.sprintOverview);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load sprint overview' });
  }
};

exports.getMemberUpcomingDeadlines = async (req, res) => {
  try {
    const payload = await buildMemberPayload(req.user);
    res.json(payload.upcomingDeadlines);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load upcoming deadlines' });
  }
};

exports.getMenu = (role) => (req, res) => {
  const menus = {
    manager: [
      { id: 'Dashboard', label: 'Dashboard', enabled: true },
      { id: 'TeamPerformance', label: 'Team Performance', enabled: true },
      { id: 'ResourceAllocation', label: 'Resource Allocation', enabled: true },
      { id: 'Approvals', label: 'Approvals', enabled: true },
      { id: 'Projects', label: 'Projects', enabled: true },
      { id: 'TeamMembers', label: 'Team Members', enabled: true },
      { id: 'EmployeeManagement', label: 'Employee Database', enabled: true },
      { id: 'LeaveManagement', label: 'Leave Management', enabled: true },
    ],
    'team-lead': [
      { id: 'Dashboard', label: 'Dashboard', enabled: true },
      { id: 'TaskManagement', label: 'Task Management', enabled: true },
      { id: 'TeamsAndRoles', label: 'Teams & Roles', enabled: true },
      { id: 'Resources', label: 'Resources', enabled: true },
      { id: 'Meetings', label: 'Meetings', enabled: true },
      { id: 'Notifications', label: 'Notifications', enabled: true },
    ],
    member: [
      { id: 'Dashboard', label: 'Dashboard', enabled: true },
      { id: 'MyProfile', label: 'My Profile', enabled: true },
      { id: 'DailyReport', label: 'Daily Report', enabled: true },
      { id: 'Leave', label: 'Leave', enabled: true },
      { id: 'TaskManagement', label: 'My Tasks', enabled: true },
      { id: 'Resources', label: 'Resources', enabled: true },
      { id: 'Meetings', label: 'Meetings', enabled: true },
      { id: 'Notifications', label: 'Notifications', enabled: true },
    ],
  };

  res.json(menus[role] || []);
};
