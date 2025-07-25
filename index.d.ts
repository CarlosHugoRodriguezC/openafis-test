/**
 * User object interface - only requires fingerprint property
 */
export interface User {
  /** ISO 19794-2:2005 encoded fingerprint string */
  fingerprint: string;
  /** Any additional user properties */
  [key: string]: any;
}

/**
 * Authentication result interface
 */
export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Access control result interface
 */
export interface AccessResult {
  access: boolean;
  user?: string;
  role?: string;
  permissions?: string[];
  reason?: string;
}

/**
 * Attendance record interface
 */
export interface AttendanceResult {
  success: boolean;
  employeeId?: string;
  name?: string;
  department?: string;
  timestamp?: string;
  error?: string;
}

/**
 * Match a probe fingerprint against an array of users
 * @param probeFingerprint - ISO 19794-2:2005 encoded fingerprint string
 * @param users - Array of user objects containing fingerprint property
 * @returns The matching user object or null if no match found
 */
export function findMatch(probeFingerprint: string, users: User[]): User | null;

/**
 * Legacy function name for backward compatibility
 * @param probeFingerprint - ISO 19794-2:2005 encoded fingerprint string
 * @param users - Array of user objects containing fingerprint property
 * @returns The matching user object or null if no match found
 */
export function matchFingerprint(probeFingerprint: string, users: User[]): User | null;
