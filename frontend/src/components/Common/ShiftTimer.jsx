import React, { useState, useEffect } from 'react';

const ShiftTimer = ({ user, onLogout }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loginTime, setLoginTime] = useState(null);
  const [logoutTime, setLogoutTime] = useState(null);
  const [workingHours, setWorkingHours] = useState(0);
  const [shiftStatus, setShiftStatus] = useState(null);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  // Shift timing constants
  const SHIFT_START = { hours: 8, minutes: 0 }; // 8:00 AM
  const SHIFT_END = { hours: 0, minutes: 0 }; // 12:00 AM (midnight)
  const GRACE_PERIOD = 15; // 15 minutes grace period

  useEffect(() => {
    // Load saved attendance data only on mount
    const savedAttendance = localStorage.getItem('attendance_marked');
    const savedLoginTime = localStorage.getItem('login_time');
    const savedHistory = localStorage.getItem('attendance_history');
    
    if (savedAttendance === 'true' && savedLoginTime) {
      setAttendanceMarked(true);
      setIsLoggedIn(true);
      setLoginTime(new Date(savedLoginTime));
    }
    
    if (savedHistory) {
      setAttendanceHistory(JSON.parse(savedHistory));
    }
  }, []); // Run only once on mount

  useEffect(() => {
    // Real-time clock update
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      if (loginTime) {
        const hours = (now - new Date(loginTime)) / (1000 * 60 * 60);
        setWorkingHours(hours);
        
        // Check for early logout
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        if (currentHour < SHIFT_END.hours && !isShiftEnded(now)) {
          setShowWarning(true);
          setWarningMessage('⚠️ Early logout detected! Please complete your full shift.');
        } else {
          setShowWarning(false);
        }
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [loginTime]);

  const isShiftActive = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Check if current time is within shift (8:00 AM to 12:00 AM)
    if (currentHour >= SHIFT_START.hours && currentHour < 24) {
      return true;
    }
    if (currentHour === 0 && currentMinute === 0) {
      return true;
    }
    return false;
  };

  const isShiftEnded = (time) => {
    const hour = time.getHours();
    const minute = time.getMinutes();
    return hour === SHIFT_END.hours && minute === SHIFT_END.minutes;
  };

  const calculateLateMinutes = (loginDateTime) => {
    const loginHour = loginDateTime.getHours();
    const loginMinute = loginDateTime.getMinutes();
    const startHour = SHIFT_START.hours;
    const startMinute = SHIFT_START.minutes;
    
    if (loginHour > startHour || (loginHour === startHour && loginMinute > startMinute + GRACE_PERIOD)) {
      const lateMinutes = (loginHour - startHour) * 60 + (loginMinute - startMinute);
      return lateMinutes;
    }
    return 0;
  };

  const handleMarkAttendance = () => {
    if (!isShiftActive()) {
      alert('❌ Outside working hours! Shift is 8:00 AM to 12:00 AM');
      return;
    }

    const now = new Date();
    const lateMinutes = calculateLateMinutes(now);
    let status = 'on-time';
    
    if (lateMinutes > 0) {
      status = 'late';
    }
    
    setShiftStatus(status);
    setLoginTime(now);
    setAttendanceMarked(true);
    setIsLoggedIn(true);
    
    // Save to localStorage
    localStorage.setItem('attendance_marked', 'true');
    localStorage.setItem('login_time', now.toString());
    localStorage.setItem('attendance_status', status);
    
    // Record attendance
    const attendance = {
      id: Date.now(),
      date: now.toDateString(),
      loginTime: now.toLocaleTimeString(),
      logoutTime: null,
      status: status,
      lateMinutes: lateMinutes,
      userId: user?.id || 'unknown',
      userName: user?.name || 'Unknown',
      shiftDate: now.toISOString().split('T')[0]
    };
    
    const updatedHistory = [attendance, ...attendanceHistory];
    setAttendanceHistory(updatedHistory);
    localStorage.setItem('attendance_history', JSON.stringify(updatedHistory));
    
    alert(`✅ Attendance marked at ${now.toLocaleTimeString()}`);
  };

  const handleLogout = () => {
    const now = new Date();
    const workedHours = workingHours.toFixed(2);
    const expectedHours = 16; // 8 AM to 12 AM = 16 hours
    
    let earlyLogout = false;
    let earlyMinutes = 0;
    
    if (workedHours < expectedHours - 1) {
      earlyLogout = true;
      earlyMinutes = Math.round((expectedHours - workedHours) * 60);
      setWarningMessage(`⚠️ Early logout by ${earlyMinutes} minutes!`);
    }
    
    // Update attendance record with logout time
    const updatedHistory = attendanceHistory.map(record => {
      if (record.id === attendanceHistory[0]?.id) {
        return {
          ...record,
          logoutTime: now.toLocaleTimeString(),
          hoursWorked: workedHours,
          earlyLogout: earlyLogout,
          earlyMinutes: earlyMinutes
        };
      }
      return record;
    });
    
    setAttendanceHistory(updatedHistory);
    localStorage.setItem('attendance_history', JSON.stringify(updatedHistory));
    
    // Send email notification (simulated)
    const emailData = {
      to: user?.email || 'manager@spaceborn.com',
      subject: 'Attendance Summary',
      body: `${user?.name} logged out at ${now.toLocaleTimeString()}\nWorking Hours: ${workedHours}\nStatus: ${earlyLogout ? 'Early Logout' : 'Complete Shift'}`
    };
    console.log('Email notification sent:', emailData);
    
    alert(`✅ Logged out at ${now.toLocaleTimeString()}\n📊 Total working hours: ${workedHours}\n${earlyLogout ? `⚠️ Early logout by ${earlyMinutes} minutes` : '✅ Shift completed successfully'}`);
    
    // Reset states
    localStorage.removeItem('attendance_marked');
    localStorage.removeItem('login_time');
    setAttendanceMarked(false);
    setIsLoggedIn(false);
    setLoginTime(null);
    setWorkingHours(0);
    
    if (onLogout) {
      onLogout();
    }
  };

  const getShiftProgress = () => {
    if (!loginTime) return 0;
    const now = new Date();
    const totalShiftHours = 16; // 8 AM to 12 AM = 16 hours
    const worked = workingHours;
    return Math.min((worked / totalShiftHours) * 100, 100);
  };

  const getStatusColor = () => {
    if (isLoggedIn) return 'text-green-600 bg-green-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getStatusText = () => {
    if (isLoggedIn) return '✓ Active';
    return '● Offline';
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Current Time */}
          <div className="flex items-center space-x-2">
            <span className="text-lg">⏰</span>
            <span className="text-sm font-mono font-medium text-gray-900">
              {currentTime.toLocaleTimeString()}
            </span>
            <span className="text-xs text-gray-400">
              {currentTime.toLocaleDateString()}
            </span>
          </div>
          
          <div className="h-6 w-px bg-gray-300"></div>
          
          {/* Shift Info */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Shift:</span>
            <span className="text-sm font-medium text-gray-900">8:00 AM - 12:00 AM</span>
            <span className="text-xs text-gray-400">(16 hours)</span>
          </div>
          
          {/* Status Badge */}
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </div>
          
          {/* Working Hours Progress */}
          {isLoggedIn && (
            <>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">Working Hours:</span>
                <div className="w-32">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{workingHours.toFixed(2)} hrs</span>
                    <span className="text-gray-400">/ 16 hrs</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-green-500 rounded-full h-1.5 transition-all duration-500"
                      style={{ width: `${getShiftProgress()}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Warning Alert */}
          {showWarning && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-lg animate-pulse">
              <span className="text-yellow-600 text-sm">⚠️</span>
              <span className="text-xs text-yellow-700">{warningMessage}</span>
            </div>
          )}
          
          {/* Action Buttons */}
          {!attendanceMarked ? (
            <button
              onClick={handleMarkAttendance}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Mark Attendance</span>
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Late Login Warning Banner Removed as requested */}
    </div>
  );
};

export default ShiftTimer;