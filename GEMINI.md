# Gemini CLI Project Context

This repository uses several specific libraries and patterns. Refer to the following documentation when working on the codebase.

## State Management & Lists

- **Legend State (v3):** [LLM Reference](https://www.legendapp.com/open-source/state/v3/llms-full.md)
- **Legend List (v2):** [LLM Reference](https://www.legendapp.com/open-source/list/v2/llms-full.md)

## Database

The project uses a local SQLite database.

- The schema is defined and documented in `docs/schema.sql`.
- **Important:** Any modifications to the database structure must be reflected in `docs/schema.sql`.

## UI Components

Most UI components are derived from **React Native Reusables**, which brings shadcn/ui patterns to React Native.

- **Documentation:** [https://reactnativereusables.com/docs](https://reactnativereusables.com/docs)
- Components are primarily located in `components/atoms`.

## Project Structure

- `app/`: Expo Router file-based routing.
- `features/`: Feature-based logic using the Facade pattern and Legend State.
- `repositories/`: Data access layer for the SQLite database.
- `portability/`: Abstraction layers for platform-specific handlers (Database, Storage).

You can find the rest in `docs/arch.md`
