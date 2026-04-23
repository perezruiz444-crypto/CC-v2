## 2025-02-12 - Array generation in React renders
**Learning:** `Array.from({ length }).map()` generates unnecessary garbage collection overhead and allocates new arrays on every render. The `Calendario` and `Demo` components are doing this right inside their render paths. Memory indicates a strong preference for standard `for` loops inside `useMemo` for this specific codebase.
**Action:** Replace inline `Array.from` calls with `useMemo` hooks using a standard `for` loop to build arrays, then map over them.

## 2024-04-21 - Array allocation bottleneck in API data loops
**Learning:** Chained `.filter().length` calls over large datasets (like `vencimientos_calendario` for an entire year) cause unnecessary array allocations ($O(k)$ memory) and redundant CPU cycles ($O(N \cdot k)$ iterations). This is a critical pattern to avoid when dealing with the Supabase API responses which can easily reach thousands of rows.
**Action:** Use single-pass `for` loops or `reduce` functions to iterate through arrays only once when deriving multiple metrics or state summaries, to maintain $O(N)$ speed and zero array allocation memory overhead.
## 2025-02-12 - Replacing Array.prototype methods with classic for loops
**Learning:** Chained array methods (like .filter().length or .filter().slice()) trigger full N traversals and unnecessary allocations. For loops with early breaks or multi-accumulators keep things (N)$ with no hidden array overhead.
**Action:** Stick to single-pass standard for loops instead of elegant-looking chained functional arrays methods.
