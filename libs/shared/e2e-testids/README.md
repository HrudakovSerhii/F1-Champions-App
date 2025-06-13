// @ts-nocheck

# E2E Test IDs Library

A shared library providing centralized test ID management for both Frontend and E2E testing.

## Installation

The library is already configured for internal use within the monorepo.

## Usage

### Frontend (React/Angular)

```typescript

import { TEST_IDS } from '@f1-app/e2e-testids';

<button data - testid = { TEST_IDS.HOME_SCREEN.CHAMPION_CARD.VIEW_DETAILS } >
  View
Details
< /button>
```

### E2E Tests (Playwright)

```typescript
import { TEST_IDS, getDynamicTestId } from '@f1-app/e2e-testids';

test('should display champion cards', async ({ page }) => {
  await page.locator(`[data-testid="${TEST_IDS.HOME_SCREEN.CHAMPIONS_LIST}"]`).waitFor();

  // Dynamic test IDs
  const dynamicId = getDynamicTestId(TEST_IDS.HOME_SCREEN.CHAMPION_CARD.CONTAINER, { index: 0 });
  await page.locator(`[data-testid="${dynamicId}"]`).click();
});
```

## Architecture

### Screen-Based Organization

Test IDs are organized by screens/pages for better maintainability:

- `HOME_SCREEN` - Main landing page
- `CHAMPION_DETAILS_SCREEN` - Individual champion page
- `SEASONS_SCREEN` - Seasons overview
- `SEASON_DETAILS_SCREEN` - Season details
- `COMMON` - Reusable components

### Helper Functions

- `getDynamicTestId()` - Generate IDs with parameters
- `getListItemTestId()` - Generate IDs for list items
- `getFormFieldTestId()` - Generate IDs for form fields
- `validateTestId()` - Validate test ID format

## Benefits

✅ **Centralized Management** - Single source of truth  
✅ **Type Safety** - Full TypeScript support  
✅ **Cross-Team Collaboration** - Shared between FE and QA  
✅ **Screen-Based Organization** - Predictable structure  
✅ **Helper Functions** - Dynamic ID generation  
✅ **Validation** - Built-in format checking
