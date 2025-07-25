import { findMatch, User, AuthResult, AccessResult, AttendanceResult } from './index';

// TypeScript test demonstrating type safety and IntelliSense support

interface ExtendedUser extends User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

interface Employee extends User {
  employeeId: string;
  name: string;
  department: string;
}

/**
 * Test TypeScript integration with authentication
 */
function testAuthenticationTS(): void {
  console.log('🔷 TypeScript Authentication Test');
  console.log('='.repeat(40));

  const probeFingerprint: string = "Rk1SACAyMAAAA...probe_fp";
  
  const users: ExtendedUser[] = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com", 
      role: "admin",
      fingerprint: "Rk1SACAyMAAAA...john_fp"
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "user", 
      fingerprint: "Rk1SACAyMAAAA...jane_fp"
    }
  ];

  const matchedUser: ExtendedUser | null = findMatch(probeFingerprint, users) as ExtendedUser | null;
  
  if (matchedUser) {
    console.log(`✅ Authentication successful!`);
    console.log(`   User ID: ${matchedUser.id}`);
    console.log(`   Name: ${matchedUser.name}`);
    console.log(`   Email: ${matchedUser.email}`);
    console.log(`   Role: ${matchedUser.role}`);
  } else {
    console.log(`❌ No match found`);
  }
}

/**
 * Test with employee data structure
 */
function testEmployeeAttendanceTS(): void {
  console.log('\n🔷 TypeScript Employee Attendance Test');
  console.log('='.repeat(40));

  const fingerprint: string = "Rk1SACAyMAAAA...alice_fp";
  
  const employees: Employee[] = [
    {
      employeeId: "EMP001",
      name: "Alice Johnson",
      department: "Engineering",
      fingerprint: "Rk1SACAyMAAAA...alice_fp"
    },
    {
      employeeId: "EMP002",
      name: "Bob Smith", 
      department: "Sales",
      fingerprint: "Rk1SACAyMAAAA...bob_fp"
    }
  ];

  const employee: Employee | null = findMatch(fingerprint, employees) as Employee | null;
  
  if (employee) {
    const attendanceRecord: AttendanceResult = {
      success: true,
      employeeId: employee.employeeId,
      name: employee.name,
      department: employee.department,
      timestamp: new Date().toISOString()
    };
    
    console.log(`✅ Attendance recorded:`);
    console.log(`   Employee: ${attendanceRecord.name} (${attendanceRecord.employeeId})`);
    console.log(`   Department: ${attendanceRecord.department}`);
    console.log(`   Time: ${attendanceRecord.timestamp}`);
  } else {
    console.log(`❌ Employee not found`);
  }
}

/**
 * Test type safety - this would cause TypeScript errors if uncommented
 */
function testTypeSafety(): void {
  console.log('\n🔷 TypeScript Type Safety Demo');
  console.log('='.repeat(40));

  // These would cause TypeScript compilation errors:
  
  // ❌ Missing fingerprint property
  // const invalidUser = { name: "Invalid User" };
  // findMatch("test", [invalidUser]); // Error: missing fingerprint
  
  // ❌ Wrong parameter types  
  // findMatch(123, []); // Error: first param must be string
  // findMatch("test", "not an array"); // Error: second param must be array
  
  // ✅ Correct usage
  const validUsers: User[] = [
    { fingerprint: "test_fp", name: "Valid User" }
  ];
  
  const result: User | null = findMatch("probe_fp", validUsers);
  
  console.log('✅ Type safety working correctly!');
  console.log('   All type checks passed at compile time');
}

/**
 * Test minimal user interface
 */
function testMinimalUserTS(): void {
  console.log('\n🔷 TypeScript Minimal User Test');
  console.log('='.repeat(40));

  const probe: string = "Rk1SACAyMAAAA...test_fp";
  
  // Minimal users with only required fingerprint property
  const minimalUsers: User[] = [
    { fingerprint: "Rk1SACAyMAAAA...fp1" },
    { fingerprint: "Rk1SACAyMAAAA...test_fp" },
    { fingerprint: "Rk1SACAyMAAAA...fp3" }
  ];

  const result: User | null = findMatch(probe, minimalUsers);
  
  if (result) {
    console.log('✅ Match found with minimal user object');
    console.log('   Fingerprint:', result.fingerprint);
  } else {
    console.log('❌ No match found');
  }
}

/**
 * Demonstrate generic type support
 */
function testGenericSupport<T extends User>(users: T[]): T | null {
  const probe = "Rk1SACAyMAAAA...generic_test";
  return findMatch(probe, users) as T | null;
}

// Run all TypeScript tests
function runAllTests(): void {
  console.log('🧪 Fingerprint Matcher - TypeScript Tests');
  console.log('=' .repeat(50));
  
  testAuthenticationTS();
  testEmployeeAttendanceTS();
  testTypeSafety();
  testMinimalUserTS();
  
  // Test generic support
  console.log('\n🔷 Generic Type Support Test');
  console.log('='.repeat(40));
  
  interface CustomUser extends User {
    customField: string;
  }
  
  const customUsers: CustomUser[] = [
    {
      fingerprint: "test_fp",
      customField: "custom_value"
    }
  ];
  
  const genericResult = testGenericSupport(customUsers);
  console.log('✅ Generic type support working correctly');
  
  console.log('\n✨ All TypeScript tests completed!');
}

// Export for use in other modules
export {
  testAuthenticationTS,
  testEmployeeAttendanceTS,
  testTypeSafety,
  testMinimalUserTS,
  runAllTests
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}
