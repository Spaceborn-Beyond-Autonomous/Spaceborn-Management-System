import React from 'react';
import ManagerAIInsights from '../Manager/AIInsights';

const AIInsights = (props) => (
  <ManagerAIInsights {...props} userRole={props.userRole || 'Manager'} />
);

export default AIInsights;
