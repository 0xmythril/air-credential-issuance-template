# Ethos Network Score API

This API endpoint integrates with Ethos Network to fetch user reputation scores and levels for credential issuance.

## Overview

The `/api/user/user-data` endpoint serves as a reputation scoring service that:

1. **Fetches user score** from Ethos Network API
2. **Retrieves reputation level** based on the user's activity
3. **Returns formatted data** for credential issuance

## Architecture

### Core Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend UI   │───▶│   API Route      │───▶│  Ethos API      │
│  IssuanceModal  │    │  /user/user-data │    │  Score/Level    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Formatted Data  │◀───│ Data Processing  │◀───│  Raw API Data   │
│ with Formatting │    │ & JWT Creation   │    │ Score & Level   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## API Integration Details

### Ethos Network Score Endpoint

**Purpose**: Fetches user reputation score and level from Ethos Network

```typescript
GET https://api.ethos.network/api/v2/score/address?address={address}
```

**Response Processing**:
- ✅ Fetches user score (numeric value)
- ✅ Retrieves reputation level (string classification)
- ✅ Handles API failures gracefully
- ✅ Returns empty object on errors for resilient processing

## Data Processing Logic

### User Reputation Metrics

```typescript
// Extracted from Ethos API response
{
  address: string,           // User wallet address
  is_test_address: boolean,  // Whether using test address override
  score: number | undefined, // Ethos reputation score
  level: string | undefined  // Ethos reputation level
}
```

### Processing Flow

The data processing follows a simple flow:

1. **Authentication**: Verify user session token
2. **Address Resolution**: Use actual user ID or test address override
3. **API Call**: Fetch score and level from Ethos Network
4. **Response Formatting**: Structure data for credential issuance
5. **JWT Creation**: Sign response for secure credential issuance

## Configuration Options

### Adjustable Settings

```typescript
const CONFIG = {
  // API endpoints
  ETHOS_BASE_URL: "https://api.ethos.network/api/v2/score/address",
  
  // Test configuration (can be easily switched for test builds)
  TEST_ADDRESS: env.NEXT_PRIVATE_TEST_ADDRESS as string | null, // Set to wallet address for testing, null for production
  // Example: TEST_ADDRESS: "0x1234567890123456789012345678901234567890",
} as const;
```

### Test Mode Configuration

To enable test mode, set the `NEXT_PRIVATE_TEST_ADDRESS` environment variable:
- **Production**: Set to `null` or omit the environment variable
- **Testing**: Set to a specific wallet address to override the authenticated user's address

## Response Schema

### Final API Response

```typescript
{
  jwt: string,                    // Signed JWT for credential issuance
  response: {
    address: string,              // Wallet address analyzed
    is_test_address: boolean,     // Whether using test address override
    score: number | undefined,    // Ethos reputation score
    level: string | undefined     // Ethos reputation level
  }
}
```

## Frontend Integration

### Data Display

The frontend automatically formats the response data:

- **Address**: Truncated display (`0x1234...5678`) or "Test Address" in test mode
- **Score**: Numeric formatting for reputation score
- **Level**: String display for reputation level classification

### Test Mode Indicators

When `NEXT_PRIVATE_TEST_ADDRESS` environment variable is set:
- ✅ Address label changes to **"Test Address"**
- ✅ Orange color styling (`text-orange-600 font-semibold`)

**To enable test mode**: Set the environment variable:
```bash
NEXT_PRIVATE_TEST_ADDRESS=0x1234567890123456789012345678901234567890
```

## Error Handling

### Robust Error Management

1. **Authentication Errors**: JWT validation failures return 401
2. **API Failures**: Ethos API failures return empty object, allowing graceful degradation
3. **Missing User Data**: Returns 400 if user ID not found in session
4. **Network Issues**: HTTP errors are caught and logged, returning empty data
5. **Graceful Degradation**: System continues processing even when score/level data is unavailable

### Logging Strategy

The system uses emoji-enhanced logging for easy debugging:

```
🔄 Starting Ethos data fetch...
👤 Target address: 0x1234...5678
✅ Ethos data fetch complete: { score: 850, level: "High" }
```

## Environment Variables

```bash
# Optional - for test mode
NEXT_PRIVATE_TEST_ADDRESS=0x1234567890123456789012345678901234567890
```

**Note**: No API key is required for Ethos Network as it provides public access to reputation scores.

## Performance Considerations

### Optimization Strategies

1. **Single API Call**: Simple GET request to Ethos Network
2. **Lightweight Response**: Minimal data transfer (score + level only)
3. **Frontend Caching**: React Query provides 5-minute cache
4. **Error Resilience**: Graceful fallback when API is unavailable
5. **No Rate Limiting**: Ethos Network provides generous public API access

### Typical Performance

- **API Calls**: 1 simple GET request
- **Processing Time**: < 1 second for complete analysis
- **Data Transfer**: < 1KB (minimal JSON response)

## Future Enhancements

### Potential Improvements

1. **Additional Reputation Sources**: Integrate with other on-chain reputation systems
2. **Historical Score Tracking**: Track reputation changes over time
3. **Advanced Metrics**: Reputation trend analysis and predictions
4. **Caching Layer**: Database caching for frequently accessed scores
5. **Real-time Updates**: WebSocket integration for live reputation changes
6. **Multi-chain Support**: Extend to other blockchain networks

## Troubleshooting

### Common Issues

1. **"Score/Level undefined"**: Address may not have reputation data in Ethos Network
2. **"API not responding"**: Check network connectivity and Ethos API status
3. **"Authentication failed"**: Verify user session token is valid
4. **"Test mode not working"**: Ensure `NEXT_PRIVATE_TEST_ADDRESS` environment variable is set correctly
5. **"Empty response"**: Address may be new or have no on-chain activity

### Debug Information

Check browser console for detailed logging - all API requests and responses are logged with emoji indicators for easy identification. Look for the 🔄 and ✅ indicators to track the Ethos data fetching process.

---

*This API serves as the backbone for reputation-based credential issuance, providing reliable access to Ethos Network reputation scores.*
