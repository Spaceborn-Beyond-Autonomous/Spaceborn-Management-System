import React from 'react';

const ManagerHeader = ({ activeMenu }) => {
  const getTitle = () => {
    switch(activeMenu) {
      case 'Dashboard': return 'Dashboard';
      case 'TeamPerformance': return 'Team Performance';
      case 'Projects': return 'Projects';
      case 'TeamMembers': return 'Team Members';
      case 'ResourceAllocation': return 'Resources';
      case 'Approvals': return 'Approvals';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 fixed top-0 right-0 left-64 z-40">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input type="text" placeholder="Search..." className="w-80 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button className="relative p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default ManagerHeader;