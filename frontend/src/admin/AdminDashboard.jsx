import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, FileText, MessageSquare, Bell, LogOut, Menu, X,
  Users, CheckCircle, Clock, FileSpreadsheet
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { getDashboardStats, getReminders } from '../utils/api';
import { toast } from 'sonner';

export const AdminDashboard = ({ children, currentPage }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [stats, setStats] = useState(null);
  const [reminders, setReminders] = useState(null);
  const adminUser = localStorage.getItem('adminUser');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-kav-Catlife41056');
      return;
    }

    loadData();
  }, [navigate]);

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
        handleLogout();
      } else {
        toast.error('Failed to load dashboard data');
      }
    }
  };

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
    { id: 'enquiries', label: 'Enquiries', icon: MessageSquare, path: '/admin-kav-Catlife41056/enquiries' },
    { id: 'documents', label: 'Documents', icon: FileText, path: '/admin-kav-Catlife41056/documents' },
    { id: 'reminders', label: 'Reminders', icon: Bell, path: '/admin-kav-Catlife41056/reminders' }
  ];

  // Add Users menu only for admin
  if (adminRole === 'admin') {
    menuItems.push({ id: 'users', label: 'Users', icon: Users, path: '/admin-kav-Catlife41056/users' });
  }

  const totalReminders = (reminders?.enquiryReminders?.length || 0) + (reminders?.documentReminders?.length || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <img
              src="https://customer-assets.emergentagent.com/job_1503fdb9-25f1-41c0-817c-a287fdbfacfe/artifacts/zciobxqk_Logo%20design%20for%20a%20we.png"
              alt="KAV Auditorium"
              className="h-12 w-auto"
            />
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">Admin Panel</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{adminUser}</p>
              <p className="text-xs text-gray-500">{adminRole === 'admin' ? 'Administrator' : 'Manager'}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex pt-20">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-20 left-0 h-[calc(100vh-5rem)] bg-white border-r border-gray-200 transition-all duration-300 z-20 ${
            isSidebarOpen ? 'w-64' : 'w-0 lg:w-20'
          }`}
        >
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#D4AF37] text-black font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isSidebarOpen && <span>{item.label}</span>}
                  {item.id === 'reminders' && totalReminders > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {totalReminders}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {currentPage === 'overview' && stats && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-gray-900">{stats.totalBookings}</span>
                      <Calendar className="w-8 h-8 text-[#D4AF37]" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Pending Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-orange-600">{stats.pendingBookings}</span>
                      <Clock className="w-8 h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">New Enquiries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-blue-600">{stats.newEnquiries}</span>
                      <MessageSquare className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Upcoming Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-green-600">{stats.upcomingBookings}</span>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reminders Section */}
              {totalReminders > 0 && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-red-500" />
                      Pending Reminders ({totalReminders})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => navigate('/admin-kav-Catlife41056/reminders')}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      View All Reminders
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                  <Button
                    onClick={() => navigate('/admin-kav-Catlife41056/bookings')}
                    className="bg-[#D4AF37] text-black hover:bg-[#C19B2E]"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Manage Bookings
                  </Button>
                  <Button
                    onClick={() => navigate('/admin-kav-Catlife41056/enquiries')}
                    variant="outline"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Manage Enquiries
                  </Button>
                  <Button
                    onClick={() => navigate('/admin-kav-Catlife41056/documents')}
                    variant="outline"
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
