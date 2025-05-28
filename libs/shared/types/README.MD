# F1 Champions App - Backend Shared Library

This library contains shared TypeScript types generated from the OpenAPI schema, serving as the single source of truth
for API contracts across the entire application.

## 🎯 Purpose

- **Single Source of Truth**: All API types are generated from the OpenAPI schema
- **Type Safety**: Ensures FE and BE always are aligned with API specification
- **Developer Experience**: Organized namespaces for easy type discovery
- **Automation**: Automatic type generation eliminates manual type maintenance

## 📁 Structure

```
libs/shared/types/
├── src/
│   ├── lib/
│   │   ├── openapi-schema.yaml      # OpenAPI specification (source of truth)
│   │   └── generated-types.ts       # Generated TypeScript types
│   │   └── types.ts                 # Derived API contract TypeScript types
│   └── index.ts                     # Library exports
├── scripts/
│   └── generate-types.sh            # Type generation script
└── README.md                        # This file
```

## 🚀 Quick Start

### For New Developers

```bash
# Clone repo and initialize
git clone <repo>
npm run web-app:init  # → npm install && npm run generate-types
```

### Regenerate Types After Schema Changes

```bash
npm run generate-types
```

## 🏗️ Type Organization

### Core Exports (Always in Sync)

- **`paths`** - Complete API path definitions with parameters and responses
- **`components`** - All schema components (Driver, Constructor, etc.)
- **`webhooks`** - Webhook definitions (if any)

## 🔧 Development Workflow

### 1. Update API Schema

```bash
# Edit the OpenAPI schema
vim libs/shared/types/src/lib/openapi-schema.yaml
```

### 2. Regenerate Types

```bash
npm run generate-types
```

### 3. Use in Code

```typescript
// Types are automatically updated across FE and BE
import type { components } from '@f1-champions-app/backend-shared';

type Champion = components['schemas']['SeasonChampion'];
```

## 📋 Script Details

The `generate-types.sh` script performs:

1. **Environment Validation** - Checks workspace structure
2. **Dependency Management** - Auto-installs `openapi-typescript` if needed
3. **Schema Validation** - Validates YAML syntax (if `yq` available)
4. **Type Generation** - Generates TypeScript from OpenAPI schema
5. **Post-Processing** - Adds custom headers and organized exports
6. **Library Updates** - Updates export files
7. **Validation** - Checks generated TypeScript validity

### Script Features

- ✅ Colored output for better UX
- ✅ Error handling and cleanup
- ✅ Detailed logging
- ✅ Usage instructions
- ✅ Automatic dependency installation

## 🎨 Generated Type Features

### Schema-Driven Types (Always in Sync)

```typescript
// Instead of manually maintained convenience types
import { Champions } from './some-stale-types';

// Use schema-driven types that auto-update
import type { components } from '@f1-champions-app/backend-shared';

type ChampionsResponse = components['schemas']['SeasonChampionsResponse'];
const response: ChampionsResponse =
...
;
```

## 🔄 Maintenance

### When to Regenerate Types

- After OpenAPI schema changes
- Before deploying API changes
- When setting up new development environment

### Troubleshooting

```bash
# If generation fails, check:
1. OpenAPI schema syntax (use online validator)
2. Dependencies installed (npm list openapi-typescript)
3. File permissions (chmod +x scripts/generate-types.sh)
4. Run from workspace root
```

## 📚 Related Documentation

- [OpenAPI Schema](./src/lib/openapi-schema.yaml) - API specification
- [Generated Types](./src/lib/generated-types.ts) - TypeScript definitions
- [Workspace Scripts](../../scripts/) - Build and generation scripts

---

**Note**: This library is un-deployable and used only for development-time type sharing. The generated types serve as
the contract between frontend and backend applications.
