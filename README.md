# Fingerprint Matcher

A Node.js package for ISO fingerprint matching using the OpenAFIS library. This package provides a simple API to match a probe fingerprint against a list of enrolled users with full TypeScript support.

## Features

- **Simple API**: Just provide an ISO fingerprint string and user array
- **TypeScript Support**: Full type definitions and IntelliSense support
- **Flexible User Objects**: Only requires a `fingerprint` property in user objects
- **Efficient Matching**: Returns only the best matching user or null
- **OpenAFIS Integration**: Uses the high-performance OpenAFIS library
- **Hardware Independent**: Works on commodity hardware
- **HTTP Scanner Integration**: Complete example for HTTP fingerprint scanners
- **Local Database Management**: JSON-based user enrollment and management

## HTTP Fingerprint Scanner Integration

This package includes a complete example for integrating with HTTP-based fingerprint scanners. The integration demonstrates:

- Real-time communication with HTTP fingerprint scanners (POST to `192.168.4.5:8080/fingerprint`)
- Local fingerprint database management (`~/Settings/fingerprints`)
- Complete access control system with enrollment and verification
- Error handling and timeout management
- TypeScript support with full type safety

**Quick Start:**
```bash
# Run the HTTP integration example
npx ts-node http-fingerprint-example.ts
```

**Key Components:**
- `FingerprintScannerService`: HTTP communication with scanners
- `FingerprintDatabaseService`: Local database management  
- `AccessControlSystem`: Complete access control solution

For detailed documentation, see [HTTP_INTEGRATION.md](./HTTP_INTEGRATION.md).

## Prerequisites

### Installing OpenAFIS Library

Before using this package, you need to install the OpenAFIS library on your system.

#### Quick Setup (Recommended)

Use the automated setup script:

```bash
# Make the script executable and run it
chmod +x setup-openafis.sh
./setup-openafis.sh
```

This script will:
- Detect your operating system
- Install required dependencies
- Clone and build OpenAFIS
- Install the library system-wide
- Verify the installation

#### Manual Installation

#### Ubuntu/Debian

```bash
# Install dependencies
sudo apt update
sudo apt install build-essential cmake git

# Clone and build OpenAFIS
git clone https://github.com/OpenAFIS/OpenAFIS.git
cd OpenAFIS
mkdir build && cd build
cmake ..
make -j$(nproc)
sudo make install

# Update library paths
sudo ldconfig
```

#### CentOS/RHEL/Fedora

```bash
# Install dependencies
sudo yum install gcc-c++ cmake git make
# or for newer versions: sudo dnf install gcc-c++ cmake git make

# Clone and build OpenAFIS
git clone https://github.com/OpenAFIS/OpenAFIS.git
cd OpenAFIS
mkdir build && cd build
cmake ..
make -j$(nproc)
sudo make install

# Update library paths
sudo ldconfig
```

#### macOS

```bash
# Install dependencies using Homebrew
brew install cmake git

# Clone and build OpenAFIS
git clone https://github.com/OpenAFIS/OpenAFIS.git
cd OpenAFIS
mkdir build && cd build
cmake ..
make -j$(sysctl -n hw.ncpu)
sudo make install
```

#### Windows

1. Install Visual Studio 2019 or later with C++ development tools
2. Install CMake from https://cmake.org/download/
3. Install Git from https://git-scm.com/download/win
4. Open Command Prompt as Administrator:

```cmd
git clone https://github.com/OpenAFIS/OpenAFIS.git
cd OpenAFIS
mkdir build && cd build
cmake .. -G "Visual Studio 16 2019"
cmake --build . --config Release
cmake --install . --config Release
```

#### Alternative: Using Package Managers

**vcpkg (Windows/Linux/macOS)**
```bash
git clone https://github.com/Microsoft/vcpkg.git
cd vcpkg
./bootstrap-vcpkg.sh  # or bootstrap-vcpkg.bat on Windows
./vcpkg install openafis
```

**Conan (Cross-platform)**
```bash
pip install conan
conan install openafis/1.0@ -g cmake_find_package
```

### Verification

To verify OpenAFIS is correctly installed, create a simple test:

```cpp
#include <OpenAFIS.h>
#include <iostream>

int main() {
    // Test OpenAFIS availability
    std::cout << "OpenAFIS library is available!" << std::endl;
    return 0;
}
```

Compile with:
```bash
g++ -o test_openafis test.cpp -lopenafis
./test_openafis
```

## Installation

```bash
npm install fingerprint-matcher
```

## Usage

### JavaScript

```javascript
const { findMatch } = require('fingerprint-matcher');

// Your probe fingerprint (ISO 19794-2:2005 format)
const probeFingerprint = "Rk1SACAyMAAAA...";

// Array of enrolled users (only fingerprint property is required)
const users = [
    {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        fingerprint: "Rk1SACAyMAAAA..." // ISO fingerprint string
    },
    {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com", 
        fingerprint: "Rk1SACAyMAAAA..." // ISO fingerprint string
    }
];

// Find the matching user
const matchedUser = findMatch(probeFingerprint, users);

if (matchedUser) {
    console.log('Match found:', matchedUser.name);
    // Use the complete user object with all properties
} else {
    console.log('No match found');
}
```

### TypeScript

```typescript
import { findMatch, User } from 'fingerprint-matcher';

// Define your user interface extending the base User interface
interface AppUser extends User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

const probeFingerprint: string = "Rk1SACAyMAAAA...";

const users: AppUser[] = [
    {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "admin",
        fingerprint: "Rk1SACAyMAAAA..."
    }
];

// TypeScript provides full type safety and IntelliSense
const matchedUser: AppUser | null = findMatch(probeFingerprint, users) as AppUser | null;

if (matchedUser) {
    console.log(`Welcome ${matchedUser.name}, role: ${matchedUser.role}`);
    // Full type safety - TypeScript knows all properties
} else {
    console.log('No match found');
}
```

### API

#### `findMatch(probeFingerprint, users)`

**Parameters:**
- `probeFingerprint` (string): ISO 19794-2:2005 encoded fingerprint string
- `users` (array): Array of user objects, each must contain a `fingerprint` property

**Returns:**
- `Object|null`: The complete matching user object if a match is found, or `null` if no match

**Requirements:**
- Each user object must have a `fingerprint` property containing an ISO fingerprint string
- User objects can contain any additional properties (id, name, email, etc.)
- Only the best matching user is returned (highest confidence score above threshold)

### TypeScript Support

The package includes comprehensive TypeScript definitions:

```typescript
interface User {
  fingerprint: string;
  [key: string]: any;
}

interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

interface AccessResult {
  access: boolean;
  user?: string;
  role?: string;
  permissions?: string[];
  reason?: string;
}

function findMatch(probeFingerprint: string, users: User[]): User | null;
```

#### TypeScript Features

- **Full Type Safety**: Compile-time error checking
- **IntelliSense Support**: Auto-completion in VS Code and other editors
- **Interface Extensions**: Extend the base `User` interface for your specific needs
- **Generic Support**: Type-safe operations with custom user types

## Examples

### Basic Usage

```javascript
const { findMatch } = require('fingerprint-matcher');

const probe = "Rk1SACAyMAAAA...probe_fingerprint";
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

const result = findMatch(probe, users);
console.log(result); // Complete user object or null
```

### Minimal User Objects

```javascript
// Users only need the fingerprint property
const users = [
    { fingerprint: "Rk1SACAyMAAAA...fp1" },
    { fingerprint: "Rk1SACAyMAAAA...fp2" }
];

const result = findMatch(probe, users);
```

### Integration Example

```javascript
const { findMatch } = require('fingerprint-matcher');

async function authenticateUser(capturedFingerprint) {
    // Get enrolled users from your database
    const enrolledUsers = await getUserDatabase();
    
    // Find matching user
    const matchedUser = findMatch(capturedFingerprint, enrolledUsers);
    
    if (matchedUser) {
        console.log(`Welcome back, ${matchedUser.name}!`);
        return { 
            success: true, 
            user: matchedUser 
        };
    } else {
        console.log('Authentication failed - no match found');
        return { 
            success: false, 
            user: null 
        };
    }
}
```

## Testing

```bash
npm test              # Basic functionality test
npm run test:new      # New API comprehensive tests  
npm run test:ts       # TypeScript integration tests
npm run examples      # Real-world usage examples
npx ts-node typescript-example.ts  # TypeScript demo
```

## Requirements

- **OpenAFIS library** (see Prerequisites section above)
- Node.js 14+ 
- Python 3.x (for node-gyp)
- C++17 compatible compiler
- CMake 3.16+

## Platform Support

- Linux
- macOS  
- Windows

## License

MIT
