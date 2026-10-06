# Tony Khan Simulator — notes for Claude

- Push updates straight to `main` (no pull requests).
- Every release: bump `VERSION` in `sw.js` and `APP_VERSION` in `index.html` to match (e.g. `aegm-v131` / `v131`), and add any new file to `FILES` in `sw.js`.

## Keep the tutorial current (required for every gameplay change)
The Rookie GM orientation lives in `tutorial.js`. When you change, add or remove a game system:
1. Find the stops whose `sys` tags cover that system and update their text (and `sel` if the screen changed). Add a new stop if a new system is essential to winning.
2. Pull numbers from the game with `tv()` (e.g. `cardMatches`, `SEASON`, `PPVS`, `FAT_OK`, `UPKEEP_AT`, `FTIER`) instead of typing them.
3. If returning players should see the change, bump `TUT_REV` and set that stop's `since` to the new value — they get a short "What's new" replay of just those stops.
4. Update the matching paragraph in `HOWTO` (index.html) and the README.
5. Run `python3 tools/check-tutorial.py` (needs `pip install playwright`). It plays every stop and tip headlessly and must pass. GitHub runs it on every push too.
