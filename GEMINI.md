# Gemini CLI Project Context

This repository uses several specific libraries and patterns. Refer to the following documentation when working on the codebase.

## State Management & Lists

- **Legend State (v3):** [LLM Reference](https://www.legendapp.com/open-source/state/v3/llms-full.md)
- **Legend List (v2):** [LLM Reference](https://www.legendapp.com/open-source/list/v2/llms-full.md)

## Database

The project uses a local SQLite database with **Drizzle ORM** for type-safe database interactions.

- **OP-SQLite**: High-performance SQLite driver for React Native
- **Drizzle ORM**: TypeScript ORM for schema definition and queries
- The schema is defined in `db/schema.ts` (TypeScript) and documented in `docs/schema.sql`
- **Important**: Any modifications to the database structure must be reflected in both `db/schema.ts` and `docs/schema.sql`
- Migrations are generated using `bunx drizzle-kit generate` and stored in `drizzle/`

## UI Components

TailwindCSS is implemented using Uniwind. [LLM Reference](https://docs.uniwind.dev/llms-full.txt)
Most UI components are derived from **React Native Reusables**, which brings shadcn/ui patterns to React Native.

- **Documentation:** [https://reactnativereusables.com/docs](https://reactnativereusables.com/docs)
- Components are primarily located in `components/atoms`.
- The `components/molecules` directory contains more complex components that combine multiple atoms, but only when they can stay generic. Otherwise, see below.
- Specific UI components should live inside the proper feature folder in `features/`.

## Project Structure

- `app/`: Expo Router file-based routing.
- `db/`: Drizzle ORM schema and database connection.
- `features/`: Feature-based logic using the Facade pattern and Legend State.
- `repositories/`: Data access layer using Drizzle ORM.
- `portability/`: Abstraction layers for platform-specific handlers (Database, Storage).

You can find the rest in `docs/arch.md`
