const { matchFingerprint } = require('./build/Release/openafis_addon');

/**
 * Match a probe fingerprint against an array of users
 * @param {string} probeFingerprint - ISO 19794-2:2005 encoded fingerprint string
 * @param {Array} users - Array of user objects containing fingerprint property
 * @returns {Object|null} - The matching user object or null if no match found
 */
function findMatch(probeFingerprint, users) {
    return matchFingerprint(probeFingerprint, users);
}

module.exports = {
    findMatch,
    matchFingerprint // Keep the original function name for backward compatibility
};
