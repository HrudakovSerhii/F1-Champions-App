workspace/
├── apps/
│ ├── frontend/
│ │ ├── web-app/ # React frontend
│ │ └── mobile-app/ # React Native Mobile App
│ └── backend/
│ ├── api/ # NestJS
│ ├── worker/ # Background workers
│ └── admin-api/ # Admin-specific API
├── libs/ # Shared libraries
│ ├── frontend/
│ │ ├── shared/ # FE shared tools (feature functions based on TS generics to be used across web and native apps)
│ │ └── styles/ # Tailwind Theme used for web and native app
│ ├── backend/
│ │ ├── shared/ # OpenAPI scheme for BE API integration
│ └── shared/
│ │ ├── types/ # Generated API TS types (Partially updated from generation script, partially by hands when arbitrary type needed)
└── scripts/ # Custom scripts
│ ├── types/ # Custom script to generate TS types for API integration on FE, BE and Mobile from OpenAPI scheme
│ └── fonts/ # Custom script to copy fonts for web and native apps sources
