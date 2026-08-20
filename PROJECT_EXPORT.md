# PROJECT EXPORT

Generated: Wed Aug 19 03:40:22 PM UTC 2026

============================================================
PROJECT STRUCTURE
============================================================

============================================================
PACKAGE.JSON
============================================================
{
  "name": "workspace",
  "version": "0.0.0",
  "license": "MIT",
  "scripts": {
    "preinstall": "sh -c 'rm -f package-lock.json yarn.lock; case \"$npm_config_user_agent\" in pnpm/*) ;; *) echo \"Use pnpm instead\" >&2; exit 1 ;; esac'",
    "build": "pnpm run typecheck && pnpm -r --if-present run build",
    "typecheck:libs": "tsc --build",
    "typecheck": "pnpm run typecheck:libs && pnpm -r --filter \"./artifacts/**\" --filter \"./scripts\" --if-present run typecheck"
  },
  "private": true,
  "dependencies": {
    "@replit/connectors-sdk": "^0.4.1"
  },
  "devDependencies": {
    "prettier": "^3.9.6",
    "typescript": "~5.9.3"
  }
}

============================================================
TSCONFIG
============================================================
{
  "extends": "./tsconfig.base.json",
  "compileOnSave": false,
  "files": [],
  "references": [
    {
      "path": "./lib/db"
    },
    {
      "path": "./lib/api-client-react"
    },
    {
      "path": "./lib/api-zod"
    }
  ]
}

============================================================
VITE CONFIG
============================================================

============================================================
SOURCE FILES
============================================================

============================================================
EXPORT COMPLETE
============================================================
