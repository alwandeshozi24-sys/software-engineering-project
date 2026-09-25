import React, { useState } from 'react';
import { UserProfile } from '../../types/auth';
import { DetectiveCaseDocket } from '../../types/detective';
import { AuthorisedStationDetective } from '../../types/commander';
import { 
  X, 
  UserPlus, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface CommanderAssignDetectiveModalProps {
  caseDocket: DetectiveCaseDocket;
  detectives: AuthorisedStationDetective[];
  commander: UserProfile;
  onClose: () => void;
  onConfirmAssignment: (params: {
    caseNumber: string;
    detectivePersonnelNumber: string;
    assignmentNotes?: string;
  }) => void;
}

export const CommanderAssignDetectiveModal: React.FC<CommanderAssignDetectiveModalProps> = ({
  caseDocket,
  detectives,
  commander,
  onClose,
  onConfirmAssignment
}) => {
  const { isDark } = useTheme();
  const [selectedDetectiveNumber, setSelectedDetectiveNumber] = useState<string>(
    detectives[0]?.personnelNumber || ''
  );
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedDetective = detectives.find(d => d.personnelNumber === selectedDetectiveNumber);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDetectiveNumber) {
      setError('Please select an authorised detective from the station roster.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    onConfirmAssignment({
      caseNumber: caseDocket.caseNumber,
      detectivePersonnelNumber: selectedDetectiveNumber,
      assignmentNotes: assignmentNotes.trim()
    });

    setIsSubmitting(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`w-full max-w-xl rounded-md border shadow-2xl overflow-hidden ${
        isDark ? 'bg-black border-white/15 text-white' : 'bg-white border-black/15 text-black'
      }`}>
        
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between gap-3 ${
          isDark ? 'bg-slate-900/40 border-white/10' : 'bg-slate-50 border-black/10'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-blue-600/10 border border-blue-600/20 text-blue-600 flex items-center justify-center shrink-0">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                Formal Docket Assignment & Handover
              </h3>
              <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {caseDocket.caseNumber} • {caseDocket.incidentType}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-md border transition-colors cursor-pointer ${
              isDark ? 'border-white/10 text-slate-400 hover:text-white' : 'border-black/10 text-slate-600 hover:text-black'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          
          {error && (
            <div className="p-3.5 rounded-md bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Custody / Assignment State Banner */}
          <div className={`p-3.5 rounded-md border space-y-2 text-xs ${
            isDark ? 'bg-slate-900/30 border-white/10' : 'bg-slate-50 border-black/10'
          }`}>
            <div className="flex items-center justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Current Assigned Officer:</span>
              <span className="font-semibold">
                {caseDocket.investigatingOfficerName || 'Unassigned (Awaiting Allocation)'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Current Docket Custodian:</span>
              <span className="font-semibold text-emerald-600 font-mono">
                {caseDocket.currentCustodianName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Complainant:</span>
              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                {caseDocket.complainant.fullName} ({caseDocket.complainant.phoneNumber})
              </span>
            </div>
          </div>

          {/* Select Authorised Detective */}
          <div className="space-y-2">
            <label className={`block text-xs font-bold uppercase tracking-wider ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Select Authorised Investigating Officer *
            </label>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {detectives.map((det) => {
                const isSelected = selectedDetectiveNumber === det.personnelNumber;
                return (
                  <div
                    key={det.personnelNumber}
                    onClick={() => setSelectedDetectiveNumber(det.personnelNumber)}
                    className={`p-3 rounded-md border text-xs cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-600/10 border-blue-600'
                        : isDark ? 'bg-black border-white/10 hover:border-white/20' : 'bg-white border-black/10 hover:border-black/20'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{det.rank} {det.fullName}</span>
                        <span className="font-mono text-[10px] text-blue-600">
                          {det.personnelNumber}
                        </span>
                      </div>
                      <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {det.division}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Spec: {det.specialization}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <CheckCircle2 size={14} />
                        </div>
                      ) : (
                        <div className={`w-5 h-5 rounded-full border ${isDark ? 'border-white/20' : 'border-black/20'}`} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assignment Mandate / Directives */}
          <div className="space-y-1.5">
            <label className={`block text-xs font-bold uppercase tracking-wider ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Supervisory Assignment Directive / Mandate (Optional)
            </label>
            <textarea
              value={assignmentNotes}
              onChange={(e) => setAssignmentNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Conduct urgent on-site interview with complainant, review bank statements and submit preliminary report within 7 days."
              className={`w-full px-3.5 py-2.5 rounded-md border text-xs placeholder-slate-500 focus:outline-none ${
                isDark ? 'bg-black border-white/15 text-white focus:border-blue-600' : 'bg-white border-black/15 text-black focus:border-blue-600'
              }`}
            />
          </div>

          {/* Traceable Handover Policy Notice */}
          <div className={`p-3 rounded-md border text-xs leading-relaxed flex items-start gap-2.5 ${
            isDark ? 'bg-slate-900/30 border-white/10 text-slate-300' : 'bg-slate-50 border-black/10 text-slate-700'
          }`}>
            <ShieldCheck size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className={`font-bold mb-0.5 ${isDark ? 'text-white' : 'text-black'}`}>Traceable Docket Custody Rule</p>
              <p className="text-[11px]">
                Assigning this docket will record a digital transfer record dispatched by <strong>{commander.rank} {commander.fullName}</strong> to <strong>{selectedDetective?.rank} {selectedDetective?.fullName}</strong>. The transfer will be marked as <span className="font-mono text-blue-600 font-bold">Awaiting Acknowledgement</span> until the detective formally signs for custody.
              </p>
            </div>
          </div>

          {/* Modal Actions */}
          <div className={`flex items-center justify-end gap-3 pt-2 border-t ${
            isDark ? 'border-white/10' : 'border-black/10'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-md border text-xs font-semibold cursor-pointer ${
                isDark ? 'border-white/20 hover:bg-slate-900' : 'border-black/20 hover:bg-slate-100'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <UserPlus size={15} />
              <span>Confirm Formal Assignment</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
