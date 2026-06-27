import React from 'react';
import ManagerAccounts from '../Manager/Accounts';

const Accounts = (props) => (
  <ManagerAccounts {...props} userRole={props.userRole || 'Manager'} />
);

export default Accounts;
