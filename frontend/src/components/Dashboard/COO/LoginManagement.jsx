import React from 'react';
import ManagerLoginManagement from '../Manager/LoginManagement';

const LoginManagement = (props) => (
  <ManagerLoginManagement {...props} userRole={props.userRole || 'Manager'} />
);

export default LoginManagement;
