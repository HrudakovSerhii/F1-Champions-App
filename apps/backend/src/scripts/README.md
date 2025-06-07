# Backend Scripts

## Seed Generator

The `generate-seed.ts` script generates database seed files from mock data with full TypeScript type safety using the shared `@f1-app/api-types` library.

### ✅ Type Resolution Success

This script now successfully uses the official API types from the shared types library:

- `Driver`, `Constructor` types are imported directly from `@f1-app/api-types`
- Full type safety and alignment with API specifications
- CommonJS-compatible types library build

### Usage

```bash
# Run with proper type resolution
npx ts-node --project src/scripts/tsconfig.json src/scripts/generate-seed.ts

# Or use npm scripts (from project root)
npm run db:seed:generate
```

### Type Configuration

The script uses a dedicated `src/scripts/tsconfig.json` that:

- Maps `@f1-app/api-types` to the built CommonJS types
- Uses Node19 module system for compatibility
- Provides proper path resolution for the types library

### Generated Data

The script extracts and generates:

- **Drivers**: 2 drivers (Max Verstappen, Lewis Hamilton)
- **Constructors**: 2 constructors (Red Bull, Mercedes)
- **Season Winners**: 4 champions (2020-2023)
- **Season Race Winners**: 2 race winners

All data is properly typed according to the API specifications. 
