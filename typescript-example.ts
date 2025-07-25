// TypeScript example demonstrating how to use fingerprint-matcher in a TypeScript project

import { findMatch, User, AuthResult, AccessResult } from './index';

// Define custom user interfaces extending the base User interface
interface AppUser extends User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
  lastLogin?: Date;
}

interface Employee extends User {
  employeeId: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  isActive: boolean;
}

/**
 * Authentication service with full type safety
 */
class AuthenticationService {
  private users: AppUser[] = [
    {
      id: 1,
      username: "admin",
      email: "admin@company.com",
      role: "admin",
      fingerprint: "Rk1SACAyMAAAA...admin_fingerprint",
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date('2025-07-24')
    },
    {
      id: 2,
      username: "john_doe",
      email: "john@company.com", 
      role: "user",
      fingerprint: "Rk1SACAyMAAAA...john_fingerprint",
      createdAt: new Date('2024-02-15')
    },
    {
      id: 3,
      username: "guest_user",
      email: "guest@company.com",
      role: "guest", 
      fingerprint: "Rk1SACAyMAAAA...guest_fingerprint",
      createdAt: new Date('2024-03-01')
    }
  ];

  /**
   * Authenticate user by fingerprint
   */
  authenticate(fingerprint: string): AuthResult {
    try {
      const user = findMatch(fingerprint, this.users) as AppUser | null;
      
      if (user) {
        // Update last login
        user.lastLogin = new Date();
        
        return {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            fingerprint: user.fingerprint
          }
        };
      } else {
        return {
          success: false,
          error: "Fingerprint not recognized"
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Authentication failed"
      };
    }
  }

  /**
   * Check if user has required role
   */
  hasRole(fingerprint: string, requiredRole: AppUser['role']): AccessResult {
    const user = findMatch(fingerprint, this.users) as AppUser | null;
    
    if (!user) {
      return {
        access: false,
        reason: "User not found"
      };
    }

    const hasAccess = user.role === 'admin' || user.role === requiredRole;
    
    return {
      access: hasAccess,
      user: user.username,
      role: user.role,
      reason: hasAccess ? undefined : `Insufficient permissions. Required: ${requiredRole}, Has: ${user.role}`
    };
  }
}

/**
 * Employee management service
 */
class EmployeeService {
  private employees: Employee[] = [
    {
      employeeId: "EMP001",
      firstName: "Alice",
      lastName: "Johnson",
      department: "Engineering",
      position: "Software Developer",
      isActive: true,
      fingerprint: "Rk1SACAyMAAAA...alice_fingerprint"
    },
    {
      employeeId: "EMP002", 
      firstName: "Bob",
      lastName: "Smith",
      department: "Sales",
      position: "Sales Manager",
      isActive: true,
      fingerprint: "Rk1SACAyMAAAA...bob_fingerprint"
    },
    {
      employeeId: "EMP003",
      firstName: "Carol",
      lastName: "Davis", 
      department: "HR",
      position: "HR Specialist",
      isActive: false,
      fingerprint: "Rk1SACAyMAAAA...carol_fingerprint"
    }
  ];

  /**
   * Find employee by fingerprint
   */
  findEmployee(fingerprint: string): Employee | null {
    return findMatch(fingerprint, this.employees) as Employee | null;
  }

  /**
   * Clock in/out with type-safe attendance record
   */
  recordAttendance(fingerprint: string): {
    success: boolean;
    employee?: Employee;
    timestamp: string;
    error?: string;
  } {
    const employee = this.findEmployee(fingerprint);
    
    if (!employee) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        error: "Employee not found"
      };
    }

    if (!employee.isActive) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        error: "Employee is not active"
      };
    }

    return {
      success: true,
      employee,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Generic service for type-safe fingerprint matching
 */
class GenericFingerprintService<T extends User> {
  constructor(private data: T[]) {}

  findMatch(fingerprint: string): T | null {
    return findMatch(fingerprint, this.data) as T | null;
  }

  addUser(user: T): void {
    this.data.push(user);
  }

  removeUser(predicate: (user: T) => boolean): boolean {
    const index = this.data.findIndex(predicate);
    if (index !== -1) {
      this.data.splice(index, 1);
      return true;
    }
    return false;
  }

  getAllUsers(): T[] {
    return [...this.data];
  }
}

// Demo functions
function demonstrateAuthService(): void {
  console.log('🔒 Authentication Service Demo');
  console.log('='.repeat(40));

  const authService = new AuthenticationService();
  
  // Test authentication
  const authResult = authService.authenticate("Rk1SACAyMAAAA...john_fingerprint");
  console.log('Authentication result:', authResult);
  
  // Test role checking
  const accessResult = authService.hasRole("Rk1SACAyMAAAA...admin_fingerprint", "admin");
  console.log('Access check result:', accessResult);
}

function demonstrateEmployeeService(): void {
  console.log('\n👥 Employee Service Demo');
  console.log('='.repeat(40));

  const employeeService = new EmployeeService();
  
  // Record attendance
  const attendanceResult = employeeService.recordAttendance("Rk1SACAyMAAAA...alice_fingerprint");
  console.log('Attendance result:', attendanceResult);
  
  // Try with inactive employee
  const inactiveResult = employeeService.recordAttendance("Rk1SACAyMAAAA...carol_fingerprint");
  console.log('Inactive employee result:', inactiveResult);
}

function demonstrateGenericService(): void {
  console.log('\n🔧 Generic Service Demo');
  console.log('='.repeat(40));

  // Create a service for custom user type
  interface CustomUser extends User {
    customId: string;
    metadata: Record<string, any>;
  }

  const customUsers: CustomUser[] = [
    {
      customId: "CUSTOM001",
      fingerprint: "Rk1SACAyMAAAA...custom_fp",
      metadata: { source: "api", version: "1.0" }
    }
  ];

  const genericService = new GenericFingerprintService(customUsers);
  const result = genericService.findMatch("Rk1SACAyMAAAA...custom_fp");
  
  console.log('Generic service result:', result);
  console.log('Total users in service:', genericService.getAllUsers().length);
}

// Main demo function
function runTypeScriptDemo(): void {
  console.log('🔷 Fingerprint Matcher - TypeScript Integration Demo');
  console.log('='.repeat(60));
  
  demonstrateAuthService();
  demonstrateEmployeeService();
  demonstrateGenericService();
  
  console.log('\n✨ TypeScript demo completed successfully!');
  console.log('🎯 Benefits demonstrated:');
  console.log('   • Full type safety');
  console.log('   • IntelliSense support');
  console.log('   • Compile-time error checking');
  console.log('   • Generic type support');
  console.log('   • Interface extensions');
}

// Export classes and interfaces for use in other modules
export {
  AuthenticationService,
  EmployeeService,
  GenericFingerprintService,
  AppUser,
  Employee
};

// Run demo if this file is executed directly
if (require.main === module) {
  runTypeScriptDemo();
}
