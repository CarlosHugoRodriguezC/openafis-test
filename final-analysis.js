const { findMatch } = require('./index.js');

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
console.log("🎯 FINGERPRINT AUTHENTICATION ANALYSIS - CARLOS'S SCENARIO");
console.log("=".repeat(100));

console.log("\n🔍 SCENARIO EXPLANATION:");
console.log("You (Carlos) have:");
console.log("  1️⃣  One finger enrolled in the system (your thumb)");
console.log("  2️⃣  Another finger that was never enrolled (your index/middle finger)");
console.log("  📊 We're testing how the system handles both cases\n");

// Test the enrolled finger
console.log("🟢 TEST 1: Your enrolled finger");
console.log("─".repeat(50));
const enrolledResult = findMatch(carlosEnrolledFinger, users);
if (enrolledResult) {
    console.log(`✅ MATCHED: ${enrolledResult.user} (ID: ${enrolledResult.id})`);
    console.log(`📊 Score: ${enrolledResult.matchScore}/255 (${enrolledResult.matchConfidence} confidence)`);
    
    if (enrolledResult.matchScore >= 60) {
        console.log(`✨ VERDICT: Legitimate match - Access should be GRANTED`);
    } else {
        console.log(`🚨 VERDICT: Low confidence - Access should be DENIED`);
    }
} else {
    console.log(`❌ NO MATCH - Something went wrong with your enrolled finger!`);
}

// Test the unenrolled finger
console.log("\n🔴 TEST 2: Your unenrolled finger (never registered)");
console.log("─".repeat(50));
const unenrolledResult = findMatch(carlosUnenrolledFinger, users);
if (unenrolledResult) {
    console.log(`⚠️  MATCHED: ${unenrolledResult.user} (ID: ${unenrolledResult.id})`);
    console.log(`📊 Score: ${unenrolledResult.matchScore}/255 (${unenrolledResult.matchConfidence} confidence)`);
    
    if (unenrolledResult.matchScore >= 60) {
        console.log(`🚨 SECURITY ISSUE: False positive with high score!`);
        console.log(`   This unenrolled finger incorrectly matched with high confidence.`);
    } else {
        console.log(`✅ SECURITY OK: Low confidence match detected`);
        console.log(`   System correctly identified this as a weak/false match.`);
    }
} else {
    console.log(`✅ PERFECT: No match found - this is the expected behavior`);
}

// Security analysis
console.log("\n" + "=".repeat(100));
console.log("🛡️  SECURITY ANALYSIS");
console.log("=".repeat(100));

if (enrolledResult && unenrolledResult) {
    console.log(`\n📊 Score Comparison:`);
    console.log(`   Enrolled finger:   ${enrolledResult.matchScore}/255 (${enrolledResult.matchConfidence})`);
    console.log(`   Unenrolled finger: ${unenrolledResult.matchScore}/255 (${unenrolledResult.matchConfidence})`);
    
    console.log(`\n🎯 Recommended Security Thresholds:`);
    console.log(`   🟢 Accept (Grant Access): Score ≥ 80 (HIGH confidence)`);
    console.log(`   🟡 Review Required:       Score 60-79 (MEDIUM confidence)`);
    console.log(`   🔴 Reject (Deny Access):  Score < 60 (LOW confidence)`);
    
    console.log(`\n📋 FINAL RECOMMENDATIONS:`);
    
    // Enrolled finger recommendation
    if (enrolledResult.matchScore >= 80) {
        console.log(`   ✅ Enrolled finger: GRANT ACCESS (High confidence match)`);
    } else if (enrolledResult.matchScore >= 60) {
        console.log(`   ⚠️  Enrolled finger: REVIEW REQUIRED (Medium confidence)`);
    } else {
        console.log(`   ❌ Enrolled finger: DENY ACCESS (Low confidence - may need re-enrollment)`);
    }
    
    // Unenrolled finger recommendation
    if (unenrolledResult.matchScore >= 80) {
        console.log(`   🚨 Unenrolled finger: SECURITY ALERT - False positive with high confidence!`);
    } else if (unenrolledResult.matchScore >= 60) {
        console.log(`   ⚠️  Unenrolled finger: DENY ACCESS (Medium confidence - potential security risk)`);
    } else {
        console.log(`   ✅ Unenrolled finger: CORRECTLY REJECTED (Low confidence detected)`);
    }
}

console.log(`\n💡 KEY INSIGHTS:`);
console.log(`   • The scoring system now includes confidence levels in the response`);
console.log(`   • Low scores help identify false positives from unenrolled fingers`);
console.log(`   • Always implement minimum score thresholds in production systems`);
console.log(`   • Consider requiring re-enrollment if enrolled fingers score too low`);

console.log("\n" + "=".repeat(100));
