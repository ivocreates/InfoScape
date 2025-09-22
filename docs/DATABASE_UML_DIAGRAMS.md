# Database Design and UML Diagrams - InfoScape OSINT Application

## Entity Relationship Diagram

### Conceptual ER Model

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│      User       │    1:N  │  Investigation  │   1:N   │    SearchQuery  │
│─────────────────│◄────────│─────────────────│◄────────│─────────────────│
│ + userID (PK)   │         │ + investigationID│         │ + queryID (PK)  │
│ + email         │         │   (PK)          │         │ + query_text    │
│ + displayName   │         │ + userID (FK)   │         │ + investigationID│
│ + createdAt     │         │ + title         │         │   (FK)          │
│ + lastLogin     │         │ + description   │         │ + engine_type   │
│ + preferences   │         │ + status        │         │ + created_at    │
│ + role          │         │ + createdAt     │         │ + parameters    │
└─────────────────┘         │ + updatedAt     │         │ + results_count │
                            │ + tags          │         └─────────────────┘
                            └─────────────────┘
                                     │
                                     │ 1:N
                                     ▼
                            ┌─────────────────┐
                            │  SearchResult   │
                            │─────────────────│
                            │ + resultID (PK) │
                            │ + queryID (FK)  │
                            │ + url           │
                            │ + title         │
                            │ + snippet       │
                            │ + relevance_sc  │
                            │ + found_at      │
                            │ + metadata      │
                            └─────────────────┘

┌─────────────────┐         ┌─────────────────┐
│   ProfileData   │    N:1  │   Investigation │
│─────────────────│────────►│─────────────────│
│ + profileID(PK) │         │ (From Above)    │
│ + investigationID│         └─────────────────┘
│   (FK)          │
│ + platform      │
│ + profile_url   │
│ + username      │
│ + risk_level    │
│ + confidence    │
│ + data_points   │
│ + analyzed_at   │
└─────────────────┘

┌─────────────────┐         ┌─────────────────┐
│  OSINTToolData  │    N:1  │   Investigation │
│─────────────────│────────►│─────────────────│
│ + toolDataID(PK)│         │ (From Above)    │
│ + investigationID│         └─────────────────┘
│   (FK)          │
│ + tool_name     │
│ + query_params  │
│ + response_data │
│ + status        │
│ + executed_at   │
│ + execution_time│
└─────────────────┘
```

### Physical Database Schema (Firestore Collections)

```
users/ (Collection)
├── {userId}/ (Document)
    ├── email: string
    ├── displayName: string
    ├── photoURL: string
    ├── createdAt: timestamp
    ├── lastLogin: timestamp
    ├── preferences: map
    │   ├── theme: string
    │   ├── defaultBrowser: string
    │   └── notifications: boolean
    └── role: string

investigations/ (Collection)
├── {investigationId}/ (Document)
    ├── userId: reference
    ├── title: string
    ├── description: string
    ├── status: string (active, completed, archived)
    ├── createdAt: timestamp
    ├── updatedAt: timestamp
    ├── tags: array[string]
    ├── targetInfo: map
    │   ├── fullName: string
    │   ├── email: string
    │   ├── username: string
    │   ├── location: string
    │   └── context: string
    ├── searchParameters: map
    │   ├── sites: string
    │   ├── filetypes: string
    │   ├── operators: array[string]
    │   └── preset: string
    └── summary: map
        ├── totalQueries: number
        ├── totalResults: number
        ├── riskLevel: string
        └── lastAnalyzed: timestamp

searchHistory/ (Collection)
├── {searchId}/ (Document)
    ├── investigationId: reference
    ├── queryText: string
    ├── engineType: string
    ├── parameters: map
    ├── executedAt: timestamp
    ├── executionTime: number
    ├── resultCount: number
    ├── success: boolean
    └── metadata: map

searchResults/ (Collection)
├── {resultId}/ (Document)
    ├── searchId: reference
    ├── url: string
    ├── title: string
    ├── snippet: string
    ├── relevanceScore: number
    ├── platform: string
    ├── foundAt: timestamp
    ├── verified: boolean
    ├── metadata: map
    └── tags: array[string]

profiles/ (Collection)
├── {profileId}/ (Document)
    ├── investigationId: reference
    ├── platform: string
    ├── profileUrl: string
    ├── username: string
    ├── displayName: string
    ├── riskLevel: string (high, medium, low)
    ├── confidenceScore: number
    ├── dataPoints: map
    │   ├── publicInfo: number
    │   ├── contactInfo: boolean
    │   ├── workInfo: boolean
    │   └── locationInfo: boolean
    ├── connections: array[reference]
    ├── analyzedAt: timestamp
    └── analysis: map

osintToolData/ (Collection)
├── {toolDataId}/ (Document)
    ├── investigationId: reference
    ├── toolName: string
    ├── queryParams: map
    ├── responseData: map
    ├── status: string
    ├── executedAt: timestamp
    ├── executionTime: number
    └── errorInfo: map
```

## Use Case Diagram

```
                        InfoScape OSINT System

            ┌─────────────────────────────────────────────────────┐
            │                                                     │
    ┌───────────┐                                      ┌──────────────┐
    │   User    │                                      │    System    │
    │(Investigator)│                                   │Administrator │
    └─────┬─────┘                                      └──────┬───────┘
          │                                                   │
          │                                                   │
    ┌─────▼─────┐    ┌─────────────┐    ┌─────────────┐      │
    │   Login   │    │   Create    │    │   Manage    │      │
    │  System   │    │Investigation│    │Investigations│     │
    └─────┬─────┘    └─────────────┘    └─────────────┘      │
          │                   │                   │           │
          │                   │                   │           │
    ┌─────▼─────┐    ┌────────▼────────┐ ┌────────▼────────┐ │
    │ Dashboard │    │ Build Search    │ │ View Results    │ │
    │  Access   │    │    Queries      │ │   & Reports     │ │
    └─────┬─────┘    └─────────────────┘ └─────────────────┘ │
          │                   │                   │           │
          │                   │                   │           │
    ┌─────▼─────┐    ┌────────▼────────┐ ┌────────▼────────┐ │
    │  Profile  │    │   Execute       │ │   Export        │ │
    │ Analysis  │    │ Multi-Engine    │ │ Investigation   │ │
    │           │    │    Search       │ │    Data         │ │
    └─────┬─────┘    └─────────────────┘ └─────────────────┘ │
          │                   │                   │           │
          │                   │                   │           │
    ┌─────▼─────┐    ┌────────▼────────┐ ┌────────▼────────┐ │
    │  Browser  │    │ OSINT Tools     │ │   Save & Load   │ │
    │Integration│    │  Integration    │ │ Investigations  │ │
    └───────────┘    └─────────────────┘ └─────────────────┘ │
                                                             │
    ┌─────────────────────────────────────────────────────────▼────┐
    │                System Maintenance                            │
    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
    │  │   User      │  │  Database   │  │    Security         │  │
    │  │ Management  │  │   Backup    │  │   Monitoring        │  │
    │  └─────────────┘  └─────────────┘  └─────────────────────┘  │
    └──────────────────────────────────────────────────────────────┘
```

## Class Diagram

```
┌─────────────────────────────────────┐
│               User                  │
├─────────────────────────────────────┤
│ - userID: string                    │
│ - email: string                     │
│ - displayName: string               │
│ - photoURL: string                  │
│ - createdAt: Date                   │
│ - preferences: UserPreferences      │
│ - role: UserRole                    │
├─────────────────────────────────────┤
│ + authenticate(): boolean           │
│ + updateProfile(data): void         │
│ + getInvestigations(): Investigation│
│ + createInvestigation(): Investigation│
└─────────────────────────────────────┘
                    │
                    │ 1:N
                    ▼
┌─────────────────────────────────────┐
│           Investigation             │
├─────────────────────────────────────┤
│ - investigationID: string           │
│ - userID: string                    │
│ - title: string                     │
│ - description: string               │
│ - status: InvestigationStatus       │
│ - targetInfo: TargetInfo            │
│ - searchParams: SearchParameters    │
│ - createdAt: Date                   │
│ - updatedAt: Date                   │
├─────────────────────────────────────┤
│ + addSearchQuery(query): void       │
│ + generateReport(): Report          │
│ + analyzeProfiles(): AnalysisResult │
│ + exportData(format): File          │
│ + archive(): void                   │
└─────────────────────────────────────┘
                    │
                    │ 1:N
                    ▼
┌─────────────────────────────────────┐
│           SearchEngine              │
├─────────────────────────────────────┤
│ - engineType: EngineType            │
│ - apiKey: string                    │
│ - rateLimit: number                 │
│ - lastQuery: Date                   │
├─────────────────────────────────────┤
│ + buildQuery(params): string        │
│ + executeSearch(query): SearchResult│
│ + validateQuery(query): boolean     │
│ + getRateLimit(): number            │
└─────────────────────────────────────┘
                    │
                    │ uses
                    ▼
┌─────────────────────────────────────┐
│           QueryBuilder              │
├─────────────────────────────────────┤
│ - operators: Operator[]             │
│ - templates: QueryTemplate[]        │
│ - validation: ValidationRules       │
├─────────────────────────────────────┤
│ + buildGoogleDork(params): string   │
│ + applyTemplate(template): string   │
│ + validateSyntax(query): boolean    │
│ + optimizeQuery(query): string      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         ProfileAnalyzer             │
├─────────────────────────────────────┤
│ - platforms: Platform[]             │
│ - riskThresholds: RiskThreshold     │
│ - mlModel: AnalysisModel            │
├─────────────────────────────────────┤
│ + analyzeProfile(url): ProfileData  │
│ + calculateRisk(profile): RiskLevel │
│ + findConnections(profile): Profile[]│
│ + generateRecommendations(): string[]│
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│        OSINTToolManager             │
├─────────────────────────────────────┤
│ - registeredTools: OSINTTool[]      │
│ - activeConnections: Connection[]   │
│ - rateLimiter: RateLimiter          │
├─────────────────────────────────────┤
│ + registerTool(tool): void          │
│ + executeToolSearch(tool, query): Result│
│ + manageRateLimit(tool): void       │
│ + aggregateResults(results): Report │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         DatabaseManager             │
├─────────────────────────────────────┤
│ - firestore: Firestore              │
│ - collections: Collection[]         │
│ - encryptionKey: string             │
├─────────────────────────────────────┤
│ + saveInvestigation(data): void     │
│ + loadInvestigation(id): Investigation│
│ + encryptSensitiveData(data): string│
│ + createBackup(): boolean           │
└─────────────────────────────────────┘
```

## State Diagram - Investigation Workflow

```
                    [Investigation Created]
                            │
                            ▼
                    ┌─────────────┐
               ┌────│   DRAFT     │
               │    └─────────────┘
               │            │
               │            │ add_parameters
               │            ▼
               │    ┌─────────────┐
               │    │  CONFIGURED │
               │    └─────────────┘
               │            │
               │            │ start_search
               │            ▼
               │    ┌─────────────┐     search_error
               │    │   ACTIVE    │◄──────────────┐
               │    └─────────────┘               │
               │            │                     │
               │            │ complete_search     │
               │            ▼                     │
               │    ┌─────────────┐               │
               │    │ ANALYZING   │               │
               │    └─────────────┘               │
               │            │                     │
               │            │ analysis_complete   │
               │            ▼                     │
               │    ┌─────────────┐               │
               │    │ COMPLETED   │               │
               │    └─────────────┘               │
               │            │                     │
               │            │ export/archive      │
               │            ▼                     │
               │    ┌─────────────┐               │
          edit │    │  ARCHIVED   │               │
               │    └─────────────┘               │
               │                                  │
               └──────────────────────────────────┘

    State Actions:
    - DRAFT: Basic information entry, parameter setup
    - CONFIGURED: Query validation, template selection
    - ACTIVE: Multi-engine search execution, real-time monitoring
    - ANALYZING: Result correlation, profile analysis, risk assessment
    - COMPLETED: Report generation, export options available
    - ARCHIVED: Read-only access, historical reference
```

## Data Model Relationships

```
User (1) ──────────── (N) Investigation
                           │
                           │ (1)
                           │
Investigation (1) ──── (N) SearchQuery
                           │
                           │ (1)
                           │
SearchQuery (1) ────── (N) SearchResult
                           │
                           │
Investigation (1) ──── (N) ProfileData
                           │
                           │
Investigation (1) ──── (N) OSINTToolData

Indexes for Query Optimization:
- users: { email: 1, createdAt: -1 }
- investigations: { userId: 1, status: 1, updatedAt: -1 }
- searchHistory: { investigationId: 1, executedAt: -1 }
- searchResults: { searchId: 1, relevanceScore: -1 }
- profiles: { investigationId: 1, platform: 1, confidenceScore: -1 }

Data Validation Rules:
- User email must be unique and valid format
- Investigation title required, max 200 characters
- Search queries must pass syntax validation
- Profile URLs must be valid HTTP/HTTPS format
- Risk levels must be enum: [high, medium, low, unknown]
```

## Security Model

```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                      │
├─────────────────────────────────────────────────────────┤
│  Authentication Layer                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Firebase  │  │ Multi-Factor│  │    Session      │  │
│  │    Auth     │  │     Auth    │  │   Management    │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  Authorization Layer                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Role-Based  │  │   Resource  │  │   Data Access   │  │
│  │   Access    │  │  Permission │  │    Control      │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  Data Protection Layer                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  Field-Level│  │ Transmission│  │     Backup      │  │
│  │ Encryption  │  │ Encryption  │  │   Encryption    │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  Audit & Monitoring Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Access    │  │   Security  │  │   Compliance    │  │
│  │   Logging   │  │ Monitoring  │  │   Reporting     │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘

Security Rules Example (Firestore):
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
    
    // Investigations are private to the owner
    match /investigations/{investigationId} {
      allow read, write: if request.auth != null 
        && resource.data.userId == request.auth.uid;
    }
    
    // Search results tied to user's investigations
    match /searchResults/{resultId} {
      allow read, write: if request.auth != null 
        && exists(/databases/$(database)/documents/investigations/$(resource.data.investigationId))
        && get(/databases/$(database)/documents/investigations/$(resource.data.investigationId)).data.userId == request.auth.uid;
    }
  }
}
```