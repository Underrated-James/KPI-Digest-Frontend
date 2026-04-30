<!-- Architecture documentation -->

# Enterprise API Architecture - Implementation Guide

## 📋 Overview

This refactoring implements an **enterprise-grade centralized API architecture** that eliminates code duplication and provides a scalable, maintainable solution for managing API communication across your feature modules.

## 🏗️ Architecture

```
Frontend Application
        ↓
    Features
    ├── Users
    ├── Projects
    ├── Sprints
    ├── Tickets
    └── Teams
        ↓
    Each Feature's API Layer (user-api.ts, project-api.ts, etc.)
        ↓
    Core API Client (Singleton)
    ├── Config (env-based)
    ├── Interceptors (centralized logic)
    └── Error Handling
        ↓
    Axios HTTP Instance
        ↓
    Backend API
```

## 🎯 Key Benefits

### 1. **Single Source of Truth**

- One axios instance for entire application
- Consistent headers, timeouts, and error handling
- No code duplication across features

### 2. **Environment-Based Configuration**

- Dev/staging/production configs via `.env` files
- No hardcoded API URLs
- Easy deployment without code changes

### 3. **Centralized Cross-Cutting Concerns**

- Request logging (dev mode)
- Response timing & performance monitoring
- Auth token management (ready to implement)
- Global error normalization

### 4. **Type Safety**

- Centralized endpoint definitions
- Feature-level type checking
- IDE autocompletion for endpoints

### 5. **Scalability**

- Add new features without duplicating interceptor logic
- Modify global behavior in one place
- Easy to add metrics/analytics

## 📁 Directory Structure

```
src/
├── core/api/                          # Core API module (centralized)
│   ├── client/
│   │   ├── api-client.ts              # Singleton axios instance
│   │   └── api-interceptors.ts        # Centralized request/response handlers
│   ├── config/
│   │   ├── api-config.ts              # Load & validate env vars
│   │   └── api-endpoints.ts           # Feature endpoint mappings
│   └── index.ts                       # Public API exports
│
├── features/
│   ├── users/infrastructure/api/
│   │   ├── axios-instance.ts          # ⬇️ NOW: Just exports core client
│   │   ├── user-api.ts                # ✅ REFACTORED: Uses core client
│   │   └── index.ts
│   │
│   ├── projects/infrastructure/api/   # ✅ Same pattern
│   ├── sprints/infrastructure/api/    # ✅ Same pattern
│   ├── tickets/infrastructure/api/    # ✅ Same pattern
│   └── teams/infrastructure/api/      # ✅ Same pattern
│
└── lib/
    └── api-error.ts                   # Kept for error normalization
```

## 🔧 Environment Files

### `.env.local` (Development)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_LOG_API_REQUESTS=true
```

### `.env.staging`

```env
NEXT_PUBLIC_API_URL=https://staging-api.agile-digest.com
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_LOG_API_REQUESTS=true
```

### `.env.production`

```env
NEXT_PUBLIC_API_URL=https://api.agile-digest.com
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_LOG_API_REQUESTS=false
```

## 💡 Usage Pattern

### Before (Code Duplication)

```typescript
// features/users/infrastructure/api/user-api.ts
import api from "./axios-instance"; // Duplicate axios config

export const userApi = {
  getUsers: async () => {
    const { data } = await api.get("/users");
    return data.data;
  },
};
```

### After (Enterprise Pattern)

```typescript
// features/users/infrastructure/api/user-api.ts
import { getApiClient, API_ENDPOINTS } from "@/core/api";

export const userApi = {
  getUsers: async () => {
    const api = getApiClient(); // Get singleton client
    const { data } = await api.get(API_ENDPOINTS.USERS.LIST); // Type-safe endpoint
    return data.data;
  },
};
```

## 🚀 How It Works

### 1. **Initialization** (App Startup)

```typescript
// Automatically called when first needed
const api = getApiClient(); // Creates singleton instance with config
```

### 2. **Request Flow**

```
Request
  ↓
setupRequestInterceptor → Add timing, auth tokens, logging
  ↓
axios.get/post/patch/delete
  ↓
Backend Response
  ↓
setupResponseInterceptor → Log response, calculate duration
  ↓
Return to Feature API
```

### 3. **Error Handling**

```
API Error
  ↓
setupResponseErrorInterceptor
  ↓
normalizeApiError (existing error handler)
  ↓
Return normalized error to feature
```

## 📝 Adding New Features

When you add a new feature:

1. **Add endpoints to `API_ENDPOINTS`** in [api-endpoints.ts](src/core/api/config/api-endpoints.ts#L1)

```typescript
export const API_ENDPOINTS = {
  CUSTOM_FEATURE: {
    LIST: "/custom-features",
    GET: (id: string) => `/custom-features/${id}`,
    CREATE: "/custom-features",
    UPDATE: (id: string) => `/custom-features/${id}`,
    DELETE: (id: string) => `/custom-features/${id}`,
  },
};
```

2. **Create feature API file** using pattern:

```typescript
import { getApiClient, API_ENDPOINTS } from "@/core/api";

export const customFeatureApi = {
  async getFeatures() {
    const api = getApiClient();
    const { data } = await api.get(API_ENDPOINTS.CUSTOM_FEATURE.LIST);
    return data.data;
  },
};
```

3. **Update `axios-instance.ts`** to export core client:

```typescript
export { getApiClient as getApi } from "@/core/api";
export { API_ENDPOINTS } from "@/core/api";
```

## 🔐 Future Enhancements

### Ready to Implement:

- **Authentication**: Uncomment token injection in [api-interceptors.ts](src/core/api/client/api-interceptors.ts#L28-L31)
- **Request Cancellation**: Add AbortController for in-flight request management
- **Caching Strategy**: Implement response caching decorator
- **Analytics**: Send request metrics to monitoring service
- **Rate Limiting**: Implement exponential backoff
- **WebSocket Support**: Add real-time communication layer

### Implementation Steps:

1. Modify `setupRequestInterceptor` to add tokens
2. Add auth validation middleware
3. Implement refresh token rotation
4. Add CORS header handling

## ⚙️ Configuration Deep Dive

### `api-config.ts` - Validation & Safety

```typescript
// ✅ Validates all env vars at startup
// ✅ Throws early errors instead of runtime failures
// ✅ Provides singleton pattern for performance
const config = apiConfig(); // Can be called multiple times safely
```

### `api-interceptors.ts` - Cross-Cutting Concerns

```typescript
// Handles:
// - Request timing (performance monitoring)
// - Development logging
// - Auth token injection (ready to enable)
// - Error normalization
// - Response transformation
```

## 📊 Development Workflow

### View Configuration

```typescript
import { debugApiConfig } from "@/core/api";

// Call in your component/hook during development
debugApiConfig(); // Logs all config values in a table
```

### Enable Request Logging

Set in `.env.local`:

```env
NEXT_PUBLIC_LOG_API_REQUESTS=true
```

Output in browser console:

```
📤 API Request: GET /users
📥 API Response: 200 /users (45ms)
```

## 🧪 Testing

### Mock API Client

```typescript
import { resetApiClient } from "@/core/api";

beforeEach(() => {
  resetApiClient(); // Reset singleton for fresh test instance
});
```

## ✅ Checklist for Production

- [ ] All feature API files refactored to use `getApiClient()`
- [ ] All endpoints added to `API_ENDPOINTS`
- [ ] `.env.production` configured with real API URL
- [ ] Auth token injection implemented
- [ ] Error handling tested across features
- [ ] Request/response logging validated
- [ ] Performance monitoring in place
- [ ] CORS headers configured (if needed)

## 📚 Related Files

- [API Client](src/core/api/client/api-client.ts)
- [Interceptors](src/core/api/client/api-interceptors.ts)
- [Configuration](src/core/api/config/api-config.ts)
- [Endpoints Mapping](src/core/api/config/api-endpoints.ts)
- [Core API Index](src/core/api/index.ts)
- [Error Handler](src/lib/api-error.ts) (existing)

---

## 🎓 Best Practices Applied

1. **Singleton Pattern**: Guarantees single axios instance
2. **Dependency Injection**: Features receive API client, not create it
3. **Configuration Management**: Externalized via environment
4. **Separation of Concerns**: Interceptors, config, and client separate
5. **DRY Principle**: No duplicate axios configuration
6. **Type Safety**: Centralized endpoint definitions
7. **Error Boundaries**: Normalized error handling
8. **Performance Monitoring**: Request timing built-in
9. **Developer Experience**: Clear logging in dev mode
10. **Scalability**: Easy to add features/interceptors

---

**Created**: April 29, 2026  
**Architecture**: Enterprise Clean Architecture + DDD  
**Pattern**: Singleton + Dependency Injection + Configuration Management
