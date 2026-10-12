# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

This is the source for `panchev68.github.io`, a GitHub Pages site. There is **no build system, package manager, linter, or test suite anywhere in this repo** — pages are served as static files exactly as committed. Nothing here needs to be "built"; changes take effect simply by being committed/pushed (GitHub Pages serves `main` directly).

The repo has two very different kinds of content:

1. **Generated documentation (read-only reference material)** — `Lib/`, `IARProjectConnector/`, `Project/*/`, `Native/soes.3.1.0/`, and parts of `doc/` are Doxygen-generated HTML output for various IAR/STM32 embedded C++ firmware projects, plus `pdf/` holds datasheets/reference PDFs. These are build artifacts checked into the repo for hosting, not source to edit. There is no corresponding source tree for them in this repository — don't try to find or modify the C++ sources here.
2. **Active development** — `Games/LittleBigSnike/` is the only directory with hand-written logic. All real work happens there.

## Games/LittleBigSnike — Tampermonkey userscripts

This folder contains standalone Tampermonkey userscripts for `https://littlebigsnake.com` (an io-style multiplayer snake game running on Unity WebGL). Each `.js` file is a self-contained userscript with a `// ==UserScript==` header — there is no bundler, no shared module system, and no `npm install`. Scripts are installed directly into Tampermonkey and loaded by the browser per their `@match` rule.

Current scripts:
- `MousePointer.js` — draws a custom cursor + direction line overlay (`#mouse-pointer`, `#direction-line-canvas`), with an optional visual-only "clamp" circle that limits the overlay (not the real cursor) to a radius around screen center.
- `AutoEmote.js` — detects sharp mouse-direction changes / full-circle gestures and fires the game's emote keys automatically.
- `GraphicsQuality.js` — lowers render resolution via a `devicePixelRatio` override to improve performance.
- `SkipVideoAds.js` — auto-skips in-game video ads.

### Critical workflow gotcha: Tampermonkey caching

Editing a `.js` file on disk does **not** reliably make Tampermonkey reload it. **Always bump the `@version` header on every edit**, then reinstall/update the script in the Tampermonkey dashboard and hard-refresh the game page (Ctrl+F5) before testing. If a change appears to do "nothing", suspect a stale script in the browser before suspecting the code — this has repeatedly been the actual cause of "it's not working" reports.

### There is no automated testing

All verification happens manually, live, in a real match on littlebigsnake.com. When diagnosing game behavior that isn't understood yet, write a small throw-away diagnostic snippet for the user to paste into the DevTools console (rather than guessing blindly at selectors/behavior), and have them report back the console output.

### Cross-script conventions

- Scripts coordinate loosely through `window.__lbs*` globals and shared `localStorage` keys prefixed `lbs_*` (e.g. `lbs_mouse_clamp`, `lbs_auto_emote`, `lbs_gfx_low_enabled`). Keep new scripts consistent with this naming.
- Overlay canvases created by `MousePointer.js` use fixed ids (`trail-canvas`, `direction-line-canvas`); other scripts that enumerate `<canvas>` elements on the page must exclude these to avoid mistaking the overlay for the game's own canvas.
- On-screen status indicators (small fixed-position `div`s showing ON/OFF + current value) are a shared UI pattern across scripts, stacked at different `top` offsets to avoid overlapping.
- Scripts that listen for `keydown`/`wheel` on `window` should check `e.isTrusted` when another script's synthetic events could otherwise be misinterpreted as real input (see below).

### Known hard limits (discovered through extensive live testing — don't re-attempt these)

- **The game's Unity WebGL canvas ignores synthetic/untrusted DOM events.** Dispatching `MouseEvent`/`WheelEvent` via JS to fake mouse movement or scroll (for a real in-game zoom or turn-speed hack) has been tried multiple ways (faking `window.innerWidth`/`innerHeight`, scaling the canvas via CSS transform, dispatching synthetic `wheel` events) and none affect actual gameplay — the canvas input path appears to require real/trusted browser events.
- **Plain HTML UI elements do respond to synthetic events**, since they aren't `isTrusted`-filtered. This is why `AutoEmote.js` works by dispatching synthetic `keydown`/`keypress`/`keyup` for the digit keys and/or clicking DOM emote buttons, even though the equivalent trick fails for canvas-level camera/zoom control.
- **To reduce render quality/resolution, override `window.devicePixelRatio`, not `canvas.width`/`canvas.height` directly.** Unity derives both the framebuffer size and the camera/viewport math from `devicePixelRatio` consistently, so overriding it is safe. Patching the canvas's `width`/`height` attributes directly desyncs the two and makes the game render only a small cropped corner of the scene stretched across the screen.
