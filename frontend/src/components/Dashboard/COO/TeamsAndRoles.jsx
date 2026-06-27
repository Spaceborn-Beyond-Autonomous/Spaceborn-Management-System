import React from 'react';
import ManagerTeamsAndRoles from '../Manager/TeamsAndRoles';

const TeamsAndRoles = (props) => (
  <ManagerTeamsAndRoles {...props} userRole={props.userRole || 'Manager'} />
);

export default TeamsAndRoles;
