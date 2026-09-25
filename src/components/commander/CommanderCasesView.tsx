import React, { useState, useMemo } from 'react';
import { DetectiveCaseDocket } from '../../types/detective';
import { 
  Search, 
  Briefcase, 
  UserPlus, 
  ArrowRight
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface CommanderCasesViewProps {
  cases: DetectiveCaseDocket[];
  initialFilter?: string;
  onOpenCase: (caseDocket: DetectiveCaseDocket, initialTab?: any) => void;
  onOpenAssignModal: (caseDocket: DetectiveCaseDocket) => void;
}

export const CommanderCasesView: React.FC<CommanderCasesViewProps> = ({
  cases,
  initialFilter = 'all',
  onOpenCase,
  onOpenAssignModal
}) => {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter);

  const today = new Date().toISOString().split('T')[0];

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // Search query filter
      const matchesSearch = 
        c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.incidentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.investigatingOfficerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.complainant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.currentCustodianName.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Status filters
      if (statusFilter === 'unassigned') {
        return !c.investigatingOfficerPersonnelNumber || c.investigatingOfficerName === 'Unassigned' || c.investigatingOfficerRank === 'Awaiting Allocation';
      }
      if (statusFilter === 'active') {
        return c.currentStatus === 'Investigation Active' || c.currentStatus === 'Evidence Analysis';
      }
      if (statusFilter === 'review_due') {
        return c.scheduledReviewDate && c.scheduledReviewDate <= today;
      }
      if (statusFilter === 'awaiting_ack') {
        return !c.isCustodyAcknowledgedByDetective || c.custodyStatus === 'TRANSFERRED_AWAITING_RECEIPT';
      }
      if (statusFilter === 'court_npa') {
        return c.currentStatus === 'Docket at NPA / Court' || c.currentStatus === 'Case Finalized';
      }

      return true;
    });
  }, [cases, searchQuery, statusFilter, today]);

  const unassignedCount = cases.filter(
    c => !c.investigatingOfficerPersonnelNumber || c.investigatingOfficerName === 'Unassigned'
  ).length;

  const reviewDueCount = cases.filter(
    c => c.scheduledReviewDate && c.scheduledReviewDate <= today
  ).length;

  const awaitingAckCount = cases.filter(
    c => !c.isCustodyAcknowledgedByDetective || c.custodyStatus === 'TRANSFERRED_AWAITING_RECEIPT'
  ).length;

  return (
    <div id="commander-cases-view" className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
            Station Case Supervision & Dockets
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Supervise case progression, verify docket custody, and inspect investigation integrity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Showing <strong className={isDark ? 'text-white' : 'text-black'}>{filteredCases.length}</strong> of {cases.length} dockets
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {[
            { id: 'all', label: 'All Cases', count: cases.length },
            { id: 'unassigned', label: 'Awaiting Assignment', count: unassignedCount, highlight: unassignedCount > 0 },
            { id: 'active', label: 'Active Investigation', count: cases.filter(c => c.currentStatus === 'Investigation Active' || c.currentStatus === 'Evidence Analysis').length },
            { id: 'review_due', label: 'Requiring Review', count: reviewDueCount, highlight: reviewDueCount > 0 },
            { id: 'awaiting_ack', label: 'Awaiting Acknowledgement', count: awaitingAckCount },
            { id: 'court_npa', label: 'Court / NPA Ready', count: cases.filter(c => c.currentStatus === 'Docket at NPA / Court' || c.currentStatus === 'Case Finalized').length }
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600'
                    : isDark 
                      ? 'bg-black border-white/10 text-slate-400 hover:text-white hover:bg-slate-900' 
                      : 'bg-white border-black/10 text-slate-600 hover:text-black hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  isActive
                    ? 'bg-white/20 text-white font-bold'
                    : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search CAS, crime, officer..."
            className={`w-full pl-9 pr-4 py-2 rounded-md border text-xs placeholder-slate-500 focus:outline-none ${
              isDark 
                ? 'bg-black border-white/15 text-white focus:border-blue-600' 
                : 'bg-white border-black/15 text-black focus:border-blue-600'
            }`}
          />
        </div>

      </div>

      {/* Cases List */}
      {filteredCases.length === 0 ? (
        <div className={`p-12 text-center rounded-md border space-y-3 ${
          isDark ? 'bg-slate-900/40 border-white/10' : 'bg-slate-50 border-black/10'
        }`}>
          <Briefcase size={36} className="text-slate-500 mx-auto" />
          <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>No matching dockets found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or switching to another filter state above.
          </p>
          {statusFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className="px-3.5 py-1.5 rounded-md bg-blue-600 text-white text-xs font-semibold cursor-pointer"
            >
              Reset to All Cases
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCases.map((c) => {
            const isUnassigned = !c.investigatingOfficerPersonnelNumber || c.investigatingOfficerName === 'Unassigned';
            const isAwaitingAck = !c.isCustodyAcknowledgedByDetective;
            const isReviewDue = c.scheduledReviewDate && c.scheduledReviewDate <= today;

            return (
              <div
                key={c.id}
                className={`p-4 sm:p-5 rounded-md border transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 group ${
                  isDark ? 'bg-black border-white/10 hover:bg-slate-900/30' : 'bg-white border-black/10 hover:bg-slate-50'
                }`}
              >
                {/* Left Case Core Information */}
                <div className="space-y-2 min-w-0 flex-1">
                  
                  {/* Top Bar: CAS Reference, Offence Type & Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold text-blue-600">
                      {c.caseNumber}
                    </span>
                    <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                      {c.incidentType}
                    </span>
                    {c.offenceSubcategory && (
                      <span className={`text-xs hidden sm:inline ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        • {c.offenceSubcategory}
                      </span>
                    )}

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                      c.currentStatus === 'Case Finalized' || c.currentStatus === 'Docket at NPA / Court'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                        : 'bg-blue-600/10 text-blue-600 border-blue-600/30'
                    }`}>
                      {c.currentStatus}
                    </span>

                    {isUnassigned ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-red-500/10 text-red-500 border border-red-500/30">
                        Unassigned - Action Required
                      </span>
                    ) : isAwaitingAck ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/10 text-amber-500 border border-amber-500/30">
                        Awaiting Custody Acknowledgement
                      </span>
                    ) : null}

                    {isReviewDue && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-600/10 text-blue-600 border border-blue-600/30">
                        Review Due
                      </span>
                    )}
                  </div>

                  {/* Complainant & Incident Location */}
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Complainant: <strong className={isDark ? 'text-white' : 'text-black'}>{c.complainant.fullName}</strong> • Loc: {c.incidentLocation.address}, {c.incidentLocation.suburb}
                  </p>

                  {/* Bottom Line: Assigned Detective, Current Custodian, Last Activity */}
                  <div className={`flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] font-mono pt-1 border-t ${
                    isDark ? 'text-slate-400 border-white/10' : 'text-slate-600 border-black/10'
                  }`}>
                    <div>
                      <span>Investigating Officer: </span>
                      <strong className={isUnassigned ? 'text-red-500 font-bold' : isDark ? 'text-slate-200' : 'text-slate-800'}>
                        {c.investigatingOfficerName}
                      </strong>
                    </div>

                    <span>•</span>

                    <div>
                      <span>Current Custodian: </span>
                      <strong className="text-emerald-600 font-bold">
                        {c.currentCustodianName}
                      </strong>
                    </div>

                    <span>•</span>

                    <div>
                      <span>Last Activity: </span>
                      <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{c.lastActivityDate}</span>
                    </div>

                    {c.scheduledReviewDate && (
                      <>
                        <span>•</span>
                        <div>
                          <span>Review: </span>
                          <span className={isReviewDue ? 'text-red-500 font-bold' : isDark ? 'text-slate-300' : 'text-slate-700'}>
                            {c.scheduledReviewDate}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Side Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {isUnassigned ? (
                    <button
                      type="button"
                      onClick={() => onOpenAssignModal(c)}
                      className="px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <UserPlus size={14} />
                      <span>Assign Detective</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenCase(c, isReviewDue ? 'supervisory-review' : 'overview')}
                      className={`px-3.5 py-2 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                        isDark ? 'bg-black border-white/20 text-white hover:bg-slate-900' : 'bg-white border-black/20 text-black hover:bg-slate-100'
                      }`}
                    >
                      <span>Case Inspection</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
