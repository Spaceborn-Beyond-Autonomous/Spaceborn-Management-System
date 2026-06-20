import React from 'react';
import ManagerActivityMonitor from '../Manager/ActivityMonitor';

const ActivityMonitor = (props) => (
  <ManagerActivityMonitor {...props} userRole={props.userRole || 'Manager'} />
);

export default ActivityMonitor;
