#!/bin/bash

# =============================================================================
# F1 Champions App - Test IDs Generator
# =============================================================================
# This script generates TypeScript types for test IDs from the source files
# located in libs/shared/e2e-testids
#
# Usage: npm run generate-testids
# Or directly: ./scripts/generate-testids.sh
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TESTIDS_DIR="libs/shared/e2e-testids"
OUTPUT_DIR="dist/libs/shared/e2e-testids"

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

# Check if testids directory exists
if [ ! -d "$TESTIDS_DIR" ]; then
    log_error "Test IDs directory not found at: $TESTIDS_DIR"
    exit 1
fi

log_success "Environment validation passed"

# =============================================================================
# Step 2: Generate Test IDs
# =============================================================================

log_info "🔧 Generating Test IDs..."

# Run TypeScript compiler
cd "$TESTIDS_DIR" && tsc -p tsconfig.lib.json

if [ $? -ne 0 ]; then
    log_error "Failed to generate Test IDs"
    exit 1
fi

log_success "Test IDs generated successfully"

# =============================================================================
# Step 3: Summary and Usage Instructions
# =============================================================================

echo ""
echo "🎉 Test IDs generation completed successfully!"
echo ""
echo "📁 Generated files in: $OUTPUT_DIR"
echo "🔄 To regenerate Test IDs:"
echo "   npm run generate-testids"
echo ""

log_success "All done! 🏎️" 