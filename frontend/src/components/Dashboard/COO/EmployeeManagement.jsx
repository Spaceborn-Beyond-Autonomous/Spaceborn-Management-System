import React from 'react';
import ManagerEmployeeManagement from '../Manager/EmployeeManagement';

const EmployeeManagement = (props) => (
  <ManagerEmployeeManagement {...props} userRole={props.userRole || 'Manager'} />
);

export default EmployeeManagement;
