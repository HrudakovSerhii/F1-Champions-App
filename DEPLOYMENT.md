# Deployment Strategy for F1 Champions App Monorepo

## Overview

This monorepo uses a sophisticated deployment strategy that leverages Nx's affected builds and GitHub Actions to deploy only the applications that have changed. **You don't need separate branches** - the system intelligently detects which apps need to be built and deployed.

## Deployment Workflows

### 1. **Main CI/CD Pipeline** (`ci-cd.yml`)

- **Triggers**: Push to `main`/`develop`, PRs, manual dispatch
- **Features**:
  - Uses Nx affected to build only changed apps
  - Runs tests and linting for affected projects
  - Deploys to different environments based on branch
  - Supports manual override to build all apps

### 2. **Individual App Workflows**

- `deploy-web-app.yml` - Web app to GitHub Pages
- `deploy-backend.yml` - Backend API deployment
- `deploy-mobile.yml` - Mobile app builds and distribution

## Deployment Strategies (No Separate Branches Required!)

### Option 1: **Path-Based Triggers** ⭐ (Recommended)

```yaml
on:
  push:
    branches: [ main ]
    paths:
      - 'apps/frontend/web-app/**'
      - 'libs/**'
```

- Workflows trigger only when specific paths change
- Most efficient for CI/CD resources
- Clear separation of concerns

### Option 2: **Nx Affected Builds** ⭐ (Recommended)

```bash
npx nx affected --target=build --base=origin/main --head=HEAD
```

- Nx automatically detects which projects are affected by changes
- Builds only what's necessary
- Handles dependency graphs automatically

### Option 3: **Environment-Based Deployment**

- `main` branch → Production
- `develop` branch → Staging
- Feature branches → Preview deployments

### Option 4: **Manual Workflow Dispatch**

- Trigger deployments manually with parameters
- Choose specific apps to deploy
- Override automatic detection

## Current Workflow Structure

```
.github/workflows/
├── ci-cd.yml              # Main pipeline with Nx affected
├── deploy-web-app.yml     # Web app specific deployment
├── deploy-backend.yml     # Backend API deployment
├── deploy-mobile.yml      # Mobile app deployment
├── deploy.yml             # Legacy (manual only)
└── web-app-deploy.yml     # Original web app deployment
```

## Environment Setup

### Web App (Frontend)

- **Staging**: Automatic on `develop` branch
- **Production**: Automatic on `main` branch (GitHub Pages)
- **Preview**: Manual dispatch or PR previews

### Backend API

- **Staging**: Automatic on `develop` branch
- **Production**: Manual approval required on `main` branch
- **Local**: `npm run dev:backend`

### Mobile App

- **Development**: Local builds and simulators
- **Staging**: Firebase App Distribution / TestFlight
- **Production**: App Store / Google Play Store

## Nx Affected Commands

```bash
# See what's affected
npx nx show projects --affected --base=origin/main --head=HEAD

# Build affected apps
npx nx affected --target=build --base=origin/main --head=HEAD

# Test affected apps
npx nx affected --target=test --base=origin/main --head=HEAD

# Lint affected apps
npx nx affected --target=lint --base=origin/main --head=HEAD
```

## Deployment Targets by App

### Web App (`web-app`)

```bash
# Local development
npm run dev:web-app

# Build for production
npm run build:web-app

# Deploy to GitHub Pages (automatic on main)
```

### Backend (`@f1-champions-app/backend`)

```bash
# Local development
npm run dev:backend

# Build for production
npm run build:backend

# Deploy (configure your target platform)
```

### Mobile App (`@f1-mobile/f1-mobile`)

```bash
# Local development
npx nx start @f1-mobile/f1-mobile

# Build Android
npx nx build-android @f1-mobile/f1-mobile

# Build iOS (macOS only)
npx nx build-ios @f1-mobile/f1-mobile
```

## Adding New Applications

When you add a new application to your monorepo:

1. **Update CI/CD Pipeline** (`ci-cd.yml`):
   ```yaml
   # Add to affected detection
   echo "has-new-app=$(echo "$AFFECTED" | grep -q "new-app" && echo "true" || echo "false")" >> $GITHUB_OUTPUT
   
   # Add build job
   build-new-app:
     needs: [setup, lint-and-test]
     if: needs.setup.outputs.has-new-app == 'true'
   ```

2. **Create Dedicated Workflow** (optional):
   ```yaml
   # .github/workflows/deploy-new-app.yml
   on:
     push:
       paths:
         - 'apps/path/to/new-app/**'
   ```

3. **Update Package Scripts**:
   ```json
   {
     "scripts": {
       "dev:new-app": "npx nx serve new-app",
       "build:new-app": "npx nx build new-app"
     }
   }
   ```

## Best Practices

### 1. **Use Nx Affected**

- Always prefer `nx affected` over building everything
- Saves CI/CD time and resources
- Automatically handles dependency changes

### 2. **Environment Separation**

- Use different branches for different environments
- `main` → Production
- `develop` → Staging
- Feature branches → Preview

### 3. **Manual Overrides**

- Always provide `workflow_dispatch` for manual deployments
- Include parameters for flexibility
- Add force options for emergency deployments

### 4. **Artifact Management**

- Upload build artifacts for reuse
- Set appropriate retention periods
- Use unique names with commit SHA

### 5. **Security**

- Use environment protection rules
- Require approvals for production deployments
- Store secrets in GitHub Secrets

## Deployment Platforms

### Recommended Platforms by App Type:

**Web Apps:**

- GitHub Pages (current)
- Vercel
- Netlify
- AWS S3 + CloudFront

**Backend APIs:**

- Railway
- Render
- Heroku
- AWS ECS/Fargate
- Google Cloud Run

**Mobile Apps:**

- Firebase App Distribution (testing)
- TestFlight (iOS testing)
- App Store Connect (iOS production)
- Google Play Console (Android)

## Troubleshooting

### Common Issues:

1. **Nx affected not detecting changes**
   ```bash
   # Check base comparison
   npx nx show projects --affected --base=origin/main --head=HEAD --verbose
   ```

2. **Build failures**
   ```bash
   # Test locally first
   npx nx build app-name
   npx nx test app-name
   ```

3. **Deployment conflicts**
  - Check concurrency groups in workflows
  - Ensure unique artifact names
  - Verify environment protection rules

## Next Steps

1. **Configure your deployment targets** in the workflow files
2. **Set up environment secrets** in GitHub repository settings
3. **Test the workflows** with small changes to each app
4. **Add environment protection rules** for production deployments
5. **Consider adding preview deployments** for pull requests

This setup gives you maximum flexibility without requiring separate branches, while leveraging Nx's powerful affected build system to optimize your CI/CD pipeline. 
