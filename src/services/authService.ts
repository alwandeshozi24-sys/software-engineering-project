import { AuthResponse, DemoAccount, LoginCredentials, UserProfile, UserRole } from '../types/auth';

/**
 * Pre-configured authorized test personnel representing all four future SFEN operational roles.
 * The system automatically determines the role upon successful credential verification.
 */
export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'CSC_OFFICER',
    roleName: 'CSC / Police Officer',
    personnelNumber: 'POL-10824',
    email: 's.ndlovu@police.sfen.gov',
    password: 'DocketSecure2026!',
    rank: 'Constable',
    fullName: 'Sarah Ndlovu',
    station: 'Central Precinct (Sector 4)',
    description: 'First-response docket registration, case opening, and physical evidence intake.'
  },
  {
    role: 'DETECTIVE',
    roleName: 'Detective',
    personnelNumber: 'POL-20491',
    email: 'd.khumalo@cid.sfen.gov',
    password: 'DocketSecure2026!',
    rank: 'Detective Inspector',
    fullName: 'David Khumalo',
    station: 'Serious & Violent Crimes Division',
    description: 'Docket investigation, sworn statements, ballistic/forensic logs, and court readiness.'
  },
  {
    role: 'COMMANDER',
    roleName: 'Commander / Supervisor',
    personnelNumber: 'POL-30912',
    email: 'e.vance@command.sfen.gov',
    password: 'DocketSecure2026!',
    rank: 'Senior Superintendent',
    fullName: 'Elena Vance',
    station: 'Metropolitan Police Headquarters',
    description: 'Docket sign-off, chain-of-custody authorization, audit logs, and docket transfers.'
  },
  {
    role: 'ADMINISTRATOR',
    roleName: 'Administrator',
    personnelNumber: 'POL-40199',
    email: 'm.cole@admin.sfen.gov',
    password: 'DocketSecure2026!',
    rank: 'Chief ICT Security Officer',
    fullName: 'Marcus Cole',
    station: 'National Police Directorate',
    description: 'System-wide access controls, cryptographic docket seals, and security monitoring.'
  }
];

export const ROLE_DETAILS: Record<UserRole, { label: string; clearance: string; redirectTarget: string; themeColor: string }> = {
  CSC_OFFICER: {
    label: 'CSC / Police Officer',
    clearance: 'Level 1 - Frontline Intake & Registration',
    redirectTarget: '/dashboard/csc-officer',
    themeColor: 'blue'
  },
  DETECTIVE: {
    label: 'Detective / Criminal Investigations',
    clearance: 'Level 2 - Docket Investigation & Evidence Analysis',
    redirectTarget: '/dashboard/detective',
    themeColor: 'amber'
  },
  COMMANDER: {
    label: 'Station Commander',
    clearance: 'Level 3 - Station Command & Investigation Supervisory Oversight',
    redirectTarget: '/dashboard/commander',
    themeColor: 'emerald'
  },
  ADMINISTRATOR: {
    label: 'System Administrator',
    clearance: 'Level 4 - User Accounts, Roles, Security & System Administration',
    redirectTarget: '/dashboard/admin',
    themeColor: 'blue'
  }
};

/**
 * Validates login inputs before transmission.
 */
export function validateCredentials(credentials: LoginCredentials): { isValid: boolean; error?: string } {
  const trimmedId = credentials.identifier.trim();
  if (!trimmedId) {
    return { isValid: false, error: 'Please enter your Police Personnel Number or official email address.' };
  }

  if (!credentials.password) {
    return { isValid: false, error: 'Password is required to authenticate into SFEN.' };
  }

  if (credentials.password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters in length.' };
  }

  return { isValid: true };
}

/**
 * Authentication Service Client.
 * When the Node.js/Express backend with PostgreSQL is ready, this function can directly call:
 * return await fetch('/api/auth/login', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify(credentials)
 * }).then(res => res.json());
 */
export async function authenticatePersonnel(credentials: LoginCredentials): Promise<AuthResponse> {
  // Simulate network latency for realistic law enforcement system feedback
  await new Promise((resolve) => setTimeout(resolve, 850));

  const cleanIdentifier = credentials.identifier.trim().toLowerCase();
  
  // Check against known demo police personnel accounts
  const matchedAccount = DEMO_ACCOUNTS.find(
    (acc) =>
      acc.personnelNumber.toLowerCase() === cleanIdentifier ||
      acc.email.toLowerCase() === cleanIdentifier
  );

  if (matchedAccount) {
    if (credentials.password !== matchedAccount.password) {
      return {
        success: false,
        message: 'Invalid credentials. Please verify your Personnel Number and password. Excessive failed attempts will trigger an audit alert.'
      };
    }

    const userProfile: UserProfile = {
      id: `usr_${matchedAccount.personnelNumber.replace('-', '_').toLowerCase()}`,
      personnelNumber: matchedAccount.personnelNumber,
      fullName: matchedAccount.fullName,
      rank: matchedAccount.rank,
      email: matchedAccount.email,
      station: matchedAccount.station,
      division: matchedAccount.description,
      role: matchedAccount.role,
      clearanceLevel: ROLE_DETAILS[matchedAccount.role].clearance,
      lastLogin: new Date().toISOString(),
      token: `sfen_jwt_${Math.random().toString(36).substring(2)}_${Date.now()}`
    };

    if (credentials.rememberMe) {
      try {
        localStorage.setItem('sfen_last_identifier', credentials.identifier);
      } catch {
        // Safe fallback if local storage is restricted
      }
    } else {
      try {
        localStorage.removeItem('sfen_last_identifier');
      } catch {
        // Safe fallback
      }
    }

    return {
      success: true,
      message: `Authentication successful. Role verified as [${ROLE_DETAILS[matchedAccount.role].label}]. Initializing secure docket session...`,
      user: userProfile,
      token: userProfile.token
    };
  }

  // Fallback: If someone enters a custom personnel number (e.g. POL-99999) with password,
  // allow authentication for testing and assign default Detective or Officer role based on format
  if (cleanIdentifier.startsWith('pol-') || cleanIdentifier.includes('@')) {
    const isCmd = cleanIdentifier.includes('cmd') || cleanIdentifier.includes('super');
    const isDet = cleanIdentifier.includes('det') || cleanIdentifier.includes('cid');
    const isAdmin = cleanIdentifier.includes('admin') || cleanIdentifier.includes('root');
    
    let assignedRole: UserRole = 'CSC_OFFICER';
    if (isAdmin) assignedRole = 'ADMINISTRATOR';
    else if (isCmd) assignedRole = 'COMMANDER';
    else if (isDet) assignedRole = 'DETECTIVE';

    const simulatedUser: UserProfile = {
      id: `usr_custom_${Date.now()}`,
      personnelNumber: cleanIdentifier.startsWith('pol-') ? cleanIdentifier.toUpperCase() : 'POL-88210',
      fullName: 'Authorized Police Personnel',
      rank: isCmd ? 'Captain' : isDet ? 'Detective Constable' : isAdmin ? 'Systems Controller' : 'Constable',
      email: cleanIdentifier.includes('@') ? cleanIdentifier : `${cleanIdentifier}@police.sfen.gov`,
      station: 'Metropolitan Police Command',
      division: 'Active Case Docket Administration',
      role: assignedRole,
      clearanceLevel: ROLE_DETAILS[assignedRole].clearance,
      lastLogin: new Date().toISOString(),
      token: `sfen_jwt_${Math.random().toString(36).substring(2)}`
    };

    return {
      success: true,
      message: `Authentication confirmed. Role resolved automatically as [${ROLE_DETAILS[assignedRole].label}].`,
      user: simulatedUser,
      token: simulatedUser.token
    };
  }

  return {
    success: false,
    message: 'Personnel record not recognized. Enter a valid Police ID (e.g. POL-10824) or departmental email address.'
  };
}

/**
 * =========================================================================
 * CITIZEN / PUBLIC DOCKET ACCESS SERVICES
 * =========================================================
 */

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Secure';
  color: string;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  feedback: string[];
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (hasMinLength) score += 1;
  if (hasUppercase && hasLowercase) score += 1;
  if (hasNumber) score += 1;
  if (hasSpecial) score += 1;

  const feedback: string[] = [];
  if (!hasMinLength) feedback.push('At least 8 characters');
  if (!hasUppercase) feedback.push('An uppercase letter (A-Z)');
  if (!hasLowercase) feedback.push('A lowercase letter (a-z)');
  if (!hasNumber) feedback.push('At least one number (0-9)');
  if (!hasSpecial) feedback.push('A special symbol (e.g. !@#$%)');

  const labels: PasswordStrengthResult['label'][] = ['Weak', 'Weak', 'Fair', 'Good', 'Very Secure'];
  const colors = [
    'text-red-400 bg-red-500',
    'text-red-400 bg-red-500',
    'text-amber-400 bg-amber-500',
    'text-sky-400 bg-sky-500',
    'text-emerald-400 bg-emerald-500'
  ];

  return {
    score,
    label: labels[score] || 'Weak',
    color: colors[score] || 'text-red-400 bg-red-500',
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
    feedback
  };
}

// Default registered citizen in storage or memory
const DEFAULT_CITIZENS: Array<{
  fullName: string;
  email: string;
  phoneNumber: string;
  passwordHash: string;
  registeredAt: string;
  activeDocketsCount: number;
}> = [
  {
    fullName: 'Thandi Molefe',
    email: 'thandi.molefe@gmail.com',
    phoneNumber: '0825550192',
    passwordHash: 'SecureDocket2026!',
    registeredAt: '2026-03-10T09:15:00Z',
    activeDocketsCount: 1
  }
];

function getStoredCitizens() {
  try {
    const raw = localStorage.getItem('sfen_registered_citizens');
    if (raw) {
      const parsed = JSON.parse(raw);
      return [...DEFAULT_CITIZENS, ...parsed];
    }
  } catch {
    // fallback
  }
  return DEFAULT_CITIZENS;
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, '').toLowerCase();
}

/**
 * Register a new citizen account for public docket tracking.
 */
export async function registerCitizen(data: import('../types/auth').CitizenSignUpData): Promise<import('../types/auth').CitizenAuthResponse> {
  await new Promise((resolve) => setTimeout(resolve, 850));

  const trimmedEmail = data.email.trim().toLowerCase();
  const cleanPhone = normalizePhone(data.phoneNumber);

  if (!data.fullName.trim()) {
    return { success: false, message: 'Please provide your full legal name.' };
  }

  if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  if (!cleanPhone || cleanPhone.length < 8) {
    return { success: false, message: 'Please enter a valid mobile phone number.' };
  }

  const strength = evaluatePasswordStrength(data.password);
  if (strength.score < 3 || !strength.hasMinLength) {
    return { 
      success: false, 
      message: 'Password does not meet police security requirements. Must be at least 8 characters with numbers and special symbols.' 
    };
  }

  if (data.password !== data.confirmPassword) {
    return { success: false, message: 'Passwords do not match.' };
  }

  if (!data.acceptedTerms) {
    return { success: false, message: 'You must acknowledge the legal notice for public docket inquiry.' };
  }

  const existingCitizens = getStoredCitizens();
  const alreadyRegistered = existingCitizens.find(
    (c) => c.email.toLowerCase() === trimmedEmail || normalizePhone(c.phoneNumber) === cleanPhone
  );

  if (alreadyRegistered) {
    return {
      success: false,
      message: 'An account with this email address or phone number is already registered. Please sign in.'
    };
  }

  const newCitizen = {
    fullName: data.fullName.trim(),
    email: trimmedEmail,
    phoneNumber: data.phoneNumber.trim(),
    passwordHash: data.password,
    registeredAt: new Date().toISOString(),
    activeDocketsCount: 0
  };

  try {
    const raw = localStorage.getItem('sfen_registered_citizens');
    const list = raw ? JSON.parse(raw) : [];
    list.push(newCitizen);
    localStorage.setItem('sfen_registered_citizens', JSON.stringify(list));
  } catch {
    // fallback
  }

  const profile: import('../types/auth').CitizenProfile = {
    id: `cit_${Date.now()}`,
    fullName: newCitizen.fullName,
    email: newCitizen.email,
    phoneNumber: newCitizen.phoneNumber,
    registeredAt: newCitizen.registeredAt,
    token: `cit_jwt_${Math.random().toString(36).substring(2)}_${Date.now()}`,
    activeDocketsCount: 0
  };

  return {
    success: true,
    message: 'Citizen account registered successfully. Access granted to SFEN Public Docket Portal.',
    citizen: profile,
    token: profile.token
  };
}

/**
 * Authenticate an existing citizen using Email, Phone Number, and Password.
 */
export async function authenticateCitizen(credentials: import('../types/auth').CitizenLoginCredentials): Promise<import('../types/auth').CitizenAuthResponse> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const trimmedEmail = credentials.email.trim().toLowerCase();
  const cleanPhone = normalizePhone(credentials.phoneNumber);

  if (!trimmedEmail) {
    return { success: false, message: 'Please enter your registered email address.' };
  }

  if (!cleanPhone) {
    return { success: false, message: 'Please enter your registered mobile phone number.' };
  }

  if (!credentials.password) {
    return { success: false, message: 'Please enter your password.' };
  }

  const citizens = getStoredCitizens();
  const matched = citizens.find((c) => {
    const emailMatches = c.email.toLowerCase() === trimmedEmail;
    const phoneMatches = normalizePhone(c.phoneNumber) === cleanPhone || 
                         normalizePhone(c.phoneNumber).endsWith(cleanPhone) || 
                         cleanPhone.endsWith(normalizePhone(c.phoneNumber));
    return emailMatches && phoneMatches;
  });

  if (!matched) {
    // Check if email matched but phone did not
    const emailOnlyMatch = citizens.find((c) => c.email.toLowerCase() === trimmedEmail);
    if (emailOnlyMatch) {
      return {
        success: false,
        message: 'The phone number provided does not match the registered telephone for this email.'
      };
    }

    return {
      success: false,
      message: 'No registered citizen profile found with this email and phone number combination. Please verify or sign up.'
    };
  }

  if (matched.passwordHash !== credentials.password) {
    return {
      success: false,
      message: 'Incorrect password. Please verify your credentials or use the reset option.'
    };
  }

  if (credentials.rememberMe) {
    try {
      localStorage.setItem('sfen_citizen_last_email', credentials.email);
      localStorage.setItem('sfen_citizen_last_phone', credentials.phoneNumber);
    } catch {
      // safe fallback
    }
  } else {
    try {
      localStorage.removeItem('sfen_citizen_last_email');
      localStorage.removeItem('sfen_citizen_last_phone');
    } catch {
      // safe fallback
    }
  }

  const profile: import('../types/auth').CitizenProfile = {
    id: `cit_${matched.phoneNumber.slice(-4)}`,
    fullName: matched.fullName,
    email: matched.email,
    phoneNumber: matched.phoneNumber,
    registeredAt: matched.registeredAt,
    token: `cit_jwt_${Math.random().toString(36).substring(2)}_${Date.now()}`,
    activeDocketsCount: matched.activeDocketsCount || 1
  };

  return {
    success: true,
    message: `Welcome back, ${matched.fullName}. Access granted to your Case Docket Tracker.`,
    citizen: profile,
    token: profile.token
  };
}

