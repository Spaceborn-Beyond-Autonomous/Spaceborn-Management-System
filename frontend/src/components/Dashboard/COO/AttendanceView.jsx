import React from 'react';
import ManagerAttendanceView from '../Manager/AttendanceView';

const AttendanceView = (props) => (
  <ManagerAttendanceView {...props} userRole={props.userRole || 'Manager'} />
);

export default AttendanceView;
