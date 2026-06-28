import React from 'react';
import CEONotifications from '../CEO/Notifications.jsx';

const Notifications = (props) => (
  <CEONotifications {...props} userRole={props.userRole || 'COO'} />
);

export default Notifications;
