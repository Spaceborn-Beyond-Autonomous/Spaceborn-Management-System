import React from 'react';
import ManagerTeamMembers from '../Manager/TeamMembers';

const TeamMembers = (props) => (
  <ManagerTeamMembers {...props} userRole={props.userRole || 'Manager'} />
);

export default TeamMembers;
