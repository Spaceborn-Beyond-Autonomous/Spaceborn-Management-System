import React from 'react';
import ManagerNotifications from '../Manager/Notifications.jsx';

const Notifications = (props) => (
  <ManagerNotifications {...props} userRole={props.userRole || 'Member'} />
);

export default Notifications;
