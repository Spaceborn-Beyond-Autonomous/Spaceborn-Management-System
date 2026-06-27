import React from 'react';
import ManagerProjects from '../Manager/Projects';

const Projects = (props) => (
  <ManagerProjects {...props} userRole={props.userRole || 'Manager'} />
);

export default Projects;
