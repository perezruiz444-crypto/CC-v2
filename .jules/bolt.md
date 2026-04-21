## 2025-02-12 - Array generation in React renders
**Learning:** `Array.from({ length }).map()` generates unnecessary garbage collection overhead and allocates new arrays on every render. The `Calendario` and `Demo` components are doing this right inside their render paths. Memory indicates a strong preference for standard `for` loops inside `useMemo` for this specific codebase.
**Action:** Replace inline `Array.from` calls with `useMemo` hooks using a standard `for` loop to build arrays, then map over them.
