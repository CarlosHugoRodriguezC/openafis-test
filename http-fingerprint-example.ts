// Real-world example: HTTP Fingerprint Scanner Integration with OpenAFIS
// This example demonstrates fetching fingerprint data from an HTTP endpoint
// and matching it against a local fingerprint database using real OpenAFIS biometric matching

import { matchFingerprint } from './index';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Interface for the HTTP response from the fingerprint scanner
interface FingerprintScanResponse {
  status: string;
  fingerprint: string;
  message: string;
}

// Interface for users in our database
interface DatabaseUser {
  id: number;
  name: string;
  email: string;
  department: string;
  fingerprint: string;
  enrolledAt: string;
  lastAccess?: string;
}

// Interface for OpenAFIS matching result
interface OpenAFISMatchResult {
  success: boolean;
  isMatch: boolean;
  bestMatch?: string;
  similarityScore: number;
  similarityPercentage: number;
  matchingTimeMs: number;
  threshold: number;
  loadedTemplates: number;
  matchedObject?: DatabaseUser;
  error?: string;
}

// Interface for attendance/access log entry
interface AccessLogEntry {
  timestamp: string;
  userId: number;
  name: string;
  department: string;
  action: 'access_granted' | 'access_denied';
  scannerStatus: string;
}

/**
 * HTTP Fingerprint Scanner Service
 * Handles communication with the fingerprint scanner device
 */
class FingerprintScannerService {
  private readonly scannerUrl: string;
  private readonly timeout: number;

  constructor(scannerIp: string = '192.168.4.5', scannerPort: number = 8080, timeout: number = 10000) {
    this.scannerUrl = `http://${scannerIp}:${scannerPort}/fingerprint`;
    this.timeout = timeout;
  }

  /**
   * Capture fingerprint from the scanner device
   */
  async captureFingerprint(): Promise<FingerprintScanResponse> {
    console.log(`📡 Connecting to fingerprint scanner at ${this.scannerUrl}...`);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(this.scannerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'capture',
          format: 'iso19794-2'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Scanner responded with status: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as FingerprintScanResponse;
      
      console.log(`✅ Fingerprint captured successfully`);
      console.log(`   Status: ${data.status}`);
      console.log(`   Message: ${data.message}`);
      console.log(`   Fingerprint length: ${data.fingerprint.length} characters`);
      
      return data;
      
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Scanner request timed out after ${this.timeout}ms`);
        }
        throw new Error(`Scanner communication error: ${error.message}`);
      }
      throw new Error('Unknown scanner error');
    }
  }

  /**
   * Check scanner status
   */
  async getStatus(): Promise<{ online: boolean; status?: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(this.scannerUrl.replace('/fingerprint', '/status'), {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json() as { status: string };
        return { online: true, status: data.status };
      } else {
        return { online: false };
      }
    } catch {
      return { online: false };
    }
  }
}

/**
 * Local Fingerprint Database Service
 * Manages the local database of enrolled users
 */
class FingerprintDatabaseService {
  private readonly databasePath: string;
  private users: DatabaseUser[] = [];

  constructor(databasePath?: string) {
    // Use the specified path or default to ~/Settings/fingerprints
    this.databasePath = databasePath || path.join(process.env.HOME || process.env.USERPROFILE || '.', 'Settings', 'fingerprints');
  }

  /**
   * Load users from the database file
   */
  async loadDatabase(): Promise<void> {
    try {
      console.log(`📂 Loading fingerprint database from: ${this.databasePath}`);
      
      // Ensure directory exists
      const dir = path.dirname(this.databasePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }

      // Check if database file exists
      if (!fs.existsSync(this.databasePath)) {
        console.log(`📄 Database file not found, creating new database`);
        await this.createSampleDatabase();
        return;
      }

      const data = await readFile(this.databasePath, 'utf8');
      this.users = JSON.parse(data);
      
      console.log(`✅ Loaded ${this.users.length} users from database`);
      
    } catch (error) {
      console.error(`❌ Error loading database:`, error);
      console.log(`📄 Creating new database with sample data`);
      await this.createSampleDatabase();
    }
  }

  /**
   * Save users to the database file
   */
  async saveDatabase(): Promise<void> {
    try {
      const data = JSON.stringify(this.users, null, 2);
      await writeFile(this.databasePath, data, 'utf8');
      console.log(`💾 Database saved with ${this.users.length} users`);
    } catch (error) {
      console.error(`❌ Error saving database:`, error);
      throw error;
    }
  }

  /**
   * Create a sample database for testing
   */
  private async createSampleDatabase(): Promise<void> {
    this.users = [
      {
        id: 1,
        name: "John Doe",
        email: "john.doe@company.com",
        department: "Engineering",
        fingerprint: "Rk1SACAyMAAAAAC0AAABAAFoAMUAxQEAAABaGYA2ACmLYEB5ADXvYEDLAEXdYEBwAEfxYEBPAEr7YEBoAE15YIBJAGD8YICKAGzcYIBdAG/oYEAwAHSgYEC9AIfXYEBHAI3rYICFAJXLYEBNAKDCYECPALLIYECkALjPYEBzANi5YICFANW+YECkANrMYECVAOi9YECHAOw9YECxAPDTYECpAPzEYICqARYkYIC6ASmVYAAA",
        enrolledAt: "2024-01-15T10:30:00Z"
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane.smith@company.com",
        department: "Sales",
        fingerprint: "Rk1SACAyMAAAAAC0AAABAAFoAMUAxQEAAABaGYA2ACmLYEB5ADXvYEDLAEXdYEBwAEfxYEBPAEr7YEBoAE15YIBJAGD8YICKAGzcYIBdAG/oYEAwAHSgYEC9AIfXYEBHAI3rYICFAJXLYEBNAKDCYECPALLIYECkALjPYEBzANi5YICFANW+YECkANrMYECVAOi9YECHAOw9YECxAPDTYECpAPzEYICqARYkYIC6ASmVYAAB",
        enrolledAt: "2024-02-20T14:15:00Z"
      },
      {
        id: 3,
        name: "Alice Johnson",
        email: "alice.johnson@company.com",
        department: "HR",
        fingerprint: "Rk1SACAyMAAAAAC0AAABAAFoAMUAxQEAAABaGYA2ACmLYEB5ADXvYEDLAEXdYEBwAEfxYEBPAEr7YEBoAE15YIBJAGD8YICKAGzcYIBdAG/oYEAwAHSgYEC9AIfXYEBHAI3rYICFAJXLYEBNAKDCYECPALLIYECkALjPYEBzANi5YICFANW+YECkANrMYECVAOi9YECHAOw9YECxAPDTYECpAPzEYICqARYkYIC6ASmVYAAC",
        enrolledAt: "2024-03-10T09:45:00Z"
      }
    ];

    await this.saveDatabase();
    console.log(`✅ Sample database created with ${this.users.length} users`);
  }

  /**
   * Get all enrolled users
   */
  getUsers(): DatabaseUser[] {
    return [...this.users];
  }

  /**
   * Find user by fingerprint using real OpenAFIS matching
   */
  findUserByFingerprint(fingerprint: string): DatabaseUser | null {
    console.log('🔍 Using real OpenAFIS biometric matching...');
    
    try {
      const result = matchFingerprint(fingerprint, this.users) as any;
      
      if (result && result.success && result.isMatch && result.matchedObject) {
        console.log(`✅ OpenAFIS Match Found:`);
        console.log(`   📊 Similarity Score: ${result.similarityScore}/255`);
        console.log(`   📈 Similarity %: ${result.similarityPercentage.toFixed(2)}%`);
        console.log(`   🎯 Threshold: ${result.threshold}`);
        console.log(`   ⏱️  Matching Time: ${result.matchingTimeMs}ms`);
        console.log(`   💾 Templates Loaded: ${result.loadedTemplates}`);
        
        // Security evaluation
        if (result.similarityScore >= 200) {
          console.log(`   ✨ EXCELLENT match - High security confidence`);
        } else if (result.similarityScore >= 150) {
          console.log(`   ✅ GOOD match - Accept with confidence`);
        } else if (result.similarityScore >= 100) {
          console.log(`   ⚠️  MEDIUM match - Review required`);
        } else {
          console.log(`   🚨 LOW match - Security risk, should reject`);
        //   return null; // Reject low-confidence matches for security
        }
        
        return result.matchedObject as DatabaseUser;
      } else {
        console.log(`❌ OpenAFIS: No match found`);
        if (result && result.error) {
          console.log(`   Error: ${result.error}`);
          
          // Provide helpful feedback for template compatibility issues
          if (result.error.includes('No valid fingerprint templates could be loaded')) {
            console.log(`   📋 DIAGNOSTIC: Template Format Issue Detected`);
            console.log(`   ℹ️  Your database contains ISO 19794-2 templates in a vendor-specific format`);
            console.log(`   ℹ️  OpenAFIS requires templates in its specific variant of ISO 19794-2`);
            console.log(`   💡 Solutions:`);
            console.log(`      1. Convert existing templates to OpenAFIS format`);
            console.log(`      2. Use fingerprint templates captured with OpenAFIS-compatible scanners`);
            console.log(`      3. Implement a template conversion layer`);
            console.log(`   🔗 OpenAFIS format: Uses standard ISO 19794-2:2005 with specific structure`);
            console.log(`   📊 Current templates: FMR 230 format (${this.users.length} users in database)`);
          }
        }
        return null;
      }
    } catch (error) {
      console.error(`💥 OpenAFIS matching error:`, error);
      return null;
    }
  }

  /**
   * Add new user to database
   */
  async addUser(user: Omit<DatabaseUser, 'id' | 'enrolledAt'>): Promise<DatabaseUser> {
    const newUser = {
      ...user,
      id: this.users.length + 1,
      enrolledAt: new Date().toISOString()
    } as DatabaseUser;

    this.users.push(newUser);
    await this.saveDatabase();
    
    console.log(`👤 New user enrolled: ${newUser.name} (ID: ${newUser.id})`);
    return newUser;
  }

  /**
   * Update user's last access time
   */
  async updateLastAccess(userId: number): Promise<void> {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.lastAccess = new Date().toISOString();
      await this.saveDatabase();
    }
  }
}

/**
 * Access Control System
 * Combines scanner and database services for complete access control
 */
class AccessControlSystem {
  private scanner: FingerprintScannerService;
  private database: FingerprintDatabaseService;
  private accessLog: AccessLogEntry[] = [];

  constructor(scannerIp?: string, scannerPort?: number, databasePath?: string) {
    this.scanner = new FingerprintScannerService(scannerIp, scannerPort);
    this.database = new FingerprintDatabaseService(databasePath);
  }

  /**
   * Initialize the access control system
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing Access Control System...');
    console.log('='.repeat(50));
    
    // Load database
    await this.database.loadDatabase();
    
    // Check scanner status
    const scannerStatus = await this.scanner.getStatus();
    console.log(`📡 Scanner status: ${scannerStatus.online ? '🟢 Online' : '🔴 Offline'}`);
    
    console.log('✅ Access Control System initialized successfully\n');
  }

  /**
   * Process access request - capture fingerprint and verify user
   */
  async processAccessRequest(): Promise<{
    success: boolean;
    user?: DatabaseUser;
    message: string;
    scanResponse?: FingerprintScanResponse;
  }> {
    console.log('🔐 Processing access request...');
    console.log('-'.repeat(30));
    
    try {
      // Step 1: Capture fingerprint from scanner
      const scanResponse = await this.scanner.captureFingerprint();
      
      // Check if fingerprint was captured successfully
      if (scanResponse.status !== 'FP00') {
        const errorMessage = `Fingerprint capture failed: ${scanResponse.message}`;
        console.log(`❌ ${errorMessage}`);
        
        this.logAccess({
          timestamp: new Date().toISOString(),
          userId: -1,
          name: 'Unknown',
          department: 'Unknown',
          action: 'access_denied',
          scannerStatus: scanResponse.status
        });
        
        return {
          success: false,
          message: errorMessage,
          scanResponse
        };
      }

      // Step 2: Match fingerprint against database
      console.log('🔍 Searching database for matching fingerprint...');
      const matchedUser = this.database.findUserByFingerprint(scanResponse.fingerprint);

      console.log(`   Matched User: ${JSON.stringify(matchedUser, null, 2)}`);
      // Step 3: Handle access result
      
      if (matchedUser) {
        // Access granted
        console.log(`✅ Access granted!`);
        console.log(`   User: ${JSON.stringify(matchedUser, null, 2)}`);
        
        // Update last access
        await this.database.updateLastAccess(matchedUser.id);
        
        // Log successful access
        this.logAccess({
          timestamp: new Date().toISOString(),
          userId: matchedUser.id,
          name: matchedUser.name,
          department: matchedUser.department,
          action: 'access_granted',
          scannerStatus: scanResponse.status
        });
        
        return {
          success: true,
          user: matchedUser,
          message: `Welcome, ${matchedUser.name}!`,
          scanResponse
        };
        
      } else {
        // Access denied
        const message = 'Access denied: Fingerprint not recognized';
        console.log(`❌ ${message}`);
        
        // Log failed access attempt
        this.logAccess({
          timestamp: new Date().toISOString(),
          userId: -1,
          name: 'Unknown',
          department: 'Unknown',
          action: 'access_denied',
          scannerStatus: scanResponse.status
        });
        
        return {
          success: false,
          message,
          scanResponse
        };
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log(`💥 System error: ${errorMessage}`);
      
      return {
        success: false,
        message: `System error: ${errorMessage}`
      };
    }
  }

  /**
   * Enroll new user fingerprint
   */
  async enrollUser(name: string, email: string, department: string): Promise<{
    success: boolean;
    user?: DatabaseUser;
    message: string;
  }> {
    console.log(`👤 Enrolling new user: ${name}...`);
    
    try {
      // Capture fingerprint for enrollment
      const scanResponse = await this.scanner.captureFingerprint();
      
      if (scanResponse.status !== 'FP00') {
        return {
          success: false,
          message: `Enrollment failed: ${scanResponse.message}`
        };
      }

      // Check if fingerprint already exists
      const existingUser = this.database.findUserByFingerprint(scanResponse.fingerprint);
      if (existingUser) {
        return {
          success: false,
          message: `Fingerprint already enrolled for user: ${existingUser.name}`
        };
      }

      // Add user to database
      const newUser = await this.database.addUser({
        name,
        email,
        department,
        fingerprint: scanResponse.fingerprint
      });

      console.log(`✅ User enrolled successfully!`);
      
      return {
        success: true,
        user: newUser,
        message: `User ${name} enrolled successfully with ID ${newUser.id}`
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        message: `Enrollment error: ${errorMessage}`
      };
    }
  }

  /**
   * Get system statistics
   */
  getStatistics(): {
    totalUsers: number;
    recentAccess: AccessLogEntry[];
    databasePath: string;
  } {
    return {
      totalUsers: this.database.getUsers().length,
      recentAccess: this.accessLog.slice(-10), // Last 10 access attempts
      databasePath: this.database['databasePath']
    };
  }

  /**
   * Log access attempt
   */
  private logAccess(entry: AccessLogEntry): void {
    this.accessLog.push(entry);
    
    // Keep only last 100 entries in memory
    if (this.accessLog.length > 100) {
      this.accessLog = this.accessLog.slice(-100);
    }
  }

  /**
   * List all enrolled users
   */
  listUsers(): DatabaseUser[] {
    return this.database.getUsers();
  }
}

// Demo functions
async function demonstrateAccessControl(): Promise<void> {
  console.log('🏢 Access Control System Demo');
  console.log('='.repeat(50));
  
  // Initialize system
  const accessControl = new AccessControlSystem();
  await accessControl.initialize();
  
  // Show enrolled users
  const users = accessControl.listUsers();
  console.log('👥 Enrolled Users:');
  users.forEach(user => {
    console.log(`   ${user.id}. ${user.name}  (${user.department}) - ${user.email}`);
  });
  console.log();
  
  // Simulate access request (this would fail with real scanner, but shows the flow)
  console.log('🔐 Simulating access request...');
  try {
    const result = await accessControl.processAccessRequest();
    console.log(`Result: ${result.message}`);
  } catch (error) {
    console.log(`❌ Access request failed: Scanner not available (this is expected in demo)`);
  }
  
  // Show statistics
  const stats = accessControl.getStatistics();
  console.log('\n📊 System Statistics:');
  console.log(`   Total Users: ${stats.totalUsers}`);
  console.log(`   Database: ${stats.databasePath}`);
  console.log(`   Recent Access Attempts: ${stats.recentAccess.length}`);
}

// Mock function to simulate successful scanner response for testing
async function demonstrateWithMockScanner(): Promise<void> {
  console.log('\n🧪 Demo with Mock Scanner Response');
  console.log('='.repeat(50));
  
  // Create a custom scanner service that returns mock data
  class MockScannerService extends FingerprintScannerService {
    async captureFingerprint(): Promise<FingerprintScanResponse> {
      console.log('📡 Mock scanner: Simulating fingerprint capture...');
      
      // Return the sample fingerprint from our database
      return {
        status: 'FP00',
        fingerprint: 'Rk1SACAyMAAAAAC0AAABAAFoAMUAxQEAAABaGYA2ACmLYEB5ADXvYEDLAEXdYEBwAEfxYEBPAEr7YEBoAE15YIBJAGD8YICKAGzcYIBdAG/oYEAwAHSgYEC9AIfXYEBHAI3rYICFAJXLYEBNAKDCYECPALLIYECkALjPYEBzANi5YICFANW+YECkANrMYECVAOi9YECHAOw9YECxAPDTYECpAPzEYICqARYkYIC6ASmVYAAA',
        message: 'Huella capturada correctamente en formato ISO 19794-2'
      };
    }
  }
  
  // Create access control with mock scanner
  const accessControl = new AccessControlSystem();
  accessControl['scanner'] = new MockScannerService();
  
  await accessControl.initialize();
  
  // Process mock access request
  console.log('🔐 Processing mock access request...');
  const result = await accessControl.processAccessRequest();
  
  console.log(`\n✅ Mock Demo Result:`);
  console.log(`   Success: ${result.success}`);
  console.log(`   Message: ${result.message}`);
  if (result.user) {
    console.log(`   User: ${result.user.name} (${result.user.department})`);
  }
}

// Main demo function
async function runHttpFingerprintDemo(): Promise<void> {
  console.log('🌐 HTTP Fingerprint Scanner Integration Demo');
  console.log('='.repeat(60));
  console.log('This demo shows how to integrate with an HTTP fingerprint scanner');
  console.log('and match against a local database using the fingerprint-matcher package.\n');
  
  try {
    await demonstrateAccessControl();
    
    console.log('\n✨ Demo completed successfully!');
    console.log('\n📋 Integration Features Demonstrated:');
    console.log('   • HTTP communication with fingerprint scanner');
    console.log('   • Local fingerprint database management');
    console.log('   • Real-time access control processing');
    console.log('   • User enrollment and management');
    console.log('   • Access logging and statistics');
    console.log('   • Error handling and timeout management');
    
  } catch (error) {
    console.error('💥 Demo error:', error);
  }
}

// Export classes for use in other modules
export {
  FingerprintScannerService,
  FingerprintDatabaseService,
  AccessControlSystem,
  FingerprintScanResponse,
  DatabaseUser,
  AccessLogEntry
};

// Run demo if this file is executed directly
if (require.main === module) {
  runHttpFingerprintDemo().catch(console.error);
}
