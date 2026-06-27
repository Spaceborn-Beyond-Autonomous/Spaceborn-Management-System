import React from 'react';
import ManagerAutomationDashboard from '../Manager/AutomationDashboard';

const AutomationDashboard = (props) => (
  <ManagerAutomationDashboard {...props} userRole={props.userRole || 'Manager'} />
);

export default AutomationDashboard;
