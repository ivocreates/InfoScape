# System Diagrams - InfoScape OSINT Application

## Data Flow Diagram (DFD)

### Level 0 - Context Diagram

```
                    External OSINT Tools
                           |
                          API
                           |
    User ──→ [InfoScape Application] ←──→ Firebase Services
                           |                    |
                          GUI                Database
                           |                    |
                    Investigation            Cloud Storage
                       Results                   |
                           |               Authentication
                    Local Storage
```

### Level 1 - System Overview

```
                        ┌─────────────────┐
                        │   User Input    │
                        │   Interface     │
                        └─────┬───────────┘
                              │
                    ┌─────────▼────────────┐
                    │  Query Processing   │
                    │     Module          │
                    └─────────┬───────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
  ┌───────▼─────┐    ┌────────▼────────┐  ┌──────▼──────┐
  │   Google    │    │ OSINT Tools     │  │ Profile     │
  │   Dorking    │    │ Integration     │  │ Analyzer    │
  │   Engine     │    │                 │  │             │
  └───────┬─────┘    └────────┬────────┘  └──────┬──────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              │
                    ┌─────────▼───────────┐
                    │ Result Aggregation  │
                    │ & Analysis Module   │
                    └─────────┬───────────┘
                              │
                    ┌─────────▼───────────┐
                    │ Data Storage &      │
                    │ Investigation Mgmt  │
                    └─────────────────────┘
```

## System Architecture Diagram

```
┌─────────────────────── PRESENTATION LAYER ──────────────────────────┐
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Login     │  │  Dashboard  │  │ Investigation│  │   Profile   │ │
│  │ Component   │  │ Component   │  │  Builder     │  │  Analyzer   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
│                                                                      │
└──────────────────────────┬───────────────────────────────────────────┘
                           │ React.js / Electron.js
┌─────────────────────── BUSINESS LOGIC LAYER ──────────────────────────┐
│                          │                                            │
│  ┌─────────────┐  ┌──────▼──────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ Auth        │  │   Search    │  │ Analysis    │  │ Integration │  │
│  │ Manager     │  │   Engine    │  │ Engine      │  │ Manager     │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │
│                                                                      │
└──────────────────────────┬───────────────────────────────────────────┘
                           │ API Calls / Service Layer
┌─────────────────────── DATA LAYER ────────────────────────────────────┐
│                          │                                            │
│  ┌─────────────┐  ┌──────▼──────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ Firebase    │  │ Firestore   │  │ Cloud       │  │ External    │  │
│  │ Auth        │  │ Database    │  │ Storage     │  │ APIs        │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

## Component Interaction Diagram

```
    User Authentication Flow:
    
    User → AuthComponent → Firebase Auth → UserManager → Dashboard
                    ↑                           ↓
              Session Storage ←──────── User Profile Data

    Investigation Workflow:
    
    User Input → QueryBuilder → SearchEngine → OSINTTools
                       ↓             ↓             ↓
    Templates ←─ ParameterParser → ResultAggregator
                       ↓             ↓
    Database ←─ InvestigationManager ← AnalysisEngine
                       ↓
    UI Display ←─ ResultRenderer
```

## Activity Diagram

```
START
  ↓
[User Launches App]
  ↓
[Is User Authenticated?] ──No──→ [Show Login Screen] ──→ [Authenticate] ──┐
  ↓ Yes                                                                   │
  └←──────────────────←──────────────────←──────────────────←────────────┘
  ↓
[Show Dashboard]
  ↓
[User Selects Investigation Type?]
  ├─→ [New Investigation] ──→ [Show Query Builder]
  ├─→ [Load Investigation] ──→ [Load Saved Data]
  └─→ [Quick Search] ──→ [Direct Search Interface]
      ↓
[User Enters Search Parameters]
  ↓
[Build Search Query]
  ↓
[Execute Multi-Engine Search]
  ↓
[Aggregate Results]
  ↓
[Perform Analysis]
  ↓
[Display Results]
  ↓
[Save Investigation?] ──Yes──→ [Store in Database]
  ↓ No
[Generate Report?] ──Yes──→ [Create PDF/CSV Export]
  ↓ No
[Continue Investigation?] ──Yes──→ [Return to Query Builder]
  ↓ No
END
```

## Sequence Diagram - Search Operation

```
User          QueryBuilder    SearchEngine    OSINTTools    Database
 |                 |              |              |            |
 |──search params──→|              |              |            |
 |                 |──validate────→|              |            |
 |                 |              |──build query─→|            |
 |                 |              |              |──execute───→|
 |                 |              |              |←─results────|
 |                 |              |←─raw results─|            |
 |                 |←─aggregated──|              |            |
 |                 |──save────────────────────────────────────→|
 |←─final results──|              |              |            |
 |                 |              |              |            |
```

## Network Architecture Diagram

```
┌─────────────────┐    HTTPS/WSS     ┌─────────────────┐
│   InfoScape     │◄─────────────────►│   Firebase      │
│   Desktop App   │                   │   Services      │
│                 │                   │                 │
│ ┌─────────────┐ │                   │ ┌─────────────┐ │
│ │   Electron  │ │                   │ │    Auth     │ │
│ │   Main      │ │                   │ │   Service   │ │
│ │   Process   │ │                   │ └─────────────┘ │
│ └─────────────┘ │                   │                 │
│                 │                   │ ┌─────────────┐ │
│ ┌─────────────┐ │                   │ │ Firestore   │ │
│ │   React     │ │                   │ │  Database   │ │
│ │   Frontend  │ │                   │ └─────────────┘ │
│ └─────────────┘ │                   │                 │
└─────────────────┘                   │ ┌─────────────┐ │
                                      │ │   Cloud     │ │
         │                            │ │  Storage    │ │
         │ HTTPS API Calls            │ └─────────────┘ │
         ▼                            └─────────────────┘
┌─────────────────┐
│  External OSINT │
│     Tools       │
│                 │
│ ┌─────────────┐ │
│ │ Shodan API  │ │
│ └─────────────┘ │
│                 │
│ ┌─────────────┐ │
│ │ Hunter.io   │ │
│ └─────────────┘ │
│                 │
│ ┌─────────────┐ │
│ │ HaveIBeen   │ │
│ │ Pwned API   │ │
│ └─────────────┘ │
└─────────────────┘
```

## Deployment Architecture

```
Development Environment:
┌─────────────────────────────────────────────────────────┐
│                Local Development                        │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│ │    IDE      │  │   Node.js   │  │ Firebase        │   │
│ │ (VS Code)   │  │  Runtime    │  │ Emulators       │   │
│ └─────────────┘  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────┘

Production Environment:
┌─────────────────────────────────────────────────────────┐
│                  User Desktop                           │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│ │  InfoScape  │  │  Electron   │  │    System       │   │
│ │ Application │  │  Runtime    │  │  Integration    │   │
│ └─────────────┘  └─────────────┘  └─────────────────┘   │
└─────────────┬───────────────────────────────────────────┘
              │
              │ Internet Connection
              ▼
┌─────────────────────────────────────────────────────────┐
│                Firebase Cloud                           │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│ │    Auth     │  │ Firestore   │  │     Cloud       │   │
│ │   Service   │  │  Database   │  │    Storage      │   │
│ └─────────────┘  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────┘
```