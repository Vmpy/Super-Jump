# AGENTS.md — SuperJump

## Repo Type

Zero-dependency browser game. No build tools, no npm, no bundler.

## Running / Verifying

- Open `index.html` directly in a browser (double-click works).
- Or serve via any static server: `python -m http.server 8000` or `npx http-server`.
- No transpilation or build step exists.

## Architecture

- **Module pattern**: Every JS file wraps its exports in an IIFE and assigns to a global singleton (`const Utils = (function () { ... })();`).
- **Dependency order matters**: `index.html` loads scripts sequentially. `utils.js` must come first; `game.js` depends on nearly everything. Do not reorder `<script>` tags without checking cross-file references.
- **Global singletons**: `Utils`, `Input`, `AudioManager`, `Particles`, `Player`, `Platforms`, `Items`, `Obstacles`, `Background`, `Camera`, `Renderer`, `Game`.

## Coordinate System

- Fixed logical resolution: **400 × 600**.
- `renderer.js` scales the Canvas via `ctx.setTransform(scale, 0, 0, scale, 0, 0)` so that all other code draws in 400×600 logic coords regardless of actual pixel size.
- Do not use `canvas.width` / `canvas.height` for gameplay math; use `LOGICAL_WIDTH` / `LOGICAL_HEIGHT` from `game.js`.

## Adding New Entities

- **No image files**: All art is drawn dynamically on Canvas. New sprites require a `drawXxx(ctx, cx, cy)` function inside the relevant module (see `items.js` or `obstacles.js` for patterns).
- **No audio files**: `audio.js` synthesizes all sounds via Web Audio API `OscillatorNode`.
- **Props**: Add new types to `items.js` switch statements and collision handler. Add draw function alongside existing `drawSpring`, `drawRocket`, etc.
- **Platforms**: Add to `platforms.js` switch/case in both `draw()` and `checkCollisions()`. Update `weightedRandom()` call in `generateOne()`.
- **Monsters**: Add to `obstacles.js` `Obstacle` class. Update spawn weights in `spawn()`. Add draw function alongside `drawUFO`, `drawMonster`.

## Audio Gotcha

- `AudioManager.init()` creates `AudioContext`. Browsers block this until a user gesture (keydown / click). Game calls it lazily on first input in `game.js`.
- If you add audio from a non-input context, it will silently fail.

## Collision Rules

- `Utils.checkAABB()` is the generic rect-rect test.
- Platform collision (`Utils.checkPlatformCollision`) is **not** strict AABB. It has a ~15px bottom tolerance to prevent fast-fall tunnelling. Do not tighten it without testing high-velocity jumps.

## Data Persistence

- `localStorage` key is exactly `superjump_highscore`. Changing it breaks existing saved scores.

## No Test Framework

- There are no automated tests. Verify behavior by opening `index.html` in a browser.
