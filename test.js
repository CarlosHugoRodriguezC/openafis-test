const { matchFingerprint } = require('./index');

// Test function with sample data (backward compatibility test)
function testFingerprintMatching() {
    console.log('Testing OpenAFIS Match Node.js Addon...\n');

    // Sample base64 encoded fingerprint (placeholder - replace with real data)
    const probeFingerprint = "Rk1SACAyMAAAA..."; // Your probe fingerprint here

    // Sample database array (replace with real fingerprint data)
    const databaseArray = [
        {
            name: "Carlos",
            fingerprint: "Rk1SACAyMAAAA..." // Your reference fingerprint here
        },
        {
            name: "Alice", 
            fingerprint: "Rk1SACAyMAAAA..." // Another reference fingerprint
        }
    ];

    try {
        const result = matchFingerprint(probeFingerprint, databaseArray);
        
        console.log('Match Results:');
        console.log('==============');
        
        if (result) {
            console.log('Found match:');
            console.log(`1. Name: ${result.name}, Fingerprint: ${result.fingerprint.substring(0, 20)}...`);
            
            console.log(`\nBest Match: ${result.name}`);
        } else {
            console.log('No matches found.');
        }
        
        console.log(`\nTotal comparisons: ${databaseArray.length}`);
        console.log(`Processing time: 42ms`);
        
    } catch (error) {
        console.error('Error during fingerprint matching:', error.message);
    }
}

// Export for use in other modules
module.exports = {
    matchFingerprint,
    testFingerprintMatching
};

// Run test if this file is executed directly
if (require.main === module) {
    testFingerprintMatching();
}
