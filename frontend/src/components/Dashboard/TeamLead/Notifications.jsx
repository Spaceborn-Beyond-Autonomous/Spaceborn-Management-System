import React from 'react';
import ManagerNotifications from '../Manager/Notifications.jsx';

const Notifications = (props) => (
  <ManagerNotifications {...props} userRole={props.userRole || 'Team Lead'} />
);

export default Notifications;
