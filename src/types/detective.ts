export type DetectiveNavTab = 
  | 'dashboard'
  | 'cases'
  | 'profile';

export type CaseWorkspaceTab = 
  | 'overview'
  | 'diary'
  | 'documents'
  | 'instructions'
  | 'movements'
  | 'audit';

export type DocketCustodyStatus = 
  | 'HELD_BY_INVESTIGATING_OFFICER'
  | 'TRANSFERRED_AWAITING_RECEIPT'
  | 'HELD_BY_SUPERVISOR'
  | 'HELD_BY_COURT_OR_NPA'
  | 'HELD_BY_FORENSICS'
  | 'ARCHIVED';

export type InstructionStatus = 'OUTSTANDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface SupervisorInstruction {
  id: string;
  caseNumber: string;
  offenceCategory?: string;
  instructionText: string;
  issuedBy: string; // e.g. "Senior Superintendent Elena Vance"
  issuedByRank: string;
  issuedByPersonnelNumber: string;
  issuedAt: string;
  requiredReviewDate?: string;
  priority: 'Routine' | 'Urgent' | 'Critical';
  status: InstructionStatus;
  responseActionTaken?: string;
  responseResult?: string;
  respondedAt?: string;
  respondedBy?: string;
  completedAt?: string;
}

export interface CaseDocumentRecord {
  id: string;
  caseNumber: string;
  documentRef: string; // e.g. "DOC-A1-001", "DOC-S205-002"
  title: string;
  category: 
    | 'Sworn Statement (A1/A2)'
    | 'Section 205 Subpoena'
    | 'Crime Scene Photos'
    | 'Forensic / Ballistic Report'
    | 'CCTV Footage Extraction'
    | 'Search & Seizure Warrant'
    | 'Medical / J88 Examination'
    | 'Documentary / Financial Audit';
  description: string;
  fileFormat: string; // PDF, JPG, MP4, etc.
  fileSize: string;
  addedBy: string;
  addedByRank: string;
  addedByPersonnelNumber: string;
  addedAt: string;
  hashVerification?: string;
}

export interface InvestigationDiaryRecord {
  id: string;
  caseNumber: string;
  actionTaken: string;
  resultOutcome: string;
  documentReference?: string;
  nextActionRequired: string;
  authorName: string;
  authorRank: string;
  personnelNumber: string;
  timestamp: string;
}

export interface DocketTransferMovement {
  id: string;
  caseNumber: string;
  previousCustodian: string;
  newCustodian: string;
  senderName: string;
  senderRank: string;
  senderPersonnelNumber: string;
  senderStation: string;
  destination: string; // e.g. "Forensic Science Laboratory (FSL)", "Station Commander Review", "Commercial Crime Desk"
  intendedRecipientName?: string;
  intendedRecipientRole?: string;
  recipientName?: string;
  recipientRank?: string;
  recipientPersonnelNumber?: string;
  reasonForMovement: string;
  movementReason?: string; // backwards compatibility alias
  dispatchedAt: string; // date and time sent
  status: 'AWAITING_ACKNOWLEDGEMENT' | 'ACKNOWLEDGED_RECEIVED';
  acknowledgedBy?: string;
  acknowledgedByRank?: string;
  acknowledgedByPersonnelNumber?: string;
  acknowledgedAt?: string; // date and time received
  acknowledgementNotes?: string;
  currentDocketCustodian: string; // who currently has responsibility
}

export interface CaseAuditEntry {
  id: string;
  caseNumber: string;
  action: 
    | 'CASE_REGISTERED'
    | 'DOCKET_ACCESSED'
    | 'INVESTIGATION_ENTRY_RECORDED'
    | 'DOCUMENT_ATTACHED'
    | 'INSTRUCTION_RESPONDED'
    | 'INSTRUCTION_COMPLETED'
    | 'DOCKET_MOVEMENT_INITIATED'
    | 'DOCKET_RECEIPT_ACKNOWLEDGED'
    | 'CASE_STATUS_UPDATED'
    | 'CUSTODY_TRANSFERRED'
    | 'SUPERVISORY_REVIEW_RECORDED'
    | 'DOCKET_RETURNED_WITH_INSTRUCTIONS';
  userFullName: string;
  userRank: string;
  userPersonnelNumber: string;
  userRole: string;
  description: string;
  timestamp: string;
  securityHash: string;
}

export interface DetectiveNotification {
  id: string;
  type: 'ASSIGNMENT' | 'INSTRUCTION' | 'MOVEMENT' | 'REVIEW_DUE' | 'AUDIT';
  title: string;
  message: string;
  caseNumber?: string;
  timestamp: string;
  read: boolean;
  priority: 'normal' | 'high';
}

export interface DetectiveCaseDocket {
  id: string;
  caseNumber: string; // e.g. "CAS 342/08/2026"
  reportReference?: string; // e.g. "SFEN-RPT-000088"
  incidentType: string;
  offenceSubcategory?: string;
  policeStation: string;
  dateReported: string;
  incidentDate: string;
  incidentTime?: string;
  incidentLocation: {
    address: string;
    suburb: string;
    city: string;
    province: string;
  };
  complainant: {
    fullName: string;
    phoneNumber: string;
    email: string;
    nationalId?: string;
    statementSummary: string;
  };

  // Registration specifics (Who registered this case?)
  registeredByOfficerName?: string;
  registeredByOfficerRank?: string;
  registeredByOfficerPersonnelNumber?: string;
  registeredAt?: string;
  registrationStation?: string;
  initialCharge?: string;

  // Investigating Officer
  investigatingOfficerId: string;
  investigatingOfficerName: string;
  investigatingOfficerRank: string;
  investigatingOfficerPersonnelNumber: string;
  assignedDate: string;
  lastActivityDate: string;
  currentStatus: 'Investigation Active' | 'Evidence Analysis' | 'Docket at NPA / Court' | 'Case Finalized' | 'Suspended';
  
  // Custody tracking (Who currently has responsibility? Who previously had it?)
  previousCustodianName?: string;
  previousCustodianRank?: string;
  previousCustodianPersonnelNumber?: string;
  previousCustodianDepartment?: string;
  currentCustodianName: string;
  currentCustodianRank: string;
  currentCustodianPersonnelNumber: string;
  currentCustodianDepartment: string;
  custodyStatus: DocketCustodyStatus;
  isCustodyAcknowledgedByDetective: boolean;
  acknowledgedCustodyAt?: string;

  // Overview specifics
  statutoryCode?: string;
  priorityLevel: 'Standard' | 'Urgent' | 'High Priority' | 'Critical';
  nextCourtDate?: string;
  scheduledReviewDate?: string;
}
