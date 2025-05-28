# Backend Scripts

## Seed Generator

The `generate-seed.ts` script generates database seed files from mock data with full TypeScript type safety using the shared `@f1-app/api-types` library.

### ✅ Type Resolution Success

This script now successfully uses the official API types from the shared types library:

- `Driver`, `Constructor`, `Circuit` types are imported directly from `@f1-app/api-types`
- Full type safety and alignment with API specifications
- CommonJS-compatible types library build

### Usage

```bash
# Run with proper type resolution
npx ts-node --project scripts/tsconfig.json scripts/generate-seed.ts [format] [output-path]

# Examples
npx ts-node --project scripts/tsconfig.json scripts/generate-seed.ts json
npx ts-node --project scripts/tsconfig.json scripts/generate-seed.ts prisma
npx ts-node --project scripts/tsconfig.json scripts/generate-seed.ts mongodb
```

### Supported Formats

- **json**: JSON seed file for general use
- **prisma**: TypeScript seed script for Prisma ORM
- **mongodb**: JavaScript seed script for MongoDB shell

### Type Configuration

The script uses a dedicated `scripts/tsconfig.json` that:

- Maps `@f1-app/api-types` to the built CommonJS types
- Uses CommonJS module system for compatibility
- Provides proper path resolution for the types library

### Generated Data

The script extracts and generates:

- **Drivers**: 2 drivers (Max Verstappen, Lewis Hamilton)
- **Constructors**: 2 constructors (Red Bull, Mercedes)
- **Circuits**: 2 circuits (Bahrain, Jeddah)
- **Season Champions**: 4 champions (2020-2023)
- **Race Winners**: 2 race winners
- **Seasons**: 6 seasons

All data is properly typed according to the API specifications. 
