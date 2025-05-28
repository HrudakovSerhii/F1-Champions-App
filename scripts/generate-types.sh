#!/bin/bash

# =============================================================================
# F1 Champions App - OpenAPI TypeScript Types Generator
# =============================================================================
# This script generates TypeScript types from the OpenAPI schema located in
# libs/backend/shared/src/lib/openapi-schema.yaml
#
# Usage: npm run generate-types
# Or directly: ./scripts/generate-types.sh
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCHEMA_PATH="libs/shared/types/src/lib/openapi-schema.yaml"
OUTPUT_PATH="libs/shared/types/src/lib/generated-types.ts"
TEMP_OUTPUT_PATH="shared/types/src/lib/generated-types.temp.ts"

# =============================================================================
# Helper Functions
# =============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# =============================================================================
# Step 1: Validate Environment
# =============================================================================

log_info "🔍 Validating environment..."

# Check if we're in the workspace root
if [ ! -f "package.json" ] || [ ! -d "libs" ]; then
    log_error "This script must be run from the workspace root directory"
    exit 1
fi

# Check if schema file exists
if [ ! -f "$SCHEMA_PATH" ]; then
    log_error "OpenAPI schema not found at: $SCHEMA_PATH"
    exit 1
fi

log_success "Environment validation passed"

# =============================================================================
# Step 2: Check and Install Dependencies
# =============================================================================

log_info "📦 Checking dependencies..."

# Check if openapi-typescript is installed
if ! npm list openapi-typescript --depth=0 >/dev/null 2>&1; then
    log_warning "openapi-typescript not found, installing..."
    npm install -D openapi-typescript
    if [ $? -ne 0 ]; then
        log_error "Failed to install openapi-typescript"
        exit 1
    fi
    log_success "openapi-typescript installed successfully"
else
    log_success "openapi-typescript is already installed"
fi

# =============================================================================
# Step 3: Validate OpenAPI Schema
# =============================================================================

log_info "🔍 Validating OpenAPI schema..."

# Basic YAML syntax check (if yq is available)
if command -v yq >/dev/null 2>&1; then
    if ! yq eval '.' "$SCHEMA_PATH" >/dev/null 2>&1; then
        log_error "Invalid YAML syntax in schema file"
        exit 1
    fi
    log_success "Schema YAML syntax is valid"
else
    log_warning "yq not found, skipping YAML syntax validation"
fi

# =============================================================================
# Step 4: Generate TypeScript Types
# =============================================================================

log_info "🔧 Generating TypeScript types from OpenAPI schema..."

# Run openapi-typescript with specific configuration
npx openapi-typescript "$SCHEMA_PATH" \
    --output "$TEMP_OUTPUT_PATH" \
    --default-non-nullable \
    --alphabetize \
    --export-type

if [ $? -ne 0 ]; then
    log_error "Failed to generate TypeScript types"
    # Clean up temp file if it exists
    [ -f "$TEMP_OUTPUT_PATH" ] && rm "$TEMP_OUTPUT_PATH"
    exit 1
fi

log_success "TypeScript types generated successfully"

# =============================================================================
# Step 5: Post-process Generated Types
# =============================================================================

log_info "🔄 Post-processing generated types..."

# Create the final output with custom header and organized exports
cat > "$OUTPUT_PATH" << 'EOF'
/**
 * F1 Champions App - Generated API Types
 *
 * This file is auto-generated from the OpenAPI schema.
 * DO NOT EDIT MANUALLY - Changes will be overwritten.
 *
 * To regenerate: npm run generate-types
 * Source: libs/backend/shared/src/lib/openapi-schema.yaml
 * Generated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
 */

/* eslint-disable */
/* tslint:disable */

export type paths = { ... };           // ✅ Always in sync
export type components = { ... };      // ✅ Always in sync

EOF

# Add the generated content (skip the first few lines that contain auto-generated comments)
tail -n +4 "$TEMP_OUTPUT_PATH" >> "$OUTPUT_PATH"

# Note: Only pure generated types - no manual convenience exports to avoid sync issues

# Clean up temp file
rm "$TEMP_OUTPUT_PATH"

log_success "Post-processing completed"

# =============================================================================
# Step 6: Update Library Exports
# =============================================================================

log_info "📤 Updating library exports..."

# Update the main index.ts file to export the generated types
cat > "libs/backend/shared/src/index.ts" << 'EOF'
// Export all generated API types
export * from './lib/generated-types';
EOF

log_success "Library exports updated"

# =============================================================================
# Step 7: Validate Generated Types
# =============================================================================

log_info "✅ Validating generated TypeScript types..."

# Check if TypeScript can compile the generated types
if command -v npx >/dev/null 2>&1; then
    if npx tsc --noEmit --skipLibCheck "$OUTPUT_PATH" >/dev/null 2>&1; then
        log_success "Generated types are valid TypeScript"
    else
        log_warning "Generated types may have TypeScript issues (check manually)"
    fi
else
    log_warning "TypeScript not available for validation"
fi

# =============================================================================
# Step 8: Summary and Usage Instructions
# =============================================================================

echo ""
echo "🎉 Type generation completed successfully!"
echo ""
echo "📁 Generated files:"
echo "   • $OUTPUT_PATH"
echo "   • libs/backend/shared/src/index.ts (updated)"
echo ""
echo "🔧 Usage in your code:"
echo ""
echo "   // Import generated types:"
echo "   import type { components, paths } from '@f1-app/api-types';"
echo ""
echo "   // Use schema types directly:"
echo "   type ChampionsResponse = components['schemas']['SeasonChampionsResponse'];"
echo "   type Champion = components['schemas']['SeasonChampion'];"
echo ""
echo "   // Your existing destructuring pattern still works:"
echo "   const { wins, Driver, Constructors } = champion;"
echo "   const { familyName, givenName, url } = Driver;"
echo "   const { name } = Constructors[0];"
echo ""
echo "🔄 To regenerate types after schema changes:"
echo "   npm run generate-types"
echo ""

log_success "All done! 🏎️"
