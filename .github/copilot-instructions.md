<!-- Copilot Instructions for Mascle Project -->

## Project Overview
- **Name**: Mascle - 筋トレ記録 & カロリー計算アプリ
- **Architecture**: Clean Architecture (DDD) with Monorepo
- **Backend**: Node.js + Express + TypeScript + SQLite (better-sqlite3)
- **Frontend**: React + TypeScript + Vite + TailwindCSS

## Architecture Layers (Backend)
- **Domain**: Entities (Exercise, WorkoutSet, WorkoutSession), Value Objects (UniqueId, METValue), Repository Interfaces, Domain Services
- **Application**: Use Cases, DTOs, Mappers
- **Infrastructure**: SQLite Repository Implementations, DB Connection, DI Container, Seed Data
- **Presentation**: Express Controllers, Routes

## Key Conventions
- Use `.js` extensions in import paths (ESM)
- Clean Architecture: dependencies point inward (Domain ← Application ← Infrastructure/Presentation)
- All repository methods are async
- MET-based calorie calculation: `MET × weight(kg) × hours × 1.05`
- Japanese UI with English code identifiers

## Development Commands
```bash
npm install          # Install all dependencies
npm run dev          # Start both backend and frontend
npm run dev:backend  # Backend only on port 3001
npm run dev:frontend # Frontend only on port 5173
```
