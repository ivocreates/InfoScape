# 🌐 InfoScape Development Guide

## Project Architecture

InfoScape is built with a modern, modular architecture designed for scalability and maintainability:

### Backend (Python/FastAPI)

```text
backend/
├── main.py                 # FastAPI application entry point
├── modules/                # Core OSINT modules
│   ├── people_search.py    # Advanced people search engine
│   ├── reverse_lookup.py   # Reverse lookup capabilities
│   ├── social_intel.py     # Social media intelligence
│   ├── domain_intel.py     # Domain/IP intelligence
│   ├── data_correlation.py # Entity correlation engine
│   ├── osint_tools.py      # OSINT tools manager
│   └── report_generator.py # Report generation
├── database/               # Database management
│   └── db_manager.py       # SQLite database operations
├── utils/                  # Utility functions
│   ├── validators.py       # Input validation
│   ├── confidence_scoring.py # Confidence calculations
│   ├── data_sources.py     # Data source managers
│   └── logger.py           # Logging configuration
└── requirements.txt        # Python dependencies
```

### Frontend (Electron/React)

```text
electron-app/
├── main.js                 # Electron main process
├── preload.js              # Electron preload script
├── src/                    # React application
│   ├── components/         # React components
│   │   ├── Layout/         # Application layout
│   │   ├── Search/         # Search interfaces
│   │   ├── Results/        # Results display
│   │   ├── Intelligence/   # Intelligence modules
│   │   └── Visualization/  # Data visualization
│   ├── context/            # React context providers
│   ├── services/           # API services
│   ├── theme/              # Material-UI theme
│   └── utils/              # Frontend utilities
└── package.json            # Node.js dependencies
```

## Key Technologies

### Backend Stack

- **FastAPI**: High-performance Python web framework
- **SQLite**: Embedded database for local storage
- **AsyncIO**: Asynchronous programming for parallel operations
- **Pydantic**: Data validation and serialization
- **aiohttp**: Async HTTP client for web requests

### Frontend Stack

- **Electron**: Cross-platform desktop application framework
- **React**: Component-based UI library
- **Material-UI**: Professional UI component library
- **D3.js**: Data visualization and network graphs
- **Chart.js**: Interactive charts and analytics

### OSINT Tools Integration

- **Sherlock**: Username enumeration across platforms
- **theHarvester**: Email and domain intelligence
- **Photon**: Advanced web crawling
- **Sublist3r**: Subdomain enumeration
- **Shodan**: IoT device discovery
- **Custom scrapers**: Platform-specific data extraction

## Development Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- Git
- SQLite (included with Python)

### Installation

```bash
# Clone repository
git clone https://github.com/ivocreates/InfoScape.git
cd InfoScape

# Run setup script
chmod +x setup.sh
./setup.sh

# Or on Windows
setup.bat
```

### Manual Setup

```bash
# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Frontend setup
cd ../electron-app
npm install

# Initialize database
cd ../backend
source venv/bin/activate
python -c "import asyncio; from database.db_manager import DatabaseManager; asyncio.run(DatabaseManager().initialize())"
```

## API Documentation

### Authentication

Currently, InfoScape operates in local-only mode without authentication. Future versions will include:

- API key authentication
- OAuth integration
- Rate limiting
- Audit logging

### Core Endpoints

#### People Search

```http
POST /api/search/people
Content-Type: application/json

{
  "query_type": "people",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "location": "New York, NY",
  "advanced_options": {
    "deep_search": true,
    "social_media_only": false,
    "confidence_threshold": 0.7
  }
}
```

#### Reverse Lookup

```http
POST /api/search/reverse
Content-Type: application/json

{
  "query_type": "reverse",
  "phone": "+1234567890",
  "email": "target@example.com",
  "ip_address": "192.168.1.1"
}
```

#### Social Intelligence

```http
POST /api/intel/social
Content-Type: application/json

{
  "username": "johndoe",
  "platforms": ["twitter", "instagram", "linkedin"],
  "deep_analysis": true
}
```

#### Domain Intelligence

```http
POST /api/intel/domain
Content-Type: application/json

{
  "domain": "example.com",
  "include_subdomains": true,
  "security_scan": true,
  "historical_data": true
}
```

### Response Format

```json
{
  "success": true,
  "search_id": "search_abc123",
  "status": "completed",
  "results": {
    "profiles": [...],
    "contacts": [...],
    "domains": [...],
    "intelligence": [...]
  },
  "metadata": {
    "confidence_score": 0.85,
    "sources_used": ["sherlock", "hunter.io", "whois"],
    "execution_time": 45.2,
    "total_results": 127
  }
}
```

## Database Schema

### Core Tables

- **searches**: Search metadata and status
- **search_results**: Individual search results
- **profiles**: Social media profiles
- **entities**: Correlated entities
- **investigation_sessions**: Investigation projects
- **intelligence_reports**: Generated reports

### Relationships

```sql
searches (1) -> (*) search_results
profiles (1) -> (*) profile_connections
entities (1) -> (*) entity_relationships
investigation_sessions (1) -> (*) session_searches
```

## Configuration

### Backend Configuration (.env)

```env
# Server Configuration
DEBUG=True
HOST=127.0.0.1
PORT=8000

# Database
DATABASE_URL=sqlite:///database/infoscape.db

# API Keys
SHODAN_API_KEY=your_shodan_key
VIRUSTOTAL_API_KEY=your_vt_key
HUNTER_IO_API_KEY=your_hunter_key

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600

# Security
SECRET_KEY=your-secret-key
CORS_ORIGINS=http://localhost:3000
```

### Frontend Configuration (.env)

```env
REACT_APP_API_URL=http://127.0.0.1:8000
REACT_APP_VERSION=2.0.0
REACT_APP_ENVIRONMENT=development
```

## Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

### Frontend Tests

```bash
cd electron-app
npm test
```

### Integration Tests

```bash
# Run full test suite
npm run test:full
```

## Building for Production

### Backend

```bash
cd backend
pip install pyinstaller
pyinstaller --onefile main.py
```

### Frontend

```bash
cd electron-app
npm run dist
```

## Contributing

### Code Style

- Python: Black formatter, PEP 8 compliance
- JavaScript: Prettier, ESLint configuration
- TypeScript: Strict mode enabled

### Commit Guidelines

```text
feat: add new social intelligence module
fix: resolve database connection issues
docs: update API documentation
style: format code with prettier
refactor: optimize search algorithms
test: add unit tests for people search
```

### Pull Request Process

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Security Considerations

### Data Privacy

- All data processed locally
- No external transmission without explicit consent
- Optional VPN/proxy support
- Encryption at rest for sensitive data

### Rate Limiting

- Respectful API usage
- Configurable request delays
- Automatic retry mechanisms
- Circuit breaker patterns

### Input Validation

- Comprehensive input sanitization
- SQL injection prevention
- XSS protection
- CSRF tokens for state-changing operations

## Performance Optimization

### Backend Performance

- Async/await for I/O operations
- Connection pooling for databases
- Caching for repeated queries
- Background task processing

### Frontend Performance

- React.memo for component optimization
- Virtual scrolling for large datasets
- Lazy loading for route components
- Image optimization and compression

## Troubleshooting

### Common Issues

#### Backend won't start

```bash
# Check Python version
python --version

# Check dependencies
pip list

# Check port availability
netstat -an | grep 8000
```

#### Frontend won't launch

```bash
# Clear node modules
rm -rf node_modules package-lock.json
npm install

# Check Electron
npm run electron --version
```

#### Database errors

```bash
# Reset database
rm backend/database/infoscape.db
python -c "import asyncio; from database.db_manager import DatabaseManager; asyncio.run(DatabaseManager().initialize())"
```

## License

MIT License - see LICENSE file for details

## Support

- GitHub Issues: <https://github.com/ivocreates/InfoScape/issues>
- Documentation: <https://github.com/ivocreates/InfoScape/wiki>
- Email: <support@ivocreates.site>

- GitHub Issues: [https://github.com/ivocreates/InfoScape/issues](https://github.com/ivocreates/InfoScape/issues)
- Documentation: <https://github.com/ivocreates/InfoScape/wiki>
- Email: [support@ivocreates.site](mailto:support@ivocreates.site)
