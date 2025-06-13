# F1 Champions App - E2E Test Suite

## 🚀 Quick Start

### Prerequisites

1. Start the applications:
   ```bash
   npm run serve:web-app    # Frontend (:3000)
   npm run serve:backend    # Backend (:4000)
   ```

2. Install Playwright browsers:
   ```bash
   npm run e2e:install
   ```

### Run Tests

```bash
# Run all E2E tests
npm run e2e

# Interactive & Debug
npm run e2e:ui           # Open Playwright UI
npm run e2e:headed       # Run with visible browser
npm run e2e:debug        # Debug mode

# Browser-specific
npm run e2e:chrome       # Chrome only
npm run e2e:firefox      # Firefox only  
npm run e2e:safari       # Safari/WebKit only

# Specialized
npm run e2e:api          # API tests only
npm run e2e:mobile       # Mobile tests only

# Utilities
npm run e2e:report       # View test report
npm run e2e:install      # Install browsers
```

## 📁 Structure

- `src/tests/ui/` - User interface tests
- `src/tests/api/` - API endpoint tests
- `src/pages/` - Page object models
- `src/utils/` - Test utilities and setup

## 📖 Documentation

See [TEST_DOCUMENTATION.md](./TEST_DOCUMENTATION.md) for comprehensive test coverage and details.

## 🎯 Coverage

- ✅ **UI Tests**: Home page, navigation, responsiveness
- ✅ **API Tests**: Champions, race winners, health checks
- ✅ **Cross-browser**: Chrome, Firefox, Safari, Mobile
- ✅ **Performance**: Response time validation
- ✅ **Error Handling**: Invalid inputs, edge cases

## 🔧 Configuration

Tests use environment variables:

- `BASE_URL`: Frontend URL (default: http://localhost:3000)
- `API_BASE_URL`: Backend API URL (default: http://localhost:4000/api/v1)

---

*Part of the F1 Champions App monorepo - comprehensive E2E testing for both UI and API* 
