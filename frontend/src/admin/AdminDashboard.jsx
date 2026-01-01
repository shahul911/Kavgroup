import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, FileText, MessageSquare, Bell, LogOut, Menu, X,
  Users, CheckCircle, Clock, FileSpreadsheet, Image, Quote
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { getDashboardStats, getReminders } from '../utils/api';
import { toast } from 'sonner';

export const AdminDashboard = ({ children, currentPage }) => {
  const navigate = useNavigate();
  // Default sidebar closed on mobile, open on desktop
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [stats, setStats] = useState(null);
  const [reminders, setReminders] = useState(null);
  const adminUser = localStorage.getItem('adminUser');

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Auto-close sidebar on mobile, auto-open on desktop
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-kav-Catlife41056');
      return;
    }

    // Define async function for data fetching
    const loadData = async () => {
      try {
        const [statsData, remindersData] = await Promise.all([
          getDashboardStats(),
          getReminders()
        ]);
        setStats(statsData);
        setReminders(remindersData);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          localStorage.removeItem('adminRole');
          navigate('/admin-kav-Catlife41056');
        }
      }
    };

    // Initial data fetch
    loadData();
    
    // Refresh data when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    };
    
    // Refresh data periodically (every 30 seconds)
    const intervalId = setInterval(loadData, 30000);
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminRole');
    navigate('/admin-kav-Catlife41056');
    toast.success('Logged out successfully');
  };

  const adminRole = localStorage.getItem('adminRole');

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Users, path: '/admin-kav-Catlife41056/dashboard' },
    { id: 'bookings', label: 'Bookings', icon: Calendar, path: '/admin-kav-Catlife41056/bookings' },
    { id: 'enquiries', label: 'Enquiries', icon: MessageSquare, path: '/admin-kav-Catlife41056/enquiries', badge: stats?.newEnquiries },
    { id: 'gallery', label: 'Gallery', icon: Image, path: '/admin-kav-Catlife41056/gallery' },
    { id: 'testimonials', label: 'Testimonials', icon: Quote, path: '/admin-kav-Catlife41056/testimonials' },
    { id: 'documents', label: 'Documents', icon: FileText, path: '/admin-kav-Catlife41056/documents' },
    { id: 'reminders', label: 'Reminders', icon: Bell, path: '/admin-kav-Catlife41056/reminders' }
  ];

  // Add Users menu only for admin
  if (adminRole === 'admin') {
    menuItems.push({ id: 'users', label: 'Users', icon: Users, path: '/admin-kav-Catlife41056/users' });
  }

  const totalReminders = (reminders?.enquiryReminders?.length || 0) + (reminders?.documentReminders?.length || 0);

  // Handle navigation and close sidebar on mobile
  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
            >
              {isSidebarOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
            <img
              src="https://customer-assets.emergentagent.com/job_1503fdb9-25f1-41c0-817c-a287fdbfacfe/artifacts/zciobxqk_Logo%20design%20for%20a%20we.png"
              alt="KAV Auditorium"
              className="h-8 sm:h-12 w-auto"
            />
            <h1 className="text-base sm:text-xl font-bold text-gray-900 hidden sm:block">Admin Panel</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Notification Bell */}
            {stats?.newEnquiries > 0 && (
              <button
                onClick={() => handleNavigation('/admin-kav-Catlife41056/enquiries')}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                title={`${stats.newEnquiries} new booking request${stats.newEnquiries > 1 ? 's' : ''}`}
              >
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center animate-pulse text-[10px] sm:text-xs">
                  {stats.newEnquiries}
                </span>
              </button>
            )}
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-900">{adminUser}</p>
              <p className="text-xs text-gray-500">{adminRole === 'admin' ? 'Administrator' : 'Manager'}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 sm:px-3"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex pt-16 sm:pt-20">
        {/* Sidebar */}
        <aside
          className={`fixed top-16 sm:top-20 left-0 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out z-30 w-64 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 lg:sticky`}
        >
          <nav className="p-3 sm:p-4 space-y-1 sm:space-y-2 overflow-y-auto h-full">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                    isActive
                      ? 'bg-[#D4AF37] text-black font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                  {item.id === 'reminders' && totalReminders > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {totalReminders}
                    </span>
                  )}
                  {item.badge > 0 && (
                    <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 p-3 sm:p-6 overflow-auto min-w-0 ${isSidebarOpen && !isMobile ? 'lg:ml-0' : ''}`}>
          {currentPage === 'overview' && stats && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Dashboard Overview</h2>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                <Card>
                  <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Total Bookings</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xl sm:text-3xl font-bold text-gray-900">{stats.totalBookings}</span>
                      <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-[#D4AF37]" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Pending</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xl sm:text-3xl font-bold text-orange-600">{stats.pendingBookings}</span>
                      <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">New Enquiries</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xl sm:text-3xl font-bold text-blue-600">{stats.newEnquiries}</span>
                      <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Upcoming</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xl sm:text-3xl font-bold text-green-600">{stats.upcomingBookings}</span>
                      <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reminders Section */}
              {totalReminders > 0 && (
                <Card className="mb-6 sm:mb-8">
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                      Pending Reminders ({totalReminders})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                    <Button
                      onClick={() => handleNavigation('/admin-kav-Catlife41056/reminders')}
                      className="bg-red-500 hover:bg-red-600 text-white text-sm sm:text-base"
                    >
                      View All Reminders
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4">
                  <Button
                    onClick={() => handleNavigation('/admin-kav-Catlife41056/bookings')}
                    className="bg-[#D4AF37] text-black hover:bg-[#C19B2E] text-sm sm:text-base w-full sm:w-auto"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Manage Bookings
                  </Button>
                  <Button
                    onClick={() => handleNavigation('/admin-kav-Catlife41056/enquiries')}
                    variant="outline"
                    className="text-sm sm:text-base w-full sm:w-auto"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Manage Enquiries
                  </Button>
                  <Button
                    onClick={() => handleNavigation('/admin-kav-Catlife41056/documents')}
                    variant="outline"
                    className="text-sm sm:text-base w-full sm:w-auto"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {currentPage !== 'overview' && children}
        </main>
      </div>
    </div>
  );
};
