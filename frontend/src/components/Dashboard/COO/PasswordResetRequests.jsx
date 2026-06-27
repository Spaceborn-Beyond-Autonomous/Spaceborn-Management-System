import React from 'react';
import ManagerPasswordResetRequests from '../Manager/PasswordResetRequests';

const PasswordResetRequests = (props) => (
  <ManagerPasswordResetRequests {...props} userRole={props.userRole || 'Manager'} />
);

export default PasswordResetRequests;
