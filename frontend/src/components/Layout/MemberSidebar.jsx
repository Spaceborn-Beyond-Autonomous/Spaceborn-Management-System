import React from 'react';

const MemberSidebar = ({ activeMenu, setActiveMenu, user }) => {
  const menuItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'MyTasks', label: 'My Tasks', icon: '✅' },
    { id: 'DailyReport', label: 'Daily Report', icon: '📝' },
    { id: 'Attendance', label: 'Attendance', icon: '⏰' },
    { id: 'LeaveRequest', label: 'Leave Request', icon: '🏖️' },
    { id: 'MyDocuments', label: 'My Documents', icon: '📄' },
    { id: 'Performance', label: 'Performance', icon: '📊' }
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-50">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Space Born</span>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-gray-100 bg-cyan-50">
        <p className="text-xs text-gray-500">Logged in as</p>
        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
        <p className="text-xs text-gray-500">{user.id} · {user.role}</p>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveMenu(item.id)}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
              activeMenu === item.id ? 'bg-cyan-50 text-cyan-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default MemberSidebar;