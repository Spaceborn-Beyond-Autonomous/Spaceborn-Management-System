import React from 'react';
import ManagerTaskManagement from '../Manager/TaskManagement';

const TaskManagement = (props) => (
  <ManagerTaskManagement {...props} userRole={props.userRole || 'Manager'} />
);

export default TaskManagement;
