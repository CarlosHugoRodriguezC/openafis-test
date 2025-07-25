// Example: How to use fingerprint-matcher package in your project

const { findMatch } = require('./index');

/**
 * Example usage in an authentication system
 */
async function authenticateUser(capturedFingerprint) {
    // Example: fetch users from your database
    const enrolledUsers = [
        {
            id: 1,
            username: "john_doe",
            email: "john@example.com",
            fingerprint: "Rk1SACAyMAAAA...john_fingerprint",
            role: "admin"
        },
        {
            id: 2,
            username: "jane_smith",
            email: "jane@example.com", 
            fingerprint: "Rk1SACAyMAAAA...jane_fingerprint",
            role: "user"
        },
        {
            id: 3,
            username: "bob_wilson",
            email: "bob@example.com",
            fingerprint: "Rk1SACAyMAAAA...bob_fingerprint",
            role: "user"
        }
    ];

    try {
        // Find matching user
        const matchedUser = findMatch(capturedFingerprint, enrolledUsers);
        
        if (matchedUser) {
            console.log(`✅ Authentication successful!`);
            console.log(`Welcome back, ${matchedUser.username}!`);
            
            return {
                success: true,
                user: {
                    id: matchedUser.id,
                    username: matchedUser.username,
                    email: matchedUser.email,
                    role: matchedUser.role
                }
            };
        } else {
            console.log(`❌ Authentication failed - fingerprint not recognized`);
            
            return {
                success: false,
                error: "Fingerprint not found in enrolled users"
            };
        }
    } catch (error) {
        console.error(`💥 Authentication error:`, error.message);
        
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Example usage in a access control system
 */
function checkAccess(fingerprint, requiredRole = 'user') {
    const users = [
        {
            id: 1,
            name: "Administrator",
            fingerprint: "Rk1SACAyMAAAA...admin_fp",
            role: "admin",
            permissions: ["read", "write", "delete"]
        },
        {
            id: 2,
            name: "Regular User",
            fingerprint: "Rk1SACAyMAAAA...user_fp", 
            role: "user",
            permissions: ["read"]
        }
    ];

    const user = findMatch(fingerprint, users);
    
    if (!user) {
        return { 
            access: false, 
            reason: "Fingerprint not recognized" 
        };
    }

    const hasAccess = user.role === 'admin' || user.role === requiredRole;
    
    return {
        access: hasAccess,
        user: user.name,
        role: user.role,
        permissions: user.permissions
    };
}

/**
 * Example usage in an attendance system
 */
function recordAttendance(fingerprint) {
    const employees = [
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

    const employee = findMatch(fingerprint, employees);
    
    if (employee) {
        const timestamp = new Date().toISOString();
        
        console.log(`📝 Attendance recorded:`);
        console.log(`   Employee: ${employee.name} (${employee.employeeId})`);
        console.log(`   Department: ${employee.department}`);
        console.log(`   Time: ${timestamp}`);
        
        return {
            success: true,
            employeeId: employee.employeeId,
            name: employee.name,
            department: employee.department,
            timestamp
        };
    } else {
        console.log(`❌ Unknown fingerprint - attendance not recorded`);
        return {
            success: false,
            error: "Employee not found"
        };
    }
}

// Demo the examples
async function demo() {
    console.log("🧪 Fingerprint Matcher Package - Usage Examples\n");
    
    // Test authentication
    console.log("1️⃣ Authentication Example:");
    console.log("-".repeat(30));
    const authResult = await authenticateUser("Rk1SACAyMAAAA...john_fingerprint");
    console.log("Result:", authResult);
    
    console.log("\n2️⃣ Access Control Example:");
    console.log("-".repeat(30));
    const accessResult = checkAccess("Rk1SACAyMAAAA...admin_fp", "admin");
    console.log("Result:", accessResult);
    
    console.log("\n3️⃣ Attendance System Example:");
    console.log("-".repeat(30));
    const attendanceResult = recordAttendance("Rk1SACAyMAAAA...alice_fp");
    console.log("Result:", attendanceResult);
}

// Run the demo if this file is executed directly
if (require.main === module) {
    demo().catch(console.error);
}

module.exports = {
    authenticateUser,
    checkAccess,
    recordAttendance
};
