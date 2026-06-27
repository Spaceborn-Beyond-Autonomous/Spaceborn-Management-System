export const DEPARTMENTS = [
  'Platform and DevOps',
  'Core Systems',
  'Hardware & Integration',
  'Robotics & Simulation',
  'Founding Team',
  'AI/LLM & Perception',
  'Management',
  'CEO'
];

export const DEPARTMENT_RENAMES = {
  Operations: 'Platform and DevOps',
  Engineering: 'Core Systems',
  Design: 'Hardware & Integration',
  Sales: 'Robotics & Simulation',
  HR: 'Robotics & Simulation',
  Finance: 'Robotics & Simulation',
  Executive: 'Founding Team',
  Marketing: 'AI/LLM & Perception'
};

export const normalizeDepartment = (department) => {
  if (!department) return department;
  return DEPARTMENT_RENAMES[department] || department;
};

export const normalizeDepartments = (departments = [], options = {}) => {
  const normalized = departments
    .map(normalizeDepartment)
    .filter(Boolean)
    .filter((department) => options.includeAll || !['All', 'all', 'All Departments'].includes(department));

  const ordered = options.onlyPresent
    ? DEPARTMENTS.filter((department) => normalized.includes(department))
    : DEPARTMENTS;
  const extras = normalized.filter((department) => !DEPARTMENTS.includes(department));
  const result = [...new Set([...ordered, ...extras])];

  return options.includeAll ? [...result, 'All'] : result;
};

export const normalizeDepartmentFields = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeDepartmentFields);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        key === 'department' || key === 'dept' ? normalizeDepartment(entry) : normalizeDepartmentFields(entry)
      ])
    );
  }

  return value;
};
