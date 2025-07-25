const { findMatch } = require('./index.js');

// Test fingerprints from your data
const testFingerprint1 = "Rk1SACAyMAAAAAC6AAABAAFoAMUAxQEAAABkGkCJAC3qYEBDAECIYICRAFZoYIA/AGKGYEB/AHzqYEBzAIzoYEBSAIv1YEBpAJFzYIDHAJXdYIBKAKHxYIAvAK+VYIBaALTgYICGALfVYEBAANHkYEC1ANrRYIB7AOLJYEBEAOa5YECCAQHEYECXAQzKYIBfASKxYIB0ASO4YICOASzIYECBATi5YEBxAT41YECcAUTNYECSAU/CYAAA";

const testFingerprint2 = "Rk1SACAyMAAAAACiAAABAAFoAMUAxQEAAABkFoBsAB5uYEB+ACTgYEBSAGHmYEA8AIPkYEDFAI1KYECjAJNGYEA0AKLKYEBRAKvAYEAjALOiYIB+ALREYEAjALunYIBdAL+8YEAgAMirYEBIAOa3YIBeAO7CYIAeAQCpYIA+ARKxYEBLARnAYIBDASuzYIBMATXEYIBBAUGsYIBKAUzCYAAA";

// User database
const users = [
  {
    "id": 3,
    "type": 2,
    "user_id": 952,
    "username": "100002",
    "user": "Ryan Test",
    "employee_number": 100002,
    "fingerprint": "Rk1SACAyMAAAAAD8AAABAAFoAMgAyAEAAABWJUDKAStaY0CRASjTWkBbAIiHWUCkAPvgWECQAHZ9V0DHAU7PV0BcAE2NVkB2AHr9VkB+ALjpVUBbAHqCVEBWADIAVEAwAMcQVEDuAOhgVIBoANHuU0DgASfTU0BzAJLzUkDiANneUUDWAD5tUEBUAOL1UECiABf1UIBIAFULUEBsAKCDUEBOAHwDT4BYAPTuT0DiADToTUAyAP4LTUBWAKMGTIBGARnuSkB4ASXQSoCFADL7SIDkAF/pSEC2AE91RkAoAGSTQYAQARwhPkBJAUaoPoA9AGUHOgBMAUDAMgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
  },
  {
    "id": 5,
    "type": 0,
    "user_id": 5,
    "username": "cahuroca",
    "user": "Carlos",
    "employee_number": 123456,
    "fingerprint": "Rk1SACAyMAAAAACuAAABAAFoAMUAxQEAAABaGECyAD3rYEBwAFGIYIC+AGZqYIBrAHOGYECqAInrYECfAJnqYEB8AJj3YECUAJ51YEB4ALHxYEBbAMGZYECGAMPeYECyAMfVYEBuAN3kYEDgAOXRYICpAO3HYEByAPG7YECvAQ/EYEDDARbKYIChAS64YECQATGvYEC+ATbIYECuAUO3YECgAUg3YEDIAU7NYAAA"
  }
];

console.log("=".repeat(80));
console.log("DETAILED FINGERPRINT MATCHING ANALYSIS");
console.log("=".repeat(80));

// Test fingerprint 1
console.log("\n1. TESTING FIRST FINGERPRINT:");
console.log("   Fingerprint: " + testFingerprint1.substring(0, 60) + "...");
const match1 = findMatch(testFingerprint1, users);
if (match1) {
    console.log(`   ✅ MATCH FOUND: ${match1.user} (ID: ${match1.id}, Employee: ${match1.employee_number})`);
    console.log(`   🔄 Finger Type: ${match1.type} (0=thumb, 1=index, 2=middle, etc.)`);
} else {
    console.log("   ❌ NO MATCH FOUND");
}

// Test fingerprint 2
console.log("\n2. TESTING SECOND FINGERPRINT:");
console.log("   Fingerprint: " + testFingerprint2.substring(0, 60) + "...");
const match2 = findMatch(testFingerprint2, users);
if (match2) {
    console.log(`   ✅ MATCH FOUND: ${match2.user} (ID: ${match2.id}, Employee: ${match2.employee_number})`);
    console.log(`   🔄 Finger Type: ${match2.type} (0=thumb, 1=index, 2=middle, etc.)`);
} else {
    console.log("   ❌ NO MATCH FOUND");
}

console.log("\n" + "=".repeat(80));
console.log("CONCLUSION:");
console.log("=".repeat(80));

if (match1 && match2) {
    if (match1.id === match2.id) {
        console.log("🔍 SAME PERSON - Different fingers detected!");
        console.log(`   Both fingerprints belong to: ${match1.user}`);
        console.log(`   Finger 1 Type: ${match1.type}`);
        console.log(`   Finger 2 Type: ${match2.type}`);
    } else {
        console.log("👥 DIFFERENT PEOPLE detected!");
        console.log(`   Fingerprint 1 belongs to: ${match1.user} (${match1.employee_number})`);
        console.log(`   Fingerprint 2 belongs to: ${match2.user} (${match2.employee_number})`);
    }
} else {
    console.log("⚠️  One or both fingerprints don't match any user in the database");
}

// Analysis of the fingerprint structure
console.log("\n" + "=".repeat(80));
console.log("TECHNICAL ANALYSIS:");
console.log("=".repeat(80));

function analyzeISO19794(fingerprint, name) {
    const decoded = Buffer.from(fingerprint, 'base64');
    console.log(`\n${name}:`);
    console.log(`  📊 Size: ${decoded.length} bytes`);
    console.log(`  🔍 Format: ISO 19794-2 (${decoded.slice(0, 4).toString('ascii')})`);
    
    if (decoded.length >= 30) {
        const recordLength = decoded.readUInt32BE(8);
        const captureDevice = decoded.readUInt16BE(12);
        const imageSize = decoded.readUInt16BE(14);
        const resolutionX = decoded.readUInt16BE(16);
        const resolutionY = decoded.readUInt16BE(18);
        const numViews = decoded.readUInt8(20);
        
        console.log(`  📏 Record Length: ${recordLength} bytes`);
        console.log(`  📱 Capture Device: ${captureDevice}`);
        console.log(`  🖼️  Image Size: ${imageSize}`);
        console.log(`  📐 Resolution: ${resolutionX}x${resolutionY} DPI`);
        console.log(`  👁️  Views: ${numViews}`);
    }
}

analyzeISO19794(testFingerprint1, "Test Fingerprint 1 (matches Carlos)");
analyzeISO19794(testFingerprint2, "Test Fingerprint 2 (matches Ryan)");

console.log("\n" + "=".repeat(80));
