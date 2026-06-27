const ROLE_HIERARCHY = {
  CEO: 4,
  COO: 3,
  Manager: 2,
  'Team Lead': 1,
  'Co-Head': 1,
  'CO Head': 1,
  Member: 0,
  HR: 0
};

const canTerminateUser = (actor = {}, target = {}) => {
  if (!actor || !target) return false;

  if (actor.role === 'CEO') return true;
  if (actor.role === 'COO') return target.role !== 'CEO';
  if (actor.role === 'Manager') return !['CEO', 'COO'].includes(target.role);
  return false;
};

const getTerminationReason = (actorRole, targetRole) => {
  if (!canTerminateUser({ role: actorRole }, { role: targetRole })) {
    return 'You do not have permission to terminate this employee.';
  }

  return 'Termination requested successfully.';
};

module.exports = {
  ROLE_HIERARCHY,
  canTerminateUser,
  getTerminationReason
};
