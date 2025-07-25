const { matchFingerprint } = require('./build/Release/openafis_addon');

console.log('Testing OpenAFIS Match Node.js Addon API...\n');

// Test with mock data
const probeFingerprint = "test-probe";
const database = [
    { name: "Carlos", fingerprint: "test-probe" },  // Should match
    { name: "Alice", fingerprint: "different-print" }, // Should not match
    { name: "Bob", fingerprint: "another-print" }   // Should not match
];

try {
    console.log('Calling matchFingerprint with test data...');
    const result = matchFingerprint(probeFingerprint, database);
    
    console.log('\n✓ Function call successful!');
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (result.matches && result.matches.length > 0) {
        console.log(`\nFound ${result.matches.length} match(es):`);
        result.matches.forEach((match, index) => {
            console.log(`${index + 1}. ${match.name} (Score: ${match.score})`);
        });
    } else {
        console.log('\nNo matches found.');
    }
    
} catch (error) {
    console.error('❌ Error:', error.message);
}
