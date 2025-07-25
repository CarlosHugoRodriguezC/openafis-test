#!/usr/bin/env node

// Quick demo script showing the simplicity of the fingerprint-matcher package

import { findMatch, User } from './index';

console.log('🚀 Quick Fingerprint Matcher Demo');
console.log('='.repeat(40));

// Simple usage - minimal setup required
const capturedFingerprint = "Rk1SACAyMAAAA...captured_from_scanner";

const enrolledUsers = [
    {
        id: 1,
        name: "Alice Smith",
        email: "alice@company.com",
        department: "Engineering",
        fingerprint: "Rk1SACAyMAAAA...alice_fp"
    },
    {
        id: 2,
        name: "Bob Johnson", 
        email: "bob@company.com",
        department: "Sales",
        fingerprint: "Rk1SACAyMAAAA...captured_from_scanner" // This will match
    },
    {
        id: 3,
        name: "Carol Davis",
        email: "carol@company.com", 
        department: "HR",
        fingerprint: "Rk1SACAyMAAAA...carol_fp"
    }
];

// That's it! Just one line to find the matching user
const matchedUser = findMatch(capturedFingerprint, enrolledUsers);

if (matchedUser) {
    console.log('✅ Authentication successful!');
    console.log(`👋 Welcome back, ${matchedUser.name}!`);
    console.log(`📧 Email: ${matchedUser.email}`);
    console.log(`🏢 Department: ${matchedUser.department}`);
} else {
    console.log('❌ Authentication failed - fingerprint not recognized');
}

console.log('\n📋 Summary:');
console.log('   • Only one function call needed: findMatch()');
console.log('   • Flexible user objects with any properties');
console.log('   • Returns complete user object or null');
console.log('   • Full TypeScript support with IntelliSense');
console.log('   • High-performance OpenAFIS matching engine');

console.log('\n🎯 Ready for production use in:');
console.log('   • Authentication systems');
console.log('   • Access control systems');
console.log('   • Attendance tracking');
console.log('   • Time clock applications');
console.log('   • Security applications');

console.log('\n✨ Integration complete!');
