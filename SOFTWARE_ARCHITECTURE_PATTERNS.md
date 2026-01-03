# GrantBridge - Software Architecture & Design Patterns

## 📋 **Overview**

GrantBridge demonstrates **enterprise-grade software architecture** using multiple design patterns and architectural principles. This document catalogs all patterns implemented in the project for technical interviews and resume purposes.

---

## 🏗️ **ARCHITECTURAL PATTERNS**

### **1. N-Tier Architecture (Layered Architecture)**

**Implementation**: 4-tier separation with clear boundaries

```
┌─────────────────┐
│  Presentation   │ ← React Frontend (UI/UX)
│     Layer       │
└─────────────────┘
         │
┌─────────────────┐
│   Application   │ ← Express API (Business Logic)
│     Layer       │
└─────────────────┘
         │
┌─────────────────┐
│  Data Access    │ ← Supabase Client (Data Operations)
│     Layer       │
└─────────────────┘
         │
┌─────────────────┐
│  Data Storage   │ ← PostgreSQL (Persistence)
│     Layer       │
└─────────────────┘
```

**Benefits**: Separation of concerns, independent scaling, maintainability

**Files**:

- `src/` (Presentation)
- `server/src/index.ts` (Application)
- `server/src/supabaseClient.ts` (Data Access)

---

### **2. Client-Server Architecture**

**Implementation**: React SPA client communicating with REST API server

**Client Side**:

- React application (static files)
- Hosted on Hostinger
- Handles UI rendering and user interactions

**Server Side**:

- Node.js/Express REST API
- Hosted on Render
- Handles business logic and data processing

**Communication**: HTTP/HTTPS with JSON payloads

---

### **3. Microservices-Ready Monolith**

**Implementation**: Modular monolith designed for future microservices migration

**Current Structure**:

```
server/src/
├── index.ts          # Main application entry
├── grantsSync.ts     # Grant synchronization service
└── supabaseClient.ts # Database client
```

**Future Migration Path**:

- Grant Search Service
- User Management Service
- Email Service
- Sync Service

---

### **4. Service-Oriented Architecture (SOA)**

**Implementation**: Integration with external services via well-defined interfaces

**External Services**:

- **Perplexity AI (Sonar)**: AI-powered grant search
- **Supabase**: Database and authentication
- **Hostinger SMTP**: Email delivery
- **Cloudflare**: CDN and security

**Service Contracts**: REST APIs with JSON schemas

---

### **5. Event-Driven Architecture (Partial)**

**Implementation**: Cron-based scheduling and reactive UI updates

**Event Sources**:

- Scheduled cron jobs (grant sync)
- User interactions (form submissions)
- Authentication state changes

**Event Handlers**:

- Grant cache refresh
- Email notifications
- UI state updates

---

## 🎨 **DESIGN PATTERNS**

### **Creational Patterns**

#### **1. Singleton Pattern**

**Implementation**: Database client and configuration instances

```typescript
// server/src/supabaseClient.ts
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
```

**Usage**: Ensures single database connection instance

#### **2. Factory Pattern**

**Implementation**: Component creation and API response transformation

```typescript
// Grant transformation factory
function transformGrantsForSupabase(
  grants: GrantFromSonar[]
): GrantForSupabase[] {
  return grants.map((grant) => ({
    id: generateId(grant),
    source: "sonar",
    // ... transformation logic
  }));
}
```

**Usage**: Standardizes object creation across different data sources

---

### **Structural Patterns**

#### **3. Adapter Pattern**

**Implementation**: External API integration adapters

```typescript
// Sonar API adapter
const sonarResponse = await fetch(
  "https://api.perplexity.ai/chat/completions",
  {
    // ... configuration
  }
);
const transformedData = adaptSonarResponse(sonarResponse);
```

**Usage**: Adapts external API responses to internal data structures

#### **4. Facade Pattern**

**Implementation**: Simplified interfaces for complex subsystems

```typescript
// Authentication facade
export const useAuth = () => {
  const context = useContext(AuthContext);
  // Simplified interface for complex auth operations
  return {
    signIn,
    signOut,
    signUp,
    resetPassword,
    user,
    loading,
  };
};
```

**Usage**: Provides simple interface for complex authentication system

#### **5. Decorator Pattern**

**Implementation**: Higher-Order Components and middleware

```typescript
// Error boundary decorator
export default function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
) {
  return (props: P) => (
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  );
}
```

**Usage**: Adds error handling capabilities to components

---

### **Behavioral Patterns**

#### **6. Observer Pattern**

**Implementation**: React Context and state management

```typescript
// AuthContext observer pattern
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null); // Notify observers
    });
    return () => subscription.unsubscribe();
  }, []);
};
```

**Usage**: Notifies components of authentication state changes

#### **7. Strategy Pattern**

**Implementation**: Multiple rate limiting strategies

```typescript
// Different rate limiting strategies
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

const sonarLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 25,
});

const syncLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1,
});
```

**Usage**: Different rate limiting strategies based on endpoint type

#### **8. Command Pattern**

**Implementation**: Form actions and API operations

```typescript
// Command pattern for form submissions
const handleSubmit = async (formData: FormData) => {
  const command = new SubmitContactFormCommand(formData);
  await command.execute();
};
```

**Usage**: Encapsulates form submission operations

#### **9. Template Method Pattern**

**Implementation**: API endpoint structure

```typescript
// Template for API endpoints
app.post("/api/*", generalLimiter, async (req, res): Promise<any> => {
  try {
    // 1. Validation (template step)
    validateRequest(req);

    // 2. Business logic (implemented by specific endpoint)
    const result = await processRequest(req);

    // 3. Response formatting (template step)
    return res.json(formatResponse(result));
  } catch (error) {
    // 4. Error handling (template step)
    return handleError(error, res);
  }
});
```

**Usage**: Consistent structure across all API endpoints

---

## 🔧 **ARCHITECTURAL PRINCIPLES**

### **1. SOLID Principles**

#### **Single Responsibility Principle (SRP)**

- Each component has one reason to change
- `grantsSync.ts` - only handles grant synchronization
- `supabaseClient.ts` - only handles database connections
- React components - single UI responsibility

#### **Open/Closed Principle (OCP)**

- System open for extension, closed for modification
- New grant sources can be added without changing existing code
- Plugin-based architecture for external services

#### **Liskov Substitution Principle (LSP)**

- Interfaces can be substituted without breaking functionality
- Database clients are interchangeable
- Authentication providers are swappable

#### **Interface Segregation Principle (ISP)**

- Clients depend only on interfaces they use
- Separate interfaces for different user types
- Modular API endpoints

#### **Dependency Inversion Principle (DIP)**

- High-level modules don't depend on low-level modules
- Business logic doesn't depend on database implementation
- Abstractions through environment variables

---

### **2. DRY (Don't Repeat Yourself)**

**Implementation**: Reusable components and utilities

```typescript
// Reusable UI components
export const Button = ({ variant, size, children, ...props }) => {
  // Single implementation used throughout app
};

// Reusable API utilities
export const apiCall = async (endpoint: string, options: RequestInit) => {
  // Single HTTP client implementation
};
```

---

### **3. KISS (Keep It Simple, Stupid)**

**Implementation**: Simple, readable code structure

- Clear file organization
- Descriptive variable names
- Minimal complexity in functions
- Straightforward data flow

---

### **4. YAGNI (You Aren't Gonna Need It)**

**Implementation**: Only implement what's currently needed

- No over-engineering
- Features added when required
- Simple solutions preferred

---

## 🏛️ **ENTERPRISE PATTERNS**

### **1. Repository Pattern**

**Implementation**: Data access abstraction

```typescript
// User profile repository
export const fetchUserProfile = async (
  userId: string
): Promise<UserProfileData | null> => {
  // Abstract database operations
};

export const upsertUserProfile = async (
  userId: string,
  profile: UserProfileData
) => {
  // Abstract database operations
};
```

### **2. Unit of Work Pattern**

**Implementation**: Transaction management

```typescript
// Atomic operations in grant sync
export async function syncGrantsToSupabase(): Promise<void> {
  // 1. Clear existing grants
  await supabaseAdmin.from("grants_cache").delete().neq("id", "");

  // 2. Insert new grants
  await supabaseAdmin.from("grants_cache").insert(grantsForSupabase);

  // 3. Refresh materialized views
  await supabaseAdmin.rpc("refresh_popular_open");
}
```

### **3. Data Transfer Object (DTO) Pattern**

**Implementation**: Data structure for API communication

```typescript
interface GrantForSupabase {
  id: string;
  source: string;
  title: string;
  organization: string;
  description: string;
  // ... other properties
}
```

### **4. Dependency Injection Pattern**

**Implementation**: Environment-based configuration

```typescript
// Configuration injection
const app = express();
const PORT = process.env.PORT ?? 5000;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
```

---

## 🔐 **SECURITY PATTERNS**

### **1. Authentication/Authorization Pattern**

**Implementation**: JWT-based stateless authentication

```typescript
// JWT token validation
const { user, session } = await supabase.auth.getUser(token);
```

### **2. Input Validation Pattern**

**Implementation**: Server-side validation

```typescript
// Request validation
if (typeof age !== "number" || typeof country !== "string") {
  return res.status(400).json({ error: "Invalid input" });
}
```

### **3. Rate Limiting Pattern**

**Implementation**: Tiered rate limiting

```typescript
// Different limits for different endpoints
app.use("/api/", generalLimiter); // 100 req/15min
app.use("/api/grants", sonarLimiter); // 25 req/hour
```

---

## 📊 **PERFORMANCE PATTERNS**

### **1. Caching Pattern**

**Implementation**: Multiple caching layers

```typescript
// Database caching
const { data } = await supabaseAdmin
  .from("grants_cache")
  .select("*")
  .eq("is_featured", true);

// In-memory caching
const requirementDescriptionsCache = new Map<string, string[]>();
```

### **2. Lazy Loading Pattern**

**Implementation**: Component and data lazy loading

```typescript
// Component lazy loading
const LazyComponent = React.lazy(() => import("./Component"));

// Data lazy loading
const [data, setData] = useState(null);
useEffect(() => {
  if (shouldLoad) {
    loadData().then(setData);
  }
}, [shouldLoad]);
```

### **3. Connection Pooling Pattern**

**Implementation**: Database connection optimization

```typescript
// Supabase handles connection pooling automatically
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
```

---

## 🔄 **INTEGRATION PATTERNS**

### **1. API Gateway Pattern**

**Implementation**: Single entry point for all API calls

```typescript
// Express server as API gateway
app.use("/api/grants", grantsRouter);
app.use("/api/contact", contactRouter);
app.use("/api/sync", syncRouter);
```

### **2. Circuit Breaker Pattern**

**Implementation**: Graceful degradation for external services

```typescript
// Fallback for failed API calls
try {
  const grants = await fetchFromSonar();
  return grants;
} catch (error) {
  console.error("Sonar API failed, returning cached data");
  return getCachedGrants();
}
```

### **3. Retry Pattern**

**Implementation**: Automatic retry for failed operations

```typescript
// Supabase client handles retries automatically
// Custom retry for external APIs
const retryOperation = async (
  operation: () => Promise<any>,
  maxRetries = 3
) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(1000 * Math.pow(2, i)); // Exponential backoff
    }
  }
};
```

---

## 📈 **SCALABILITY PATTERNS**

### **1. Horizontal Scaling Pattern**

**Implementation**: Stateless application design

- No server-side sessions (JWT tokens)
- Stateless API endpoints
- Database connection pooling
- CDN for static assets

### **2. Load Balancing Pattern**

**Implementation**: Ready for load balancer integration

- Stateless backend services
- Health check endpoints
- Graceful shutdown handling

### **3. Database Scaling Pattern**

**Implementation**: Optimized database operations

- Indexed queries
- Connection pooling
- Read replicas (future)
- Materialized views

---

## 🎯 **RESUME SUMMARY**

**This project demonstrates mastery of:**

### **Architectural Patterns:**

- N-Tier Architecture
- Client-Server Architecture
- Service-Oriented Architecture
- Event-Driven Architecture
- Microservices-Ready Design

### **Design Patterns:**

- **Creational**: Singleton, Factory
- **Structural**: Adapter, Facade, Decorator
- **Behavioral**: Observer, Strategy, Command, Template Method

### **Enterprise Patterns:**

- Repository Pattern
- Unit of Work Pattern
- Data Transfer Object Pattern
- Dependency Injection Pattern

### **Quality Principles:**

- SOLID Principles
- DRY, KISS, YAGNI
- Security by Design
- Performance Optimization
- Scalability Planning

---

**This comprehensive pattern implementation demonstrates senior-level software architecture skills suitable for enterprise-grade applications.**
