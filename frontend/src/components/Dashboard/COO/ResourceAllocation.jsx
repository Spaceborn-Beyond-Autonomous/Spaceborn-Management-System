import React from 'react';
import ManagerResourceAllocation from '../Manager/ResourceAllocation';

const ResourceAllocation = (props) => (
  <ManagerResourceAllocation {...props} userRole={props.userRole || 'Manager'} />
);

export default ResourceAllocation;
