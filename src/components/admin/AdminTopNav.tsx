import React from 'react';
import { UserProfile } from '../../types/auth';
import { AdminTab } from '../../types/admin';
import { SfenLogo } from '../SfenLogo';
import { 
  Building2, 
  LogOut, 
  Menu, 
  X, 
  Sun,
  Moon,
  ShieldCheck
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface AdminTopNavProps {
  user: UserProfile;
  activeTab: AdminTab;
  onNavigate: (tab: AdminTab) => void;
  onSignOut: () => void;
  stationName?: string;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const AdminTopNav: React.FC<AdminTopNavProps> = ({
  user,
  activeTab,
  onNavigate,
  onSignOut,
  stationName = 'SAPS Sandton Police Station',
  isMobileMenuOpen,
  onToggleMobileMenu
}) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header 
      id="admin-topbar" 
      className={`sticky top-0 z-40 w-full border-b transition-colors ${
        isDark ? 'bg-black border-white/15 text-white' : 'bg-white border-black/15 text-black'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Hamburger + Brand & Portal Badge */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className={`p-2 rounded-md border md:hidden cursor-pointer ${
              isDark ? 'border-white/10 text-white hover:bg-slate-900' : 'border-black/10 text-black hover:bg-slate-100'
            }`}
            aria-label="Toggle admin menu"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 text-left focus:outline-none cursor-pointer group"
          >
            <SfenLogo size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-base tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
                  SFEN
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 border border-blue-600 text-blue-600 uppercase tracking-wider">
                  System Administration
                </span>
              </div>
              <p className={`text-[11px] hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                User Accounts, Access Control & Station Governance
              </p>
            </div>
          </button>
        </div>

        {/* Right: Station Indicator, Theme Toggle, Profile Badge, and Sign Out */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Configured Station Indicator */}
          <div className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs border ${
            isDark ? 'border-white/10 text-slate-300' : 'border-black/10 text-slate-700'
          }`}>
            <Building2 size={13} className="text-blue-600" />
            <span className="font-medium truncate max-w-[170px]">
              {stationName}
            </span>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark/light theme"
            className={`p-2 border transition-colors cursor-pointer ${
              isDark 
                ? 'border-white/20 text-white hover:bg-slate-900' 
                : 'border-black/20 text-black hover:bg-slate-100'
            }`}
          >
            {isDark ? <Sun size={16} className="text-blue-500" /> : <Moon size={16} className="text-blue-600" />}
          </button>

          {/* Profile Badge */}
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className={`hidden sm:flex items-center gap-2.5 px-3 py-1.5 border text-left cursor-pointer transition-colors ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600'
                : isDark 
                  ? 'border-white/10 text-slate-200 hover:border-white/30' 
                  : 'border-black/10 text-slate-800 hover:border-black/30'
            }`}
          >
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs uppercase">
              {user.fullName ? user.fullName.charAt(0) : 'A'}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-semibold leading-tight">{user.fullName}</p>
              <p className="text-[10px] font-mono text-slate-400">
                Administrator • {user.personnelNumber}
              </p>
            </div>
          </button>

          {/* Sign Out Button */}
          <button
            type="button"
            id="btn-admin-topbar-logout"
            onClick={onSignOut}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border transition-colors cursor-pointer ${
              isDark 
                ? 'border-white/10 text-slate-300 hover:bg-slate-900 hover:text-white' 
                : 'border-black/10 text-slate-700 hover:bg-slate-100 hover:text-black'
            }`}
            title="Sign Out of Administration"
          >
            <LogOut size={14} className="text-blue-600" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>

        </div>
      </div>
    </header>
  );
};
