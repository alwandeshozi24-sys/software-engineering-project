import React, { useState, useMemo } from 'react';
import { AdminUserRecord, AccountType, AccountStatus, ConfiguredPoliceStation } from '../../types/admin';
import { UserRole, UserProfile } from '../../types/auth';
import { 
  Users, 
  Search, 
  UserPlus, 
  ShieldCheck, 
  User, 
  KeyRound, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  X, 
  Copy, 
  Check, 
  ChevronRight,
  Shield
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface AdminUsersViewProps {
  users: AdminUserRecord[];
  configuredStation: ConfiguredPoliceStation;
  currentUser: UserProfile;
  onAddPersonnel: (data: {
    fullName: string;
    personnelNumber: string;
    email: string;
    phoneNumber?: string;
    rank: string;
    role: UserRole;
    division?: string;
  }) => void;
  onUpdateUser: (id: string, updates: Partial<AdminUserRecord>) => void;
  onSetUserStatus: (id: string, status: AccountStatus) => void;
  onResetPassword: (id: string) => { success: boolean; tempPassword: string; message: string };
  isAddModalOpenInitially?: boolean;
  onCloseAddModal?: () => void;
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({
  users,
  configuredStation,
  currentUser,
  onAddPersonnel,
  onUpdateUser,
  onSetUserStatus,
  onResetPassword,
  isAddModalOpenInitially = false,
  onCloseAddModal
}) => {
  const { isDark } = useTheme();

  // Filter States
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'PERSONNEL' | 'COMPLAINANT'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AccountStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & User Selection
  const [viewingUser, setViewingUser] = useState<AdminUserRecord | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUserRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(isAddModalOpenInitially);
  const [resetResult, setResetResult] = useState<{ user: AdminUserRecord; tempPassword: string } | null>(null);
  const [copiedResetPin, setCopiedResetPin] = useState(false);

  // Add Personnel Form State
  const [formData, setFormData] = useState({
    fullName: '',
    personnelNumber: '',
    email: '',
    phoneNumber: '011 722 4200',
    rank: 'Constable',
    role: 'CSC_OFFICER' as UserRole,
    division: 'Community Service Centre Intake'
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    rank: '',
    division: '',
    role: 'CSC_OFFICER' as UserRole | 'COMPLAINANT'
  });

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Type filter
      if (typeFilter !== 'ALL' && u.accountType !== typeFilter) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'ALL' && u.status !== statusFilter) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = u.fullName.toLowerCase().includes(q);
        const matchesId = u.identifier.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesPhone = u.phoneNumber ? u.phoneNumber.toLowerCase().includes(q) : false;
        const matchesRole = u.role.toLowerCase().includes(q);
        return matchesName || matchesId || matchesEmail || matchesPhone || matchesRole;
      }
      return true;
    });
  }, [users, typeFilter, statusFilter, searchQuery]);

  const handleOpenAddModal = () => {
    setFormData({
      fullName: '',
      personnelNumber: `POL-${Math.floor(10000 + Math.random() * 90000)}`,
      email: '',
      phoneNumber: '011 722 4200',
      rank: 'Constable',
      role: 'CSC_OFFICER',
      division: 'Community Service Centre Intake'
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleCloseAdd = () => {
    setIsAddModalOpen(false);
    if (onCloseAddModal) onCloseAddModal();
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.fullName.trim()) {
      setFormError('Official full name is required.');
      return;
    }
    if (!formData.personnelNumber.trim()) {
      setFormError('Personnel number (e.g. POL-84920) is required.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('A valid official departmental email address is required.');
      return;
    }

    try {
      onAddPersonnel({
        fullName: formData.fullName.trim(),
        personnelNumber: formData.personnelNumber.trim().toUpperCase(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        rank: formData.rank.trim(),
        role: formData.role,
        division: formData.division.trim()
      });
      handleCloseAdd();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create personnel account.');
    }
  };

  const handleStartEdit = (user: AdminUserRecord) => {
    setEditingUser(user);
    setEditFormData({
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      rank: user.rank || '',
      division: user.division || '',
      role: user.role
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    onUpdateUser(editingUser.id, {
      fullName: editFormData.fullName.trim(),
      email: editFormData.email.trim(),
      phoneNumber: editFormData.phoneNumber.trim(),
      rank: editFormData.rank.trim() || undefined,
      division: editFormData.division.trim() || undefined,
      role: editFormData.role
    });

    setEditingUser(null);
  };

  const handlePerformReset = (user: AdminUserRecord) => {
    const res = onResetPassword(user.id);
    setResetResult({
      user,
      tempPassword: res.tempPassword
    });
  };

  const handleCopyPassword = () => {
    if (resetResult?.tempPassword) {
      navigator.clipboard.writeText(resetResult.tempPassword);
      setCopiedResetPin(true);
      setTimeout(() => setCopiedResetPin(false), 2000);
    }
  };

  const getPositionText = (u: AdminUserRecord) => {
    if (u.accountType === 'COMPLAINANT') {
      return 'Complainant (Citizen)';
    }
    const roleNameMap: Record<string, string> = {
      CSC_OFFICER: 'Police Officer (CSC Frontline)',
      DETECTIVE: 'Detective (Investigating Officer)',
      COMMANDER: 'Station Commander (Supervision)',
      ADMINISTRATOR: 'System Administrator'
    };
    const roleTitle = roleNameMap[u.role] || u.role;
    return u.rank ? `${u.rank} • ${roleTitle}` : roleTitle;
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'CSC_OFFICER':
        return <span className="px-2 py-0.5 border border-blue-600/30 text-blue-600 bg-blue-600/10 text-[10px] font-mono font-bold">CSC Officer</span>;
      case 'DETECTIVE':
        return <span className="px-2 py-0.5 border border-amber-600/30 text-amber-600 bg-amber-600/10 text-[10px] font-mono font-bold">Detective</span>;
      case 'COMMANDER':
        return <span className="px-2 py-0.5 border border-emerald-600/30 text-emerald-600 bg-emerald-600/10 text-[10px] font-mono font-bold">Station Commander</span>;
      case 'ADMINISTRATOR':
        return <span className="px-2 py-0.5 border border-blue-600/30 text-blue-600 bg-blue-600/10 text-[10px] font-mono font-bold">Administrator</span>;
      case 'COMPLAINANT':
        return <span className="px-2 py-0.5 border border-slate-500/30 text-slate-400 bg-slate-500/10 text-[10px] font-mono font-bold">Complainant</span>;
      default:
        return <span className="px-2 py-0.5 border border-slate-500/30 text-slate-400 text-[10px] font-mono">{role}</span>;
    }
  };

  const getStatusBadge = (status: AccountStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 border border-emerald-600/30 text-emerald-600 bg-emerald-600/10 text-[10px] font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Active</span>
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 border border-amber-600/30 text-amber-600 bg-amber-600/10 text-[10px] font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Inactive</span>
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 border border-red-600/30 text-red-600 bg-red-600/10 text-[10px] font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>Suspended</span>
          </span>
        );
    }
  };

  return (
    <div id="admin-users-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-1">
        <div>
          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
            User Accounts & Role Governance
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Manage authorized police personnel and registered complainant accounts across the 5 SFEN roles.
          </p>
        </div>

        <button
          type="button"
          id="btn-open-add-personnel"
          onClick={handleOpenAddModal}
          className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm self-start sm:self-center"
        >
          <UserPlus size={15} />
          <span>Provision Police Personnel</span>
        </button>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className={`p-4 rounded-md border flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between ${
        isDark ? 'bg-slate-900/40 border-white/10' : 'bg-slate-50 border-black/10'
      }`}>
        {/* Type Filters */}
        <div className={`flex items-center gap-1.5 p-1 rounded-md border self-start ${
          isDark ? 'bg-black border-white/10' : 'bg-white border-black/10'
        }`}>
          <button
            type="button"
            onClick={() => setTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              typeFilter === 'ALL'
                ? 'bg-blue-600 text-white font-bold'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black'
            }`}
          >
            All Accounts ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('PERSONNEL')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              typeFilter === 'PERSONNEL'
                ? 'bg-blue-600 text-white font-bold'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black'
            }`}
          >
            Personnel ({users.filter(u => u.accountType === 'PERSONNEL').length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('COMPLAINANT')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              typeFilter === 'COMPLAINANT'
                ? 'bg-blue-600 text-white font-bold'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black'
            }`}
          >
            Complainants ({users.filter(u => u.accountType === 'COMPLAINANT').length})
          </button>
        </div>

        {/* Right: Status Filter & Search Input */}
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <select
            aria-label="Filter by account status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className={`px-3 py-2 rounded-md border text-xs font-medium focus:outline-none ${
              isDark 
                ? 'bg-black border-white/15 text-white focus:border-blue-600' 
                : 'bg-white border-black/15 text-black focus:border-blue-600'
            }`}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
            <option value="SUSPENDED">Suspended Only</option>
          </select>

          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, ID, POL#, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3.5 py-2 rounded-md border text-xs placeholder-slate-500 focus:outline-none ${
                isDark 
                  ? 'bg-black border-white/15 text-white focus:border-blue-600' 
                  : 'bg-white border-black/15 text-black focus:border-blue-600'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className={`rounded-md border overflow-hidden ${
        isDark ? 'bg-black border-white/10' : 'bg-white border-black/10'
      }`}>
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users size={28} className="mx-auto text-slate-500" />
            <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>No user accounts found</p>
            <p className="text-xs text-slate-500">
              Try adjusting your search criteria or switch the account filter.
            </p>
          </div>
        ) : (
          <div className={`divide-y ${isDark ? 'divide-white/10' : 'divide-black/10'}`}>
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                onClick={() => setViewingUser(u)}
                className={`p-4 sm:p-5 transition-colors flex items-center justify-between gap-4 cursor-pointer group ${
                  isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'
                }`}
              >
                {/* User Identity */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded bg-blue-600 flex items-center justify-center shrink-0 font-bold text-sm text-white uppercase">
                    {u.fullName.charAt(0)}
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-bold text-sm sm:text-base group-hover:text-blue-600 transition-colors truncate ${
                        isDark ? 'text-white' : 'text-black'
                      }`}>
                        {u.fullName}
                      </h3>
                      {getRoleBadge(u.role)}
                      {getStatusBadge(u.status)}
                    </div>
                    <p className={`text-xs font-medium truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {getPositionText(u)} • <span className="font-mono text-blue-600">{u.identifier}</span> • {u.email}
                    </p>
                  </div>
                </div>

                {/* Right Arrow / Action */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-blue-600 font-semibold hidden sm:inline">
                    Manage
                  </span>
                  <ChevronRight size={18} className="text-slate-500 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL: ADD POLICE PERSONNEL
          ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className={`w-full max-w-xl rounded-md border shadow-2xl p-6 space-y-5 ${
            isDark ? 'bg-black border-white/15 text-white' : 'bg-white border-black/15 text-black'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck size={15} />
                  <span>Police Official Provisioning</span>
                </div>
                <h3 className={`text-xl font-extrabold mt-1 ${isDark ? 'text-white' : 'text-black'}`}>
                  Provision Police Personnel Account
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Police officials must not register themselves. System administrators provision authorized roles.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseAdd}
                className={`p-1.5 rounded-md border cursor-pointer ${
                  isDark ? 'border-white/10 text-slate-400 hover:text-white' : 'border-black/10 text-slate-600 hover:text-black'
                }`}
              >
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitAdd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Official Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Ndlovu"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-md border text-xs focus:outline-none ${
                      isDark ? 'bg-black border-white/15 text-white focus:border-blue-600' : 'bg-white border-black/15 text-black focus:border-blue-600'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Personnel Number (POL-ID) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. POL-10824"
                    value={formData.personnelNumber}
                    onChange={(e) => setFormData({ ...formData, personnelNumber: e.target.value })}
                    className={`w-full px-3 py-2 rounded-md border text-xs font-mono focus:outline-none ${
                      isDark ? 'bg-black border-white/15 text-white focus:border-blue-600' : 'bg-white border-black/15 text-black focus:border-blue-600'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Departmental Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="officer@police.sfen.gov"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 rounded-md border text-xs focus:outline-none ${
                      isDark ? 'bg-black border-white/15 text-white focus:border-blue-600' : 'bg-white border-black/15 text-black focus:border-blue-600'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Official Contact Number
                  </label>
                  <input
                    type="text"
                    placeholder="011 722 4200"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className={`w-full px-3 py-2 rounded-md border text-xs focus:outline-none ${
                      isDark ? 'bg-black border-white/15 text-white focus:border-blue-600' : 'bg-white border-black/15 text-black focus:border-blue-600'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Police Rank *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Constable / Sergeant / Captain"
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                    className={`w-full px-3 py-2 rounded-md border text-xs focus:outline-none ${
                      isDark ? 'bg-black border-white/15 text-white focus:border-blue-600' : 'bg-white border-black/15 text-black focus:border-blue-600'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    SFEN Role Assignment *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className={`w-full px-3 py-2 rounded-md border text-xs focus:outline-none ${
                      isDark ? 'bg-black border-white/15 text-white focus:border-blue-600' : 'bg-white border-black/15 text-black focus:border-blue-600'
                    }`}
                  >
                    <option value="CSC_OFFICER">Police Officer (CSC Frontline)</option>
                    <option value="DETECTIVE">Detective (Investigating Officer)</option>
                    <option value="COMMANDER">Station Commander (Supervision)</option>
                    <option value="ADMINISTRATOR">System Administrator</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Department / Division
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Detective Branch"
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    className={`w-full px-3 py-2 rounded-md border text-xs focus:outline-none ${
                      isDark ? 'bg-black border-white/15 text-white focus:border-blue-600' : 'bg-white border-black/15 text-black focus:border-blue-600'
                    }`}
                  />
                </div>
              </div>

              <div className={`p-3 rounded-md border text-xs flex items-center gap-2 ${
                isDark ? 'bg-slate-900/40 border-white/10 text-slate-300' : 'bg-slate-50 border-black/10 text-slate-700'
              }`}>
                <KeyRound size={16} className="text-blue-600 shrink-0" />
                <span>
                  A temporary access password (<strong className="font-mono text-blue-600">Official2026!</strong>) will be assigned.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseAdd}
                  className={`px-4 py-2 rounded-md border text-xs font-semibold cursor-pointer ${
                    isDark ? 'border-white/20 hover:bg-slate-900' : 'border-black/20 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: VIEW USER DETAILS
          ========================================================================= */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className={`w-full max-w-lg rounded-md border shadow-2xl p-6 space-y-5 ${
            isDark ? 'bg-black border-white/15 text-white' : 'bg-white border-black/15 text-black'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-blue-600 flex items-center justify-center font-bold text-lg text-white uppercase shrink-0">
                  {viewingUser.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                    {viewingUser.fullName}
                  </h3>
                  <p className="text-xs text-blue-600 font-medium">
                    {getPositionText(viewingUser)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className={`p-1.5 rounded-md border cursor-pointer ${
                  isDark ? 'border-white/10 text-slate-400 hover:text-white' : 'border-black/10 text-slate-600 hover:text-black'
                }`}
              >
                <X size={16} />
              </button>
            </div>

            <div className={`p-4 rounded-md border divide-y text-xs space-y-2.5 ${
              isDark ? 'bg-slate-900/40 border-white/10 divide-white/10' : 'bg-slate-50 border-black/10 divide-black/10'
            }`}>
              <div className="flex justify-between py-1">
                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Position / Title</span>
                <span className="font-semibold">{getPositionText(viewingUser)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Account Type</span>
                <span className="font-bold">{viewingUser.accountType}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>System Role</span>
                <span>{getRoleBadge(viewingUser.role)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Account Status</span>
                <span>{getStatusBadge(viewingUser.status)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Account Identifier</span>
                <span className="text-blue-600 font-mono font-bold">{viewingUser.identifier}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Email Address</span>
                <span className="font-mono">{viewingUser.email}</span>
              </div>
              {viewingUser.phoneNumber && (
                <div className="flex justify-between py-1">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Contact Phone</span>
                  <span className="font-mono">{viewingUser.phoneNumber}</span>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Station Affiliation</span>
                <span>{viewingUser.station}</span>
              </div>
              {viewingUser.division && (
                <div className="flex justify-between py-1">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Division</span>
                  <span>{viewingUser.division}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className={`flex flex-wrap items-center justify-between gap-2 pt-2 border-t ${
              isDark ? 'border-white/10' : 'border-black/10'
            }`}>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  id="btn-modal-edit-user"
                  onClick={() => {
                    const target = viewingUser;
                    setViewingUser(null);
                    handleStartEdit(target);
                  }}
                  className="px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>Edit Account</span>
                </button>

                {viewingUser.status === 'ACTIVE' ? (
                  <button
                    type="button"
                    onClick={() => {
                      onSetUserStatus(viewingUser.id, 'INACTIVE');
                      setViewingUser({ ...viewingUser, status: 'INACTIVE' });
                    }}
                    className="px-3 py-2 rounded-md border border-amber-600/30 text-amber-600 hover:bg-amber-600/10 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <XCircle size={13} />
                    <span>Deactivate</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onSetUserStatus(viewingUser.id, 'ACTIVE');
                      setViewingUser({ ...viewingUser, status: 'ACTIVE' });
                    }}
                    className="px-3 py-2 rounded-md border border-emerald-600/30 text-emerald-600 hover:bg-emerald-600/10 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 size={13} />
                    <span>Activate</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const target = viewingUser;
                    setViewingUser(null);
                    handlePerformReset(target);
                  }}
                  className="px-3 py-2 rounded-md border border-blue-600/30 text-blue-600 hover:bg-blue-600/10 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <KeyRound size={13} />
                  <span>Reset Password</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className={`px-4 py-2 rounded-md border text-xs font-semibold cursor-pointer ${
                  isDark ? 'border-white/20 hover:bg-slate-900' : 'border-black/20 hover:bg-slate-100'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT USER
          ========================================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className={`w-full max-w-lg rounded-md border shadow-2xl p-6 space-y-5 ${
            isDark ? 'bg-black border-white/15 text-white' : 'bg-white border-black/15 text-black'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                  Edit Account: {editingUser.fullName}
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Update account contact details or administrative role assignment.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className={`p-1.5 rounded-md border cursor-pointer ${
                  isDark ? 'border-white/10 text-slate-400 hover:text-white' : 'border-black/10 text-slate-600 hover:text-black'
                }`}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  className={`w-full px-3 py-2 rounded-md border text-xs focus:outline-none ${
                    isDark ? 'bg-black border-white/15 text-white focus:border-blue-600' : 'bg-white border-black/15 text-black focus:border-blue-600'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className={`w-full px-3 py-2 rounded-md border text-xs focus:outline-none ${
                    isDark ? 'bg-black border-white/15 text-white focus:border-blue-600' : 'bg-white border-black/15 text-black focus:border-blue-600'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={editFormData.phoneNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                  className={`w-full px-3 py-2 rounded-md border text-xs focus:outline-none ${
                    isDark ? 'bg-black border-white/15 text-white focus:border-blue-600' : 'bg-white border-black/15 text-black focus:border-blue-600'
                  }`}
                />
              </div>

              {editingUser.accountType === 'PERSONNEL' && (
                <>
                  <div className="space-y-1.5">
                    <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Rank
                    </label>
                    <input
                      type="text"
                      value={editFormData.rank}
                      onChange={(e) => setEditFormData({ ...editFormData, rank: e.target.value })}
                      className={`w-full px-3 py-2 rounded-md border text-xs focus:outline-none ${
                        isDark ? 'bg-black border-white/15 text-white focus:border-blue-600' : 'bg-white border-black/15 text-black focus:border-blue-600'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      System Role
                    </label>
                    <select
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as any })}
                      className={`w-full px-3 py-2 rounded-md border text-xs focus:outline-none ${
                        isDark ? 'bg-black border-white/15 text-white focus:border-blue-600' : 'bg-white border-black/15 text-black focus:border-blue-600'
                      }`}
                    >
                      <option value="CSC_OFFICER">Police Officer (CSC Frontline)</option>
                      <option value="DETECTIVE">Detective (Investigating Officer)</option>
                      <option value="COMMANDER">Station Commander (Supervision)</option>
                      <option value="ADMINISTRATOR">System Administrator</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className={`px-4 py-2 rounded-md border text-xs font-semibold cursor-pointer ${
                    isDark ? 'border-white/20 hover:bg-slate-900' : 'border-black/20 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: PASSWORD RESET CONFIRMATION
          ========================================================================= */}
      {resetResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className={`w-full max-w-md rounded-md border shadow-2xl p-6 space-y-4 ${
            isDark ? 'bg-black border-white/15 text-white' : 'bg-white border-black/15 text-black'
          }`}>
            <div className="flex items-center gap-3 text-blue-600">
              <div className="p-2 rounded-md bg-blue-600/10 border border-blue-600/20">
                <KeyRound size={20} />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                  Password Reset Successful
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Temporary credentials generated
                </p>
              </div>
            </div>

            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              The password for <strong className={isDark ? 'text-white' : 'text-black'}>{resetResult.user.fullName}</strong> ({resetResult.user.identifier}) has been reset. Provide this temporary credential to the user:
            </p>

            <div className={`p-3.5 rounded-md border flex items-center justify-between ${
              isDark ? 'bg-slate-900/40 border-white/10' : 'bg-slate-50 border-black/10'
            }`}>
              <span className="font-mono text-base font-extrabold text-blue-600">
                {resetResult.tempPassword}
              </span>
              <button
                type="button"
                onClick={handleCopyPassword}
                className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedResetPin ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedResetPin ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              The user will be prompted to choose a permanent secure password upon their next login.
            </p>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setResetResult(null)}
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
