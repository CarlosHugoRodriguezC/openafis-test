# GitHub Copilot Instructions for OpenAFIS Node Project

## Project Overview
This is a Node.js addon for fingerprint matching using the OpenAFIS library. The project contains REAL fingerprint matching capabilities, not mock implementations.

## Critical Instructions for AI Assistants

### ⚠️ IMPORTANT: NO MOCKING
- **NEVER use `src/addon-simple.cpp`** - This is a mock/demo file only
- **ALWAYS use `src/addon.cpp`** - This contains the real OpenAFIS implementation
- **DO NOT create mock scoring algorithms** - Use the actual OpenAFIS scoring system
- **DO NOT simulate fingerprint matching** - Use real biometric algorithms

### File Structure
```
src/
├── addon.cpp              ← USE THIS (Real OpenAFIS implementation)
├── addon-simple.cpp       ← DO NOT USE (Mock implementation)
├── FingerprintMatcher.cpp ← Real fingerprint matching logic
├── FingerprintMatcher.h   ← Header for real implementation
├── base64.cpp             ← Base64 utilities
└── base64.h               ← Base64 header
```

### Build Configuration
- The `binding.gyp` file MUST include:
  - `src/addon.cpp` (not addon-simple.cpp)
  - `src/FingerprintMatcher.cpp`
  - `src/base64.cpp`
  - OpenAFIS include paths: `/usr/local/include/openafis`
  - OpenAFIS library linking

### When Working on This Project
1. **Always check which addon file is being used in binding.gyp**
2. **Use the real OpenAFIS API that returns detailed matching results**
3. **Preserve actual biometric security features**
4. **Include proper similarity scores (0-255) from OpenAFIS**
5. **Maintain ISO 19794-2 fingerprint template compatibility**

### Real OpenAFIS API Response Structure
The real implementation (`src/addon.cpp`) returns:
```javascript
{
  success: boolean,
  isMatch: boolean,
  bestMatch: string,
  similarityScore: number,    // 0-255 scale
  similarityPercentage: number,
  matchingTimeMs: number,
  threshold: number,
  loadedTemplates: number,
  matchedObject: object       // Original user object
}
```

### Security Considerations
- This is a REAL biometric system
- Scoring thresholds matter for security
- False positive/negative rates are actual security concerns
- Do not compromise biometric accuracy with mock implementations

## Development Notes
- OpenAFIS library is installed at `/usr/local/lib/libopenafis.a`
- Headers are at `/usr/local/include/openafis/`
- Uses ISO 19794-2:2005 fingerprint template format
- Supports 1:N matching against fingerprint databases

---
**Remember: This is production-grade biometric software. Always use real implementations, never mocks.**
