# HTTP Fingerprint Scanner Integration

This document explains how to integrate the fingerprint-matcher package with HTTP-based fingerprint scanners.

## Overview

The `http-fingerprint-example.ts` file demonstrates a complete integration with:
- HTTP fingerprint scanner communication
- Local fingerprint database management
- Real-time access control system
- User enrollment and verification

## Quick Start

```bash
# Run the HTTP integration example
npx ts-node http-fingerprint-example.ts
```

## Scanner Configuration

The example is configured to communicate with a fingerprint scanner at:
- **IP Address**: `192.168.4.5`
- **Port**: `8080`
- **Endpoint**: `/fingerprint`
- **Method**: `POST`

### Scanner API Expected Response

```json
{
  "status": "FP01",
  "message": "Fingerprint captured successfully",
  "fingerprint": "base64-encoded-fingerprint-data"
}
```

## Database Configuration

- **Location**: `~/Settings/fingerprints` (expandable path)
- **Format**: JSON file with user records
- **Structure**: Array of DatabaseUser objects

### DatabaseUser Interface

```typescript
interface DatabaseUser {
  id: number;
  name: string;
  email: string;
  department: string;
  fingerprint: string;
  enrolledAt: string;
  lastAccess?: string;
}
```

## Key Components

### 1. FingerprintScannerService

Handles HTTP communication with the fingerprint scanner:

```typescript
const scanner = new FingerprintScannerService('192.168.4.5', 8080);
const result = await scanner.captureFingerprint();
```

**Features:**
- Configurable timeout (default: 10 seconds)
- Error handling for network issues
- Support for different scanner response formats

### 2. FingerprintDatabaseService

Manages the local fingerprint database:

```typescript
const db = new FingerprintDatabaseService('~/Settings/fingerprints');
await db.initialize();
const user = db.findUserByFingerprint(fingerprint);
```

**Features:**
- JSON-based storage
- Automatic backup creation
- User enrollment and management
- Search and matching operations

### 3. AccessControlSystem

Combines scanner and database for complete access control:

```typescript
const accessControl = new AccessControlSystem(scanner, db);
const result = await accessControl.processAccessRequest();
```

**Features:**
- Real-time fingerprint capture and matching
- Access logging and statistics
- User management operations
- System health monitoring

## Configuration Options

### Scanner Timeout

```typescript
const scanner = new FingerprintScannerService('192.168.4.5', 8080, {
  timeout: 15000 // 15 seconds
});
```

### Database Path

```typescript
const db = new FingerprintDatabaseService('/custom/path/to/database');
```

### Access Control Settings

```typescript
const accessControl = new AccessControlSystem(scanner, db, {
  retryAttempts: 3,
  logAccess: true,
  requireDepartment: false
});
```

## Error Handling

The integration includes comprehensive error handling for:

### Network Errors
- Connection timeouts
- Network unreachable
- Scanner offline

### Scanner Errors
- Fingerprint capture failures
- Invalid responses
- Hardware malfunctions

### Database Errors
- File system permissions
- Corrupted database files
- Disk space issues

## Example Usage Scenarios

### 1. Basic Access Control

```typescript
// Initialize system
const accessControl = new AccessControlSystem(scanner, db);
await accessControl.initialize();

// Process access request
const result = await accessControl.processAccessRequest();
if (result.success) {
  console.log(`Welcome, ${result.user.name}!`);
} else {
  console.log(`Access denied: ${result.message}`);
}
```

### 2. User Enrollment

```typescript
// Capture fingerprint for enrollment
const scanResult = await scanner.captureFingerprint();
if (scanResult.success) {
  const newUser = await db.addUser({
    name: "John Doe",
    email: "john@company.com",
    department: "Engineering",
    fingerprint: scanResult.fingerprint
  });
  console.log(`User enrolled with ID: ${newUser.id}`);
}
```

### 3. System Monitoring

```typescript
// Check scanner status
const isOnline = await scanner.checkStatus();
console.log(`Scanner status: ${isOnline ? '🟢 Online' : '🔴 Offline'}`);

// Get database statistics
const stats = await db.getStatistics();
console.log(`Total users: ${stats.totalUsers}`);
console.log(`Recent access: ${stats.recentAccess}`);
```

## Testing with Mock Data

The example includes mock functionality for testing without a physical scanner:

```typescript
// Use mock scanner for testing
const mockScanner = new MockFingerprintScanner();
const accessControl = new AccessControlSystem(mockScanner, db);
```

## Security Considerations

1. **Network Security**: Use HTTPS for production deployments
2. **Data Encryption**: Consider encrypting fingerprint data at rest
3. **Access Logging**: Maintain audit trails for compliance
4. **Rate Limiting**: Implement limits to prevent abuse
5. **Authentication**: Secure the scanner API endpoints

## Production Deployment

For production use:

1. Configure proper network security
2. Set up database backups
3. Implement monitoring and alerting
4. Test failover scenarios
5. Document operational procedures

## Troubleshooting

### Common Issues

1. **Scanner Connection Failed**
   - Check network connectivity
   - Verify scanner IP and port
   - Ensure scanner is powered on

2. **Database Access Denied**
   - Check file permissions
   - Verify directory exists
   - Ensure sufficient disk space

3. **Fingerprint Matching Failed**
   - Verify fingerprint data quality
   - Check matching threshold settings
   - Ensure database integrity

### Debug Mode

Enable debug logging for troubleshooting:

```typescript
const accessControl = new AccessControlSystem(scanner, db, {
  debug: true
});
```

## Performance Optimization

1. **Caching**: Implement fingerprint cache for frequent users
2. **Database Indexing**: Consider using a proper database for large datasets
3. **Connection Pooling**: Reuse HTTP connections to the scanner
4. **Batch Operations**: Process multiple enrollments efficiently

## Integration with Existing Systems

The fingerprint matcher can be integrated with:
- Web applications via REST APIs
- Desktop applications via native modules
- Mobile apps via React Native
- IoT devices via embedded systems

For more examples and advanced usage, see the main README.md file.
