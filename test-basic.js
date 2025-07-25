const testFingerprint = require('./test.js');

// Sample fingerprint data for testing
const probeFingerprint = "Rk1SACAyMAAAA..."; // Placeholder
const database = [
    {
        name: "Carlos",
        fingerprint: "Rk1SACAyMAAAA..." // Placeholder 
    }
];

console.log('Node.js OpenAFIS Match Addon Test');
console.log('============================\n');

try {
    // This will fail until we have real fingerprint data
    console.log('Note: This test requires real fingerprint data to function properly.');
    console.log('Replace the placeholder Base64 strings with actual ISO 19794-2:2005 templates.\n');
    
    // For now, just test the module loading
    console.log('Testing module import...');
    const { matchFingerprint } = require('./build/Release/openafis_addon');
    console.log('✓ Module loaded successfully!\n');
    
    console.log('API Available: matchFingerprint(probeFingerprint, databaseArray)');
    console.log('Expected Parameters:');
    console.log('- probeFingerprint: Base64 encoded ISO fingerprint template');
    console.log('- databaseArray: Array of objects with "name" and "fingerprint" properties');
    
} catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
        console.log('❌ Module not built yet. Run "npm run build" first.');
    } else {
        console.log('❌ Error:', error.message);
    }
}
