import React from 'react';
import ManagerNotifications from '../Manager/Notifications';

const Notifications = (props) => (
  <ManagerNotifications {...props} userRole={props.userRole || 'Manager'} />
);

export default Notifications;
