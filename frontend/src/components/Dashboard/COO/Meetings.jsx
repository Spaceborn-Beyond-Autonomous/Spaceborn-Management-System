import React from 'react';
import ManagerMeetings from '../Manager/Meetings';

const Meetings = (props) => (
  <ManagerMeetings {...props} userRole={props.userRole || 'Manager'} />
);

export default Meetings;
