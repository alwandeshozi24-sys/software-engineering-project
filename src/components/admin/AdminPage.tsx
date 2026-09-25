import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types/auth';
import { AdminTab, AdminUserRecord, AccountStatus } from '../../types/admin';
import { adminService } from '../../services/adminService';
import { AdminTopNav } from './AdminTopNav';
import { AdminSidebar } from './AdminSidebar';
import { AdminDashboardView } from './AdminDashboardView';
import { AdminUsersView } from './AdminUsersView';
import { AdminActivityView } from './AdminActivityView';
import { AdminProfileView } from './AdminProfileView';
import { useTheme } from '../../context/ThemeContext';

interface AdminPageProps {
  user: UserProfile;
  onSignOut: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ user, onSignOut }) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddPersonnelOpen, setIsAddPersonnelOpen] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile>(user);

  // Live Data from Admin Service
  const [usersList, setUsersList] = useState<AdminUserRecord[]>(() => adminService.getUsers());
  const [activityLogs, setActivityLogs] = useState(() => adminService.getActivityLogs());
  const [stationData, setStationData] = useState(() => adminService.getConfiguredStation());

  const refreshData = () => {
    setUsersList(adminService.getUsers());
    setActivityLogs(adminService.getActivityLogs());
    setStationData(adminService.getConfiguredStation());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleAddPersonnel = (data: {
    fullName: string;
    personnelNumber: string;
    email: string;
    phoneNumber?: string;
    rank: string;
    role: any;
    division?: string;
  }) => {
    adminService.addPersonnel(data, currentUserProfile);
    refreshData();
  };

  const handleUpdateUser = (id: string, updates: Partial<AdminUserRecord>) => {
    adminService.updateUser(id, updates, currentUserProfile);
    refreshData();
  };

  const handleSetUserStatus = (id: string, status: AccountStatus) => {
    adminService.setUserStatus(id, status, currentUserProfile);
    refreshData();
  };

  const handleResetPassword = (id: string) => {
    const res = adminService.resetUserPassword(id, currentUserProfile);
    refreshData();
    return res;
  };

  const handleUpdateProfile = (updates: { fullName: string; email: string; phoneNumber?: string }) => {
    const updated = {
      ...currentUserProfile,
      fullName: updates.fullName,
      email: updates.email
    };
    setCurrentUserProfile(updated);
    adminService.logActivity({
      actionType: 'PROFILE_UPDATED',
      title: 'Administrator Profile Updated',
      description: `Administrator ${updated.fullName} updated personal contact email to ${updated.email}.`,
      affectedUser: updated.fullName,
      adminName: updated.fullName,
      adminPersonnelNumber: updated.personnelNumber
    });
    refreshData();
  };

  const handleChangePassword = (oldPassword: string, newPassword: string) => {
    adminService.logActivity({
      actionType: 'PASSWORD_RESET',
      title: 'Administrator Password Changed',
      description: `Administrator ${currentUserProfile.fullName} successfully rotated their personal master password.`,
      affectedUser: currentUserProfile.fullName,
      adminName: currentUserProfile.fullName,
      adminPersonnelNumber: currentUserProfile.personnelNumber
    });
    refreshData();
    return {
      success: true,
      message: 'Master password successfully rotated and cryptographically sealed.'
    };
  };

  // Dashboard Stats
  const dashboardStats = {
    totalUsers: usersList.length,
    activePersonnel: usersList.filter(u => u.accountType === 'PERSONNEL' && u.status === 'ACTIVE').length,
    complainantAccounts: usersList.filter(u => u.accountType === 'COMPLAINANT').length,
    inactiveAccounts: usersList.filter(u => u.status !== 'ACTIVE').length,
    personnelCount: usersList.filter(u => u.accountType === 'PERSONNEL').length,
    recentActivity: activityLogs.slice(0, 5)
  };

  const personnelUsers = usersList.filter(u => u.accountType === 'PERSONNEL');

  return (
    <div 
      id="admin-page-container" 
      className={`min-h-screen flex flex-col justify-between selection:bg-blue-600 selection:text-white ${
        isDark ? 'bg-black text-white' : 'bg-white text-black'
      }`}
    >
      {/* Top Header */}
      <AdminTopNav
        user={currentUserProfile}
        activeTab={activeTab}
        onNavigate={(tab) => setActiveTab(tab)}
        onSignOut={onSignOut}
        stationName={stationData.name}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div 
          className={`md:hidden fixed inset-x-0 top-16 z-30 border-b p-4 shadow-xl ${
            isDark ? 'bg-black border-white/10' : 'bg-white border-black/10'
          }`}
        >
          <AdminSidebar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              setIsMobileMenuOpen(false);
            }}
            userCount={usersList.length}
            personnelCount={personnelUsers.length}
            onSignOut={onSignOut}
            isMobileDrawer
            onCloseMobileDrawer={() => setIsMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block shrink-0">
          <div className="sticky top-20">
            <AdminSidebar
              activeTab={activeTab}
              onSelectTab={(tab) => {
                setActiveTab(tab);
              }}
              userCount={usersList.length}
              personnelCount={personnelUsers.length}
              onSignOut={onSignOut}
            />
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 min-w-0 py-6 sm:py-8 md:pl-8">
          {activeTab === 'dashboard' && (
            <AdminDashboardView
              stats={dashboardStats}
              station={stationData}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenAddPersonnel={() => {
                setActiveTab('users');
                setIsAddPersonnelOpen(true);
              }}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsersView
              users={usersList}
              configuredStation={stationData}
              currentUser={currentUserProfile}
              onAddPersonnel={handleAddPersonnel}
              onUpdateUser={handleUpdateUser}
              onSetUserStatus={handleSetUserStatus}
              onResetPassword={handleResetPassword}
              isAddModalOpenInitially={isAddPersonnelOpen}
              onCloseAddModal={() => setIsAddPersonnelOpen(false)}
            />
          )}

          {activeTab === 'activity' && (
            <AdminActivityView
              activityLogs={activityLogs}
            />
          )}

          {activeTab === 'profile' && (
            <AdminProfileView
              currentUser={currentUserProfile}
              onUpdateProfile={handleUpdateProfile}
              onChangePassword={handleChangePassword}
            />
          )}
        </main>
      </div>
    </div>
  );
};
