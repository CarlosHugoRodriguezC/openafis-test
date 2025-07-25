const { findMatch } = require('./index');

// Test function with the new API
function testFingerprintMatching() {
    console.log('Testing Fingerprint Matcher Package...\n');

    // Sample ISO fingerprint string (probe)
    const probeFingerprint = "Rk1SACAyMAAAA...probe_fingerprint";

    // Sample user array - only requires fingerprint property
    const users = [
        {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            fingerprint: "Rk1SACAyMAAAA...different_fingerprint"
        },
        {
            id: 2,
            name: "Jane Smith", 
            email: "jane@example.com",
            fingerprint: "Rk1SACAyMAAAA...probe_fingerprint" // This should match
        },
        {
            id: 3,
            name: "Bob Wilson",
            email: "bob@example.com",
            fingerprint: "Rk1SACAyMAAAA...another_different_fingerprint"
        }
    ];

    try {
        console.log('👤 Probe fingerprint:', probeFingerprint.substring(0, 20) + '...');
        console.log('🔍 Searching through', users.length, 'enrolled users...\n');
        
        const result = findMatch(probeFingerprint, users);
        
        if (result) {
            console.log('✅ Match found!');
            console.log('🎯 Matched user:', {
                id: result.id,
                name: result.name,
                email: result.email
            });
        } else {
            console.log('❌ No match found');
            console.log('The probe fingerprint does not match any enrolled user');
        }
        
    } catch (error) {
        console.error('💥 Error during fingerprint matching:', error.message);
    }
}

// Test with no match scenario
function testNoMatch() {
    console.log('\n' + '='.repeat(50));
    console.log('Testing No Match Scenario...\n');

    const probeFingerprint = "Rk1SACAyMAAAA...unknown_fingerprint";
    
    const users = [
        {
            id: 1,
            name: "Alice",
            fingerprint: "Rk1SACAyMAAAA...alice_fingerprint"
        },
        {
            id: 2, 
            name: "Bob",
            fingerprint: "Rk1SACAyMAAAA...bob_fingerprint"
        }
    ];

    try {
        const result = findMatch(probeFingerprint, users);
        
        if (result) {
            console.log('✅ Unexpected match found:', result.name);
        } else {
            console.log('✅ Correctly returned null - no match found');
        }
        
    } catch (error) {
        console.error('💥 Error:', error.message);
    }
}

// Test with minimal user objects
function testMinimalObjects() {
    console.log('\n' + '='.repeat(50));
    console.log('Testing Minimal User Objects...\n');

    const probeFingerprint = "Rk1SACAyMAAAA...test_fingerprint";
    
    // Minimal user objects with only fingerprint property
    const users = [
        {
            fingerprint: "Rk1SACAyMAAAA...different_fp"
        },
        {
            fingerprint: "Rk1SACAyMAAAA...test_fingerprint" // This should match
        }
    ];

    try {
        const result = findMatch(probeFingerprint, users);
        
        if (result) {
            console.log('✅ Match found with minimal object!');
            console.log('🎯 Matched user:', result);
        } else {
            console.log('❌ No match found');
        }
        
    } catch (error) {
        console.error('💥 Error:', error.message);
    }
}

// Run all tests
console.log('🧪 Fingerprint Matcher Package Tests');
console.log('=' .repeat(50));

testFingerprintMatching();
testNoMatch();
testMinimalObjects();

console.log('\n✨ All tests completed!');
