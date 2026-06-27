import React from 'react';
import ManagerTeamPerformance from '../Manager/TeamPerformance';

const TeamPerformance = (props) => (
  <ManagerTeamPerformance {...props} userRole={props.userRole || 'Manager'} />
);

export default TeamPerformance;
