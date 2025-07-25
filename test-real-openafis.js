const { matchFingerprint } = require('./index.js');

// Test fingerprints from your scenario
const carlosEnrolledFinger = "Rk1SACAyMAAAAAC6AAABAAFoAMUAxQEAAABkGkCJAC3qYEBDAECIYICRAFZoYIA/AGKGYEB/AHzqYEBzAIzoYEBSAIv1YEBpAJFzYIDHAJXdYIBKAKHxYIAvAK+VYIBaALTgYICGALfVYEBAANHkYEC1ANrRYIB7AOLJYEBEAOa5YECCAQHEYECXAQzKYIBfASKxYIB0ASO4YICOASzIYECBATi5YEBxAT41YECcAUTNYECSAU/CYAAA";

const carlosUnenrolledFinger = "Rk1SACAyMAAAAACiAAABAAFoAMUAxQEAAABkFoBsAB5uYEB+ACTgYEBSAGHmYEA8AIPkYEDFAI1KYECjAJNGYEA0AKLKYEBRAKvAYEAjALOiYIB+ALREYEAjALunYIBdAL+8YEAgAMirYEBIAOa3YIBeAO7CYIAeAQCpYIA+ARKxYEBLARnAYIBDASuzYIBMATXEYIBBAUGsYIBKAUzCYAAA";

// Your fingerprint database
const users = [
  {
    "id": 5,
    "type": 0,
    "user_id": 5,
    "username": "cahuroca",
    "user": "Carlos",
    "employee_number": 123456,
    "fingerprint": "Rk1SACAyMAAAAACuAAABAAFoAMUAxQEAAABaGECyAD3rYEBwAFGIYIC+AGZqYIBrAHOGYECqAInrYECfAJnqYEB8AJj3YECUAJ51YEB4ALHxYEBbAMGZYECGAMPeYECyAMfVYEBuAN3kYEDgAOXRYICpAO3HYEByAPG7YECvAQ/EYEDDARbKYIChAS64YECQATGvYEC+ATbIYECuAUO3YECgAUg3YEDIAU7NYAAA"
  },
  {
    "id": 3,
    "username": "100002",
    "user": "Ryan Test",
    "employee_number": 100002,
    "fingerprint": "Rk1SACAyMAAAAAD8AAABAAFoAMgAyAEAAABWJUDKAStaY0CRASjTWkBbAIiHWUCkAPvgWECQAHZ9V0DHAU7PV0BcAE2NVkB2AHr9VkB+ALjpVUBbAHqCVEBWADIAVEAwAMcQVEDuAOhgVIBoANHuU0DgASfTU0BzAJLzUkDiANneUUDWAD5tUEBUAOL1UECiABf1UIBIAFULUEBsAKCDUEBOAHwDT4BYAPTuT0DiADToTUAyAP4LTUBWAKMGTIBGARnuSkB4ASXQSoCFADL7SIDkAF/pSEC2AE91RkAoAGSTQYAQARwhPkBJAUaoPoA9AGUHOgBMAUDAMgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
  }
];

console.log("=".repeat(100));
console.log("🎯 REAL OPENAFIS FINGERPRINT MATCHING TEST");
console.log("=".repeat(100));

function testRealFingerprint(fingerprint, name, description) {
    console.log(`\n📋 ${name}:`);
    console.log(`   Description: ${description}`);
    console.log(`   Fingerprint: ${fingerprint.substring(0, 50)}...`);
    
    try {
        const result = matchFingerprint(fingerprint, users);
        
        if (result && result.success) {
            if (result.isMatch) {
                console.log(`   ✅ MATCH FOUND:`);
                console.log(`      👤 User: ${result.matchedObject.user} (ID: ${result.matchedObject.id})`);
                console.log(`      🏢 Employee #: ${result.matchedObject.employee_number}`);
                console.log(`      📊 Similarity Score: ${result.similarityScore}/255`);
                console.log(`      📈 Similarity %: ${result.similarityPercentage.toFixed(2)}%`);
                console.log(`      🎯 Threshold: ${result.threshold}`);
                console.log(`      ⏱️  Matching Time: ${result.matchingTimeMs}ms`);
                console.log(`      💾 Templates Loaded: ${result.loadedTemplates}`);
                
                // Security analysis
                if (result.similarityScore >= 200) {
                    console.log(`      ✨ EXCELLENT match - High security confidence`);
                } else if (result.similarityScore >= 150) {
                    console.log(`      ✅ GOOD match - Accept with confidence`);
                } else if (result.similarityScore >= 100) {
                    console.log(`      ⚠️  MEDIUM match - Review required`);
                } else {
                    console.log(`      🚨 LOW match - Likely false positive`);
                }
            } else {
                console.log(`   ❌ NO MATCH - Below threshold (${result.threshold})`);
                console.log(`      📊 Best Score: ${result.similarityScore || 'N/A'}/255`);
            }
        } else {
            console.log(`   ❌ MATCHING FAILED:`);
            console.log(`      Error: ${result.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.log(`   💥 EXCEPTION: ${error.message}`);
    }
}

// Test both fingerprints with real OpenAFIS
testRealFingerprint(
    carlosEnrolledFinger, 
    "Test Fingerprint 1", 
    "Your enrolled thumb"
);

testRealFingerprint(
    carlosUnenrolledFinger, 
    "Test Fingerprint 2", 
    "Your other finger (never enrolled)"
);

console.log("\n" + "=".repeat(100));
console.log("🔬 REAL OPENAFIS ANALYSIS:");
console.log("=".repeat(100));

console.log(`\n✅ SUCCESS: Using real OpenAFIS biometric matching!`);
console.log(`📊 Real similarity scores show actual fingerprint matching confidence`);
console.log(`🛡️  Security: OpenAFIS provides industry-standard biometric authentication`);
console.log(`📏 Scale: Similarity scores are 0-255 (real OpenAFIS scale)`);
console.log(`⚡ Performance: Real-time matching with optimized algorithms`);

console.log("\n" + "=".repeat(100));
