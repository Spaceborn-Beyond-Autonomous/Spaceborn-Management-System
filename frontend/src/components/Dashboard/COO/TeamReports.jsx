import React from 'react';
import ManagerTeamReports from '../Manager/TeamReports';

const TeamReports = (props) => (
  <ManagerTeamReports {...props} userRole={props.userRole || 'COO'} />
);

export default TeamReports;
