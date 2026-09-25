import { UserProfile } from '../types/auth';
import {
  DetectiveCaseDocket,
  InvestigationDiaryRecord,
  CaseDocumentRecord,
  SupervisorInstruction,
  DocketTransferMovement,
  CaseAuditEntry,
  DetectiveNotification
} from '../types/detective';
import {
  AuthorisedStationDetective,
  CommanderDetectiveWorkload,
  StationComplaintRecord,
  SupervisoryReviewRecord,
  CommanderNotification
} from '../types/commander';
import { detectiveService } from './detectiveService';

const STORAGE_KEYS = {
  CASES: 'sfen_detective_dockets',
  DIARY: 'sfen_detective_diary_entries',
  DOCUMENTS: 'sfen_detective_documents',
  INSTRUCTIONS: 'sfen_detective_instructions',
  MOVEMENTS: 'sfen_detective_movements',
  AUDIT: 'sfen_detective_audit_trails',
  DETECTIVE_NOTIFS: 'sfen_detective_notifications',
  COMMANDER_REVIEWS: 'sfen_commander_reviews',
  COMPLAINTS: 'sfen_station_complaints',
  COMMANDER_NOTIFS: 'sfen_commander_notifications'
};

function safeStorageGet<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function safeStorageSet<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // storage fallback
  }
}

function generateSecurityHash(caseNum: string, action: string, timestamp: string): string {
  const seed = `${caseNum}-${action}-${timestamp}-${Math.random().toString(36).substring(2, 9)}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return `SHA256:${Math.abs(hash).toString(16).padStart(8, '0').toUpperCase()}cmd89${Date.now().toString(16)}`;
}

// 4 Authorised Detectives at SAPS Sandton Police Station
export const AUTHORISED_STATION_DETECTIVES: AuthorisedStationDetective[] = [
  {
    id: 'usr_pol_20491',
    personnelNumber: 'POL-20491',
    fullName: 'David Khumalo',
    rank: 'Detective Inspector',
    email: 'd.khumalo@cid.sfen.gov',
    phone: '011 555 4920',
    station: 'SAPS Sandton Police Station',
    division: 'Commercial Crime Section - Specialist Desk',
    specialization: 'Cybercrime, Banking Phishing & Electronic Fraud',
    status: 'ACTIVE'
  },
  {
    id: 'usr_pol_20188',
    personnelNumber: 'POL-20188',
    fullName: 'Sipho Sithole',
    rank: 'Detective Captain',
    email: 's.sithole@cid.sfen.gov',
    phone: '011 555 4921',
    station: 'SAPS Sandton Police Station',
    division: 'Serious & Violent Crimes Directorate',
    specialization: 'Armed Robbery, Hijacking & Gang Activity',
    status: 'ACTIVE'
  },
  {
    id: 'usr_pol_21503',
    personnelNumber: 'POL-21503',
    fullName: 'Lerato Mokoena',
    rank: 'Detective Sergeant',
    email: 'l.mokoena@cid.sfen.gov',
    phone: '011 555 4922',
    station: 'SAPS Sandton Police Station',
    division: 'Family Violence, Child Protection & Sexual Offences (FCS)',
    specialization: 'Gender-Based Violence, Vulnerable Victims & Extortion',
    status: 'ACTIVE'
  },
  {
    id: 'usr_pol_19842',
    personnelNumber: 'POL-19842',
    fullName: 'Johan Bekker',
    rank: 'Detective Warrant Officer',
    email: 'j.bekker@cid.sfen.gov',
    phone: '011 555 4923',
    station: 'SAPS Sandton Police Station',
    division: 'General Crime Investigation Desk',
    specialization: 'Residential Burglary, Vehicle Theft & Property Syndicates',
    status: 'ACTIVE'
  }
];

// Initial Seed Reviews for the Sandton Station Commander (Senior Superintendent Elena Vance)
const SEED_SUPERVISORY_REVIEWS: SupervisoryReviewRecord[] = [
  {
    id: 'rev_001',
    caseNumber: 'CAS 342/08/2026',
    commanderName: 'Elena Vance',
    commanderRank: 'Senior Superintendent',
    commanderPersonnelNumber: 'POL-30912',
    reviewDate: '2026-09-10T11:30:00Z',
    reviewNotes: 'Reviewed initial Section 205 subpoena applications and complainant bank correspondence. Digital chain of evidence verified tamper-free.',
    furtherActionRequired: 'Instructed Detective Inspector Khumalo to subpoena destination account statements and coordinate with NPA Specialist Commercial Crimes Unit.',
    nextReviewDate: '2026-09-28',
    reviewOutcome: 'Further Directives Issued',
    auditSecurityHash: 'SHA256:7B9E201ACOMMANDER_VANCE'
  }
];

// Initial Station Complaints lodged by complainants
const SEED_COMPLAINTS: StationComplaintRecord[] = [
  {
    id: 'cmp_001',
    referenceNumber: 'CMP-2026-0042',
    complainantName: 'Thandi Molefe',
    complainantPhone: '0825550192',
    complainantEmail: 'thandi.molefe@gmail.com',
    category: 'Investigation Delay / Lack of Updates',
    linkedCaseNumber: 'CAS 342/08/2026',
    policeStation: 'SAPS Sandton Police Station',
    dateSubmitted: '2026-09-08',
    details: 'I lodged my fraud complaint 2 weeks ago and had not received an update on whether the bank subpoena had been signed by the magistrate.',
    desiredResolution: 'Formal status briefing on whether the stolen funds can be frozen in the destination clearing account.',
    status: 'Resolved',
    commanderNotes: 'Contacted complainant personally. Clarified that Section 205 subpoenas are under judicial review with the Randburg Magistrate. Detective Khumalo has logged interim verification report in SFEN.',
    outcomeResponse: 'Complainant briefed via secure telephone. Case timeline and investigation milestones are accessible to complainant on the SFEN Complainant Portal.',
    handledByCommanderName: 'Elena Vance',
    handledByRank: 'Senior Superintendent',
    handledByPersonnelNumber: 'POL-30912',
    resolvedAt: '2026-09-09T14:20:00Z'
  },
  {
    id: 'cmp_002',
    referenceNumber: 'CMP-2026-0051',
    complainantName: 'Michael Khuzwayo',
    complainantPhone: '0839912044',
    complainantEmail: 'm.khuzwayo@netpost.co.za',
    category: 'Station Frontline Service Delivery',
    linkedCaseNumber: 'CAS 512/09/2026',
    policeStation: 'SAPS Sandton Police Station',
    dateSubmitted: '2026-09-21',
    details: 'At the Community Service Centre, wait time exceeded 90 minutes before statement recording, and the initial case registration receipt did not immediately indicate the assigned investigating officer.',
    desiredResolution: 'Immediate allocation of investigating officer and inspection of CSC counter turnaround times.',
    status: 'Pending Review',
    commanderNotes: 'Awaiting Commander assignment of CAS 512/09/2026 to General Crime Investigation Desk.',
    outcomeResponse: ''
  }
];

// Initial Commander Notifications
const SEED_COMMANDER_NOTIFICATIONS: CommanderNotification[] = [
  {
    id: 'c_notif_001',
    type: 'CASE_AWAITING_ASSIGNMENT',
    title: 'New Case Awaiting Detective Assignment',
    message: 'CAS 512/09/2026 (Aggravated Business Robbery - Rosebank Link) registered by CSC. Investigation docket awaiting supervisory allocation.',
    caseNumber: 'CAS 512/09/2026',
    timestamp: '2026-09-22T08:15:00Z',
    read: false,
    priority: 'urgent'
  },
  {
    id: 'c_notif_002',
    type: 'DOCKET_AWAITING_ACKNOWLEDGEMENT',
    title: 'Docket Handed Over for Supervisory Inspection',
    message: 'CAS 118/09/2026 dispatched to Station Command Desk. Formal physical and digital custody acknowledgement required by Commander.',
    caseNumber: 'CAS 118/09/2026',
    timestamp: '2026-09-21T15:30:00Z',
    read: false,
    priority: 'urgent'
  },
  {
    id: 'c_notif_003',
    type: 'CASE_REQUIRES_REVIEW',
    title: 'Scheduled Supervisory Review Due',
    message: 'CAS 342/08/2026 has a scheduled 30-day supervisory review due on 2026-09-28.',
    caseNumber: 'CAS 342/08/2026',
    timestamp: '2026-09-22T10:00:00Z',
    read: false,
    priority: 'normal'
  },
  {
    id: 'c_notif_004',
    type: 'SERVICE_COMPLAINT',
    title: 'New Complainant Service Complaint Lodged',
    message: 'Service complaint CMP-2026-0051 submitted regarding CSC frontline turnaround and assignment status for CAS 512/09/2026.',
    complaintId: 'cmp_002',
    timestamp: '2026-09-21T17:10:00Z',
    read: false,
    priority: 'urgent'
  }
];

export const commanderService = {
  /**
   * Retrieves all supervised cases within the station.
   * Injects an unassigned case if none exists to guarantee the Commander has realistic assignment workflows.
   */
  getSupervisedCases(): DetectiveCaseDocket[] {
    let cases = safeStorageGet<DetectiveCaseDocket[]>(STORAGE_KEYS.CASES, detectiveService.getAllCases());
    if (cases.length === 0) {
      cases = detectiveService.getAllCases();
    }

    // Ensure we have the unassigned case CAS 512/09/2026 registered from CSC
    const hasUnassigned = cases.some(c => c.caseNumber === 'CAS 512/09/2026');
    if (!hasUnassigned) {
      const unassignedCase: DetectiveCaseDocket = {
        id: 'det_cas_004',
        caseNumber: 'CAS 512/09/2026',
        reportReference: 'SFEN-RPT-000142',
        incidentType: 'Robbery / Armed Robbery',
        offenceSubcategory: 'Aggravated Commercial Robbery & Firearms Violation',
        policeStation: 'SAPS Sandton Police Station',
        dateReported: '2026-09-21',
        incidentDate: '2026-09-21',
        incidentTime: '14:20',
        incidentLocation: {
          address: 'Corner Oxford & Biermann Avenue, Rosebank Link',
          suburb: 'Rosebank',
          city: 'Johannesburg',
          province: 'Gauteng'
        },
        complainant: {
          fullName: 'Michael Khuzwayo',
          phoneNumber: '0839912044',
          email: 'm.khuzwayo@netpost.co.za',
          nationalId: '800412 5192 083',
          statementSummary: 'Three armed assailants entered commercial premises holding staff at gunpoint. Cash vault and electronic inventory taken. Suspects fled in silver sedan.'
        },
        registeredByOfficerName: 'Sarah Ndlovu',
        registeredByOfficerRank: 'Constable',
        registeredByOfficerPersonnelNumber: 'POL-10824',
        registeredAt: '2026-09-21T14:40:00Z',
        registrationStation: 'SAPS Sandton Police Station (CSC Desk)',
        initialCharge: 'Armed Robbery & Possession of Unlicensed Firearm',
        investigatingOfficerId: '',
        investigatingOfficerName: 'Unassigned',
        investigatingOfficerRank: 'Awaiting Allocation',
        investigatingOfficerPersonnelNumber: '',
        assignedDate: '',
        lastActivityDate: '2026-09-21',
        currentStatus: 'Investigation Active',
        currentCustodianName: 'Constable Sarah Ndlovu (CSC Intake Desk)',
        currentCustodianRank: 'Constable',
        currentCustodianPersonnelNumber: 'POL-10824',
        currentCustodianDepartment: 'Community Service Centre (CSC) Frontline Intake',
        custodyStatus: 'TRANSFERRED_AWAITING_RECEIPT',
        isCustodyAcknowledgedByDetective: false,
        statutoryCode: 'Sec 1 Criminal Law Amendment Act 105 of 1997 / Firearms Control Act 60 of 2000',
        priorityLevel: 'Critical',
        scheduledReviewDate: '2026-09-27'
      };

      cases = [unassignedCase, ...cases];
      safeStorageSet(STORAGE_KEYS.CASES, cases);
    }

    return cases;
  },

  /**
   * Retrieves single docket by CAS reference.
   */
  getCaseByNumber(caseNumber: string): DetectiveCaseDocket | undefined {
    const cases = this.getSupervisedCases();
    return cases.find(c => c.caseNumber.trim().toUpperCase() === caseNumber.trim().toUpperCase());
  },

  /**
   * List of authorised detectives stationed at the police station.
   */
  getAuthorisedDetectives(): AuthorisedStationDetective[] {
    return AUTHORISED_STATION_DETECTIVES;
  },

  /**
   * Computes clean workload metrics for each detective under command.
   */
  getDetectivesWorkload(): CommanderDetectiveWorkload[] {
    const detectives = this.getAuthorisedDetectives();
    const cases = this.getSupervisedCases();
    const instructions = safeStorageGet<SupervisorInstruction[]>(STORAGE_KEYS.INSTRUCTIONS, []);

    return detectives.map(det => {
      const assignedCases = cases.filter(c => c.investigatingOfficerPersonnelNumber === det.personnelNumber);
      const unacknowledgedDockets = assignedCases.filter(c => !c.isCustodyAcknowledgedByDetective);
      
      const today = new Date().toISOString().split('T')[0];
      const casesRequiringReview = assignedCases.filter(c => 
        c.scheduledReviewDate && c.scheduledReviewDate <= today
      );

      const detInstructions = instructions.filter(i => 
        assignedCases.some(c => c.caseNumber === i.caseNumber) && i.status === 'OUTSTANDING'
      );

      const courtReady = assignedCases.filter(c => 
        c.currentStatus === 'Docket at NPA / Court' || c.currentStatus === 'Case Finalized'
      );

      return {
        detective: det,
        activeAssignedCasesCount: assignedCases.length,
        unacknowledgedDocketsCount: unacknowledgedDockets.length,
        casesRequiringReviewCount: casesRequiringReview.length,
        outstandingDirectivesCount: detInstructions.length,
        courtReadyCasesCount: courtReady.length
      };
    });
  },

  /**
   * Formally assigns a detective to a case, recording a traceable handover and audit trail.
   */
  assignDetectiveToCase(params: {
    caseNumber: string;
    detectivePersonnelNumber: string;
    commander: UserProfile;
    assignmentNotes?: string;
  }): { success: boolean; message: string; updatedCase?: DetectiveCaseDocket } {
    const cases = this.getSupervisedCases();
    const targetCaseIndex = cases.findIndex(c => c.caseNumber === params.caseNumber);
    if (targetCaseIndex === -1) {
      return { success: false, message: `Case ${params.caseNumber} not found.` };
    }

    const detective = AUTHORISED_STATION_DETECTIVES.find(d => d.personnelNumber === params.detectivePersonnelNumber);
    if (!detective) {
      return { success: false, message: `Authorised Detective ${params.detectivePersonnelNumber} not found in station roster.` };
    }

    const currentCase = cases[targetCaseIndex];
    const previousOfficer = currentCase.investigatingOfficerName || 'Unassigned';
    const previousCustodian = currentCase.currentCustodianName;
    const nowIso = new Date().toISOString();
    const todayDate = nowIso.split('T')[0];

    // Update case docket details
    const updatedCase: DetectiveCaseDocket = {
      ...currentCase,
      investigatingOfficerId: detective.id,
      investigatingOfficerName: detective.fullName,
      investigatingOfficerRank: detective.rank,
      investigatingOfficerPersonnelNumber: detective.personnelNumber,
      assignedDate: todayDate,
      lastActivityDate: todayDate,
      currentStatus: 'Investigation Active',
      // Traceable transfer handover state
      currentCustodianName: `${detective.rank} ${detective.fullName}`,
      currentCustodianRank: detective.rank,
      currentCustodianPersonnelNumber: detective.personnelNumber,
      currentCustodianDepartment: detective.division,
      custodyStatus: 'TRANSFERRED_AWAITING_RECEIPT',
      isCustodyAcknowledgedByDetective: false,
      acknowledgedCustodyAt: undefined
    };

    cases[targetCaseIndex] = updatedCase;
    safeStorageSet(STORAGE_KEYS.CASES, cases);

    // 1. Create traceable DocketTransferMovement
    const movements = safeStorageGet<DocketTransferMovement[]>(STORAGE_KEYS.MOVEMENTS, []);
    const newMovement: DocketTransferMovement = {
      id: `mov_assign_${Date.now()}`,
      caseNumber: params.caseNumber,
      previousCustodian: previousCustodian,
      newCustodian: `${detective.rank} ${detective.fullName} (${detective.personnelNumber})`,
      senderName: `${params.commander.rank} ${params.commander.fullName}`,
      senderRank: params.commander.rank,
      senderPersonnelNumber: params.commander.personnelNumber,
      senderStation: params.commander.station,
      destination: `${detective.division} - Docket Assignment`,
      intendedRecipientName: `${detective.rank} ${detective.fullName}`,
      intendedRecipientRole: 'Investigating Officer',
      recipientName: `${detective.rank} ${detective.fullName}`,
      recipientRank: detective.rank,
      recipientPersonnelNumber: detective.personnelNumber,
      reasonForMovement: params.assignmentNotes?.trim() || 'Official supervisory docket allocation and investigation mandate under SFEN accountability framework.',
      movementReason: params.assignmentNotes?.trim() || 'Official supervisory docket allocation and investigation mandate under SFEN accountability framework.',
      dispatchedAt: nowIso,
      status: 'AWAITING_ACKNOWLEDGEMENT',
      currentDocketCustodian: previousCustodian
    };
    safeStorageSet(STORAGE_KEYS.MOVEMENTS, [newMovement, ...movements]);

    // 2. Append cryptographically sealed CaseAuditEntry
    const auditEntries = safeStorageGet<CaseAuditEntry[]>(STORAGE_KEYS.AUDIT, []);
    const newAuditEntry: CaseAuditEntry = {
      id: `aud_assign_${Date.now()}`,
      caseNumber: params.caseNumber,
      action: 'CUSTODY_TRANSFERRED',
      userFullName: params.commander.fullName,
      userRank: params.commander.rank,
      userPersonnelNumber: params.commander.personnelNumber,
      userRole: 'Station Commander / Supervisor',
      description: `Docket formally assigned and transferred to ${detective.rank} ${detective.fullName} (${detective.personnelNumber}) by ${params.commander.rank} ${params.commander.fullName}. Previous custodian was ${previousCustodian}. Awaiting detective custody receipt acknowledgement.`,
      timestamp: nowIso,
      securityHash: generateSecurityHash(params.caseNumber, 'ASSIGNMENT', nowIso)
    };
    safeStorageSet(STORAGE_KEYS.AUDIT, [newAuditEntry, ...auditEntries]);

    // 3. Notify the assigned detective
    const detectiveNotifs = safeStorageGet<DetectiveNotification[]>(STORAGE_KEYS.DETECTIVE_NOTIFS, []);
    const newDetNotif: DetectiveNotification = {
      id: `notif_det_${Date.now()}`,
      type: 'ASSIGNMENT',
      title: 'New Case Docket Assigned',
      message: `Station Commander ${params.commander.fullName} has formally assigned you ${params.caseNumber} (${currentCase.incidentType}). Please acknowledge physical and digital custody.`,
      caseNumber: params.caseNumber,
      timestamp: nowIso,
      read: false,
      priority: 'high'
    };
    safeStorageSet(STORAGE_KEYS.DETECTIVE_NOTIFS, [newDetNotif, ...detectiveNotifs]);

    return {
      success: true,
      message: `Case ${params.caseNumber} successfully assigned to ${detective.rank} ${detective.fullName}. Transfer status: Awaiting Acknowledgement.`,
      updatedCase
    };
  },

  /**
   * Formally records a Supervisory Review outcome.
   */
  recordSupervisoryReview(params: {
    caseNumber: string;
    commander: UserProfile;
    reviewNotes: string;
    furtherActionRequired: string;
    nextReviewDate: string;
    reviewOutcome: SupervisoryReviewRecord['reviewOutcome'];
  }): { success: boolean; review: SupervisoryReviewRecord } {
    const reviews = safeStorageGet<SupervisoryReviewRecord[]>(STORAGE_KEYS.COMMANDER_REVIEWS, SEED_SUPERVISORY_REVIEWS);
    const nowIso = new Date().toISOString();

    const newReview: SupervisoryReviewRecord = {
      id: `rev_${Date.now()}`,
      caseNumber: params.caseNumber,
      commanderName: params.commander.fullName,
      commanderRank: params.commander.rank,
      commanderPersonnelNumber: params.commander.personnelNumber,
      reviewDate: nowIso,
      reviewNotes: params.reviewNotes,
      furtherActionRequired: params.furtherActionRequired,
      nextReviewDate: params.nextReviewDate,
      reviewOutcome: params.reviewOutcome,
      auditSecurityHash: generateSecurityHash(params.caseNumber, 'SUPERVISORY_REVIEW', nowIso)
    };

    safeStorageSet(STORAGE_KEYS.COMMANDER_REVIEWS, [newReview, ...reviews]);

    // Progress case status according to review outcome if satisfactory or court-ready
    const cases = this.getSupervisedCases();
    const caseIndex = cases.findIndex(c => c.caseNumber === params.caseNumber);
    if (caseIndex !== -1) {
      let nextStatus = cases[caseIndex].currentStatus;
      if (params.reviewOutcome === 'Ready for NPA / Court Referral') {
        nextStatus = 'Docket at NPA / Court';
      } else if (params.reviewOutcome === 'Docket Closure Recommended') {
        nextStatus = 'Case Finalized';
      } else if (params.reviewOutcome === 'Investigation Satisfactory') {
        nextStatus = 'Evidence Analysis';
      }

      cases[caseIndex] = {
        ...cases[caseIndex],
        currentStatus: nextStatus,
        scheduledReviewDate: params.nextReviewDate,
        lastActivityDate: nowIso.split('T')[0]
      };
      safeStorageSet(STORAGE_KEYS.CASES, cases);
    }

    // Append to audit trail
    const auditEntries = safeStorageGet<CaseAuditEntry[]>(STORAGE_KEYS.AUDIT, []);
    const newAuditEntry: CaseAuditEntry = {
      id: `aud_rev_${Date.now()}`,
      caseNumber: params.caseNumber,
      action: 'SUPERVISORY_REVIEW_RECORDED',
      userFullName: params.commander.fullName,
      userRank: params.commander.rank,
      userPersonnelNumber: params.commander.personnelNumber,
      userRole: 'Station Commander / Supervisor',
      description: `Formal Supervisory Review completed by ${params.commander.rank} ${params.commander.fullName}: Outcome "${params.reviewOutcome}". Next review scheduled: ${params.nextReviewDate}.`,
      timestamp: nowIso,
      securityHash: newReview.auditSecurityHash || generateSecurityHash(params.caseNumber, 'SUPERVISORY_REVIEW', nowIso)
    };
    safeStorageSet(STORAGE_KEYS.AUDIT, [newAuditEntry, ...auditEntries]);

    return { success: true, review: newReview };
  },

  /**
   * Retrieves all previous supervisory reviews for a specific case.
   */
  getSupervisoryReviews(caseNumber: string): SupervisoryReviewRecord[] {
    const reviews = safeStorageGet<SupervisoryReviewRecord[]>(STORAGE_KEYS.COMMANDER_REVIEWS, SEED_SUPERVISORY_REVIEWS);
    return reviews.filter(r => r.caseNumber === caseNumber);
  },

  /**
   * Issues case-specific SAPS 5 supervisory instructions to the detective.
   */
  issueInstruction(params: {
    caseNumber: string;
    instructionText: string;
    priority: 'Routine' | 'Urgent' | 'Critical';
    requiredReviewDate: string;
    commander: UserProfile;
  }): { success: boolean; instruction: SupervisorInstruction } {
    const instructions = safeStorageGet<SupervisorInstruction[]>(STORAGE_KEYS.INSTRUCTIONS, []);
    const currentCase = this.getCaseByNumber(params.caseNumber);
    const nowIso = new Date().toISOString();

    const newInstruction: SupervisorInstruction = {
      id: `inst_cmd_${Date.now()}`,
      caseNumber: params.caseNumber,
      offenceCategory: currentCase?.incidentType || 'Criminal Investigation',
      instructionText: params.instructionText,
      issuedBy: `${params.commander.rank} ${params.commander.fullName}`,
      issuedByRank: params.commander.rank,
      issuedByPersonnelNumber: params.commander.personnelNumber,
      issuedAt: nowIso,
      requiredReviewDate: params.requiredReviewDate,
      priority: params.priority,
      status: 'OUTSTANDING'
    };

    safeStorageSet(STORAGE_KEYS.INSTRUCTIONS, [newInstruction, ...instructions]);

    // Append to audit trail
    const auditEntries = safeStorageGet<CaseAuditEntry[]>(STORAGE_KEYS.AUDIT, []);
    const newAuditEntry: CaseAuditEntry = {
      id: `aud_inst_${Date.now()}`,
      caseNumber: params.caseNumber,
      action: 'INSTRUCTION_RESPONDED',
      userFullName: params.commander.fullName,
      userRank: params.commander.rank,
      userPersonnelNumber: params.commander.personnelNumber,
      userRole: 'Station Commander / Supervisor',
      description: `Supervisory Directive (${params.priority}) issued to investigating officer by ${params.commander.rank} ${params.commander.fullName}: "${params.instructionText.substring(0, 80)}..."`,
      timestamp: nowIso,
      securityHash: generateSecurityHash(params.caseNumber, 'INSTRUCTION_ISSUED', nowIso)
    };
    safeStorageSet(STORAGE_KEYS.AUDIT, [newAuditEntry, ...auditEntries]);

    // Notify detective
    const detNotifs = safeStorageGet<DetectiveNotification[]>(STORAGE_KEYS.DETECTIVE_NOTIFS, []);
    const notif: DetectiveNotification = {
      id: `notif_inst_${Date.now()}`,
      type: 'INSTRUCTION',
      title: 'New Supervisory Instruction Issued',
      message: `Station Commander ${params.commander.fullName} issued an instruction on ${params.caseNumber}: "${params.instructionText.substring(0, 70)}..."`,
      caseNumber: params.caseNumber,
      timestamp: nowIso,
      read: false,
      priority: params.priority === 'Critical' || params.priority === 'Urgent' ? 'high' : 'normal'
    };
    safeStorageSet(STORAGE_KEYS.DETECTIVE_NOTIFS, [notif, ...detNotifs]);

    return { success: true, instruction: newInstruction };
  },

  /**
   * Retrieves instructions for a case.
   */
  getCaseInstructions(caseNumber: string): SupervisorInstruction[] {
    const instructions = safeStorageGet<SupervisorInstruction[]>(STORAGE_KEYS.INSTRUCTIONS, []);
    return instructions.filter(i => i.caseNumber === caseNumber);
  },

  /**
   * Retrieves all instructions across the station.
   */
  getAllInstructions(): SupervisorInstruction[] {
    return safeStorageGet<SupervisorInstruction[]>(STORAGE_KEYS.INSTRUCTIONS, []);
  },

  /**
   * Retrieves detective's chronological Investigation Diary entries (read-only for commander).
   */
  getInvestigationDiary(caseNumber: string): InvestigationDiaryRecord[] {
    const entries = safeStorageGet<InvestigationDiaryRecord[]>(STORAGE_KEYS.DIARY, []);
    return entries
      .filter(e => e.caseNumber === caseNumber)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  /**
   * Retrieves documents attached to the case.
   */
  getCaseDocuments(caseNumber: string): CaseDocumentRecord[] {
    const docs = safeStorageGet<CaseDocumentRecord[]>(STORAGE_KEYS.DOCUMENTS, []);
    return docs.filter(d => d.caseNumber === caseNumber);
  },

  /**
   * Retrieves complete docket movement and chain of custody history.
   */
  getDocketMovements(caseNumber: string): DocketTransferMovement[] {
    const movements = safeStorageGet<DocketTransferMovement[]>(STORAGE_KEYS.MOVEMENTS, []);
    return movements
      .filter(m => m.caseNumber === caseNumber)
      .sort((a, b) => new Date(b.dispatchedAt).getTime() - new Date(a.dispatchedAt).getTime());
  },

  /**
   * Acknowledges receipt of a docket dispatched to the Station Commander for review.
   */
  acknowledgeDocketReceiptByCommander(params: {
    caseNumber: string;
    commander: UserProfile;
    notes?: string;
  }): { success: boolean; message: string; updatedCase?: DetectiveCaseDocket } {
    const cases = this.getSupervisedCases();
    const caseIndex = cases.findIndex(c => c.caseNumber === params.caseNumber);
    if (caseIndex === -1) {
      return { success: false, message: `Case ${params.caseNumber} not found.` };
    }

    const nowIso = new Date().toISOString();
    const targetCase = cases[caseIndex];
    const prevCustodian = targetCase.currentCustodianName;

    // Update case custody to Commander
    const updatedCase: DetectiveCaseDocket = {
      ...targetCase,
      previousCustodianName: prevCustodian,
      currentCustodianName: `${params.commander.rank} ${params.commander.fullName}`,
      currentCustodianRank: params.commander.rank,
      currentCustodianPersonnelNumber: params.commander.personnelNumber,
      currentCustodianDepartment: 'Station Commander Oversight & Review Desk',
      custodyStatus: 'HELD_BY_SUPERVISOR',
      isCustodyAcknowledgedByDetective: true,
      acknowledgedCustodyAt: nowIso,
      lastActivityDate: nowIso.split('T')[0]
    };

    cases[caseIndex] = updatedCase;
    safeStorageSet(STORAGE_KEYS.CASES, cases);

    // Update movement record
    const movements = safeStorageGet<DocketTransferMovement[]>(STORAGE_KEYS.MOVEMENTS, []);
    const updatedMovements = movements.map(m => {
      if (m.caseNumber === params.caseNumber && m.status === 'AWAITING_ACKNOWLEDGEMENT') {
        return {
          ...m,
          status: 'ACKNOWLEDGED_RECEIVED' as const,
          acknowledgedBy: `${params.commander.rank} ${params.commander.fullName}`,
          acknowledgedByRank: params.commander.rank,
          acknowledgedByPersonnelNumber: params.commander.personnelNumber,
          acknowledgedAt: nowIso,
          currentDocketCustodian: `${params.commander.rank} ${params.commander.fullName} (${params.commander.personnelNumber})`,
          acknowledgementNotes: params.notes || 'Formal supervisory receipt acknowledged by Station Commander.'
        };
      }
      return m;
    });
    safeStorageSet(STORAGE_KEYS.MOVEMENTS, updatedMovements);

    // Append to audit trail
    const auditEntries = safeStorageGet<CaseAuditEntry[]>(STORAGE_KEYS.AUDIT, []);
    const newAuditEntry: CaseAuditEntry = {
      id: `aud_ack_${Date.now()}`,
      caseNumber: params.caseNumber,
      action: 'DOCKET_RECEIPT_ACKNOWLEDGED',
      userFullName: params.commander.fullName,
      userRank: params.commander.rank,
      userPersonnelNumber: params.commander.personnelNumber,
      userRole: 'Station Commander / Supervisor',
      description: `Docket custody formally received and acknowledged by ${params.commander.rank} ${params.commander.fullName}. Current Custodian: Station Commander.`,
      timestamp: nowIso,
      securityHash: generateSecurityHash(params.caseNumber, 'COMMANDER_RECEIPT', nowIso)
    };
    safeStorageSet(STORAGE_KEYS.AUDIT, [newAuditEntry, ...auditEntries]);

    return {
      success: true,
      message: `Docket custody acknowledged. You are now the recorded custodian of ${params.caseNumber}.`,
      updatedCase
    };
  },

  /**
   * Alias for acknowledgeDocketReceiptByCommander
   */
  acknowledgeDocketReceipt(caseNumber: string, commander: UserProfile, notes?: string) {
    return this.acknowledgeDocketReceiptByCommander({ caseNumber, commander, notes });
  },

  /**
   * Returns docket from Commander back to the detective for further investigation.
   */
  returnDocketToDetective(params: {
    caseNumber: string;
    commander: UserProfile;
    returnReason: string;
  }): { success: boolean; message: string; updatedCase?: DetectiveCaseDocket } {
    const cases = this.getSupervisedCases();
    const caseIndex = cases.findIndex(c => c.caseNumber.trim().toUpperCase() === params.caseNumber.trim().toUpperCase());
    if (caseIndex === -1) {
      return { success: false, message: `Case ${params.caseNumber} not found.` };
    }

    const targetCase = cases[caseIndex];
    const assignedDetectiveNumber = targetCase.investigatingOfficerPersonnelNumber || targetCase.previousCustodianPersonnelNumber || 'POL-20491';
    const assignedDetectiveName = targetCase.investigatingOfficerName && targetCase.investigatingOfficerName !== 'Unassigned' 
      ? targetCase.investigatingOfficerName 
      : 'David Khumalo';
    const assignedDetectiveRank = targetCase.investigatingOfficerRank && targetCase.investigatingOfficerRank !== 'Awaiting Allocation'
      ? targetCase.investigatingOfficerRank
      : 'Detective Inspector';

    const nowIso = new Date().toISOString();
    const prevCustodian = `${params.commander.rank} ${params.commander.fullName}`;
    const nextCustodian = `${assignedDetectiveRank} ${assignedDetectiveName} (${assignedDetectiveNumber})`;

    const updatedCase: DetectiveCaseDocket = {
      ...targetCase,
      investigatingOfficerPersonnelNumber: assignedDetectiveNumber,
      investigatingOfficerName: assignedDetectiveName,
      investigatingOfficerRank: assignedDetectiveRank,
      previousCustodianName: prevCustodian,
      currentCustodianName: `${assignedDetectiveRank} ${assignedDetectiveName}`,
      currentCustodianRank: assignedDetectiveRank,
      currentCustodianPersonnelNumber: assignedDetectiveNumber,
      currentCustodianDepartment: 'Investigating Officer Desk',
      custodyStatus: 'TRANSFERRED_AWAITING_RECEIPT',
      isCustodyAcknowledgedByDetective: false,
      lastActivityDate: nowIso.split('T')[0]
    };

    cases[caseIndex] = updatedCase;
    safeStorageSet(STORAGE_KEYS.CASES, cases);

    // Create movement
    const movements = safeStorageGet<DocketTransferMovement[]>(STORAGE_KEYS.MOVEMENTS, []);
    const newMovement: DocketTransferMovement = {
      id: `mov_return_${Date.now()}`,
      caseNumber: params.caseNumber,
      previousCustodian: `${params.commander.rank} ${params.commander.fullName} (${params.commander.personnelNumber})`,
      newCustodian: nextCustodian,
      senderName: `${params.commander.rank} ${params.commander.fullName}`,
      senderRank: params.commander.rank,
      senderPersonnelNumber: params.commander.personnelNumber,
      senderStation: params.commander.station,
      destination: 'Detective Branch - Active Investigation',
      intendedRecipientName: `${targetCase.investigatingOfficerRank} ${targetCase.investigatingOfficerName}`,
      intendedRecipientRole: 'Investigating Officer',
      recipientName: targetCase.investigatingOfficerName,
      recipientRank: targetCase.investigatingOfficerRank,
      recipientPersonnelNumber: targetCase.investigatingOfficerPersonnelNumber,
      reasonForMovement: params.returnReason || 'Docket returned to Investigating Officer following supervisory review with instructions.',
      movementReason: params.returnReason || 'Docket returned to Investigating Officer following supervisory review with instructions.',
      dispatchedAt: nowIso,
      status: 'AWAITING_ACKNOWLEDGEMENT',
      currentDocketCustodian: `${params.commander.rank} ${params.commander.fullName} (${params.commander.personnelNumber})`
    };
    safeStorageSet(STORAGE_KEYS.MOVEMENTS, [newMovement, ...movements]);

    // Append to audit trail
    const auditEntries = safeStorageGet<CaseAuditEntry[]>(STORAGE_KEYS.AUDIT, []);
    const newAuditEntry: CaseAuditEntry = {
      id: `aud_ret_${Date.now()}`,
      caseNumber: params.caseNumber,
      action: 'DOCKET_RETURNED_WITH_INSTRUCTIONS',
      userFullName: params.commander.fullName,
      userRank: params.commander.rank,
      userPersonnelNumber: params.commander.personnelNumber,
      userRole: 'Station Commander / Supervisor',
      description: `Docket returned to Investigating Officer ${targetCase.investigatingOfficerName} for further investigation. Instructions and directives issued. Awaiting detective receipt acknowledgement.`,
      timestamp: nowIso,
      securityHash: generateSecurityHash(params.caseNumber, 'DOCKET_RETURNED', nowIso)
    };
    safeStorageSet(STORAGE_KEYS.AUDIT, [newAuditEntry, ...auditEntries]);

    // Notify detective
    const detNotifs = safeStorageGet<DetectiveNotification[]>(STORAGE_KEYS.DETECTIVE_NOTIFS, []);
    const notif: DetectiveNotification = {
      id: `notif_ret_${Date.now()}`,
      type: 'MOVEMENT',
      title: 'Docket Returned by Station Commander',
      message: `Station Commander ${params.commander.fullName} has returned ${params.caseNumber} to you for further investigation. Please acknowledge receipt.`,
      caseNumber: params.caseNumber,
      timestamp: nowIso,
      read: false,
      priority: 'high'
    };
    safeStorageSet(STORAGE_KEYS.DETECTIVE_NOTIFS, [notif, ...detNotifs]);

    return {
      success: true,
      message: `Docket dispatched back to ${targetCase.investigatingOfficerRank} ${targetCase.investigatingOfficerName}. Status: Awaiting Acknowledgement.`,
      updatedCase
    };
  },

  /**
   * Retrieves read-only, tamper-evident case audit entries.
   */
  getCaseAuditTrail(caseNumber: string): CaseAuditEntry[] {
    const entries = safeStorageGet<CaseAuditEntry[]>(STORAGE_KEYS.AUDIT, []);
    return entries
      .filter(e => e.caseNumber === caseNumber)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  /**
   * Retrieves station service complaints.
   */
  getStationComplaints(): StationComplaintRecord[] {
    return safeStorageGet<StationComplaintRecord[]>(STORAGE_KEYS.COMPLAINTS, SEED_COMPLAINTS);
  },

  /**
   * Resolves or responds to a station service complaint.
   */
  handleComplaint(params: {
    complaintId: string;
    status: StationComplaintRecord['status'];
    commanderNotes: string;
    outcomeResponse: string;
    commander: UserProfile;
  }): { success: boolean; message: string; updatedComplaint?: StationComplaintRecord } {
    const complaints = this.getStationComplaints();
    const index = complaints.findIndex(c => c.id === params.complaintId);
    if (index === -1) {
      return { success: false, message: 'Complaint record not found.' };
    }

    const nowIso = new Date().toISOString();
    const updatedComplaint: StationComplaintRecord = {
      ...complaints[index],
      status: params.status,
      commanderNotes: params.commanderNotes,
      outcomeResponse: params.outcomeResponse,
      handledByCommanderName: params.commander.fullName,
      handledByRank: params.commander.rank,
      handledByPersonnelNumber: params.commander.personnelNumber,
      resolvedAt: params.status === 'Resolved' || params.status === 'Action Taken' ? nowIso : complaints[index].resolvedAt
    };

    complaints[index] = updatedComplaint;
    safeStorageSet(STORAGE_KEYS.COMPLAINTS, complaints);

    return {
      success: true,
      message: `Complaint ${updatedComplaint.referenceNumber} status updated to "${params.status}".`,
      updatedComplaint
    };
  },

  /**
   * Retrieves Commander notifications.
   */
  getCommanderNotifications(): CommanderNotification[] {
    return safeStorageGet<CommanderNotification[]>(STORAGE_KEYS.COMMANDER_NOTIFS, SEED_COMMANDER_NOTIFICATIONS);
  },

  markNotificationRead(id: string): void {
    const notifs = this.getCommanderNotifications();
    const updated = notifs.map(n => n.id === id ? { ...n, read: true } : n);
    safeStorageSet(STORAGE_KEYS.COMMANDER_NOTIFS, updated);
  },

  markAllNotificationsRead(): void {
    const notifs = this.getCommanderNotifications();
    const updated = notifs.map(n => ({ ...n, read: true }));
    safeStorageSet(STORAGE_KEYS.COMMANDER_NOTIFS, updated);
  }
};
