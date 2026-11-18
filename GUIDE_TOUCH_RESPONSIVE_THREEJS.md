# Guide: Implementing Touch Controls & Responsive Layouts in Three.js

This guide documents the fixes and architecture applied to **K.D. Dilini's 3D Walkable Nature Portfolio**.

---

## 1. Root Causes Fixed in the Original Project

1. **Inverted / Glitched Camera-Relative Movement**:
   - At startup (`yaw = 0`), the camera offset subtracted along `-Z` while `cameraActual` started at `+Z`, swinging the camera across the island and inverting left/right (`A`/`D`) movement.
   - **Fix**: Position the camera at `playerPos + (sin(yaw), height, cos(yaw))` and project movement onto true camera XZ basis vectors (`forward = (-sin(yaw), -cos(yaw))`, `right = (cos(yaw), -sin(yaw))`).
2. **Stuck Movement Keys & Stale `E` Interact Closure**:
   - `handleKeyDown` read a stale `nearbyPoiState` inside `useEffect(..., [])`, and `keyup` never fired when opening a modal or losing window focus (`Alt+Tab`).
   - **Fix**: Track physical `KeyboardEvent.code`, clear `keysDown` on `window.blur`, `visibilitychange`, and modal open states, call `e.preventDefault()` on Arrow/Space keys, and read `nearbyPoiRef.current`.
3. **Unclamped Frame Delta & Terrain Height Mismatch**:
   - Switching browser tabs caused huge `clock.getDelta()` spikes, launching the avatar to the island edge.
   - **Fix**: Clamp `delta = Math.min(clock.getDelta(), 0.05)` and share one `getTerrainHeight(x, z)` function between geometry vertices, landmarks, and player physics.
4. **Mobile Viewport Cropping (`100vh`) & Narrow Portrait FOV**:
   - `h-screen` (`100vh`) overflows behind mobile Safari/Chrome address bars, and fixed `fov = 52` crops landmarks off the sides on narrow portrait screens.
   - **Fix**: Use `h-[100dvh]`, `env(safe-area-inset-*)`, `ResizeObserver`, and `getResponsiveCameraConfig(aspect)` to widen vertical FOV (up to `70°`) and pull back camera distance on portrait screens.

---

## 2. Implementing Touch Controls (Unified Pointer Events)

### A. Virtual Analog Thumb Joystick (`src/components/world/TouchControls.tsx`)
- Bind `onPointerDown`, `onPointerMove`, `onPointerUp`, `onPointerCancel`, and `onLostPointerCapture` on the joystick ring with `touch-none`.
- Call `e.currentTarget.setPointerCapture(e.pointerId)` so dragging outside the circle continues tracking cleanly.
- Normalize `(dx, dy)` within `maxRadius`, apply a `12%` deadzone to prevent thumb-rest drift, and write `{ x, y }` to a mutable `useRef` (zero React re-renders per frame).

### B. Single-Finger Orbit, Two-Finger Pinch Zoom, & Tap-to-Interact
- Track active pointers in `Map<pointerId, { x, y }>` on `renderer.domElement` (with `touchAction = 'none'`):
  - **1 pointer**: orbit `cameraOrbitYaw` and `cameraOrbitPitch`.
  - **2 pointers**: measure Euclidean distance delta between pointers to adjust `cameraZoomTarget` (`0.72`–`1.45`).
  - **Short tap (`totalDragDist < 9px`)**: raycast against invisible Layer-1 cylinder proxies (`poiHitboxes`) to either inspect a nearby landmark or teleport smoothly toward it.

---

## 3. Responsive HUD, Modals, & Cute Loading / Error States

- **HUD**: Keep the center 3D viewport unobstructed; use `>= 44x44px` touch targets, horizontally scrollable `snap-x` fast-travel strip, and a collapsible bottom dock.
- **Modals**: Render as full-width bottom sheets on small screens (`rounded-t-3xl sm:rounded-3xl`, `max-h-[92dvh]`) with sticky top close bars (`overscroll-contain touch-pan-y`).
- **Cute Loading & Error Screens**:
  - `CuteLoadingScreen` displays a friendly sprouting leaf spirit and tracks real setup stages (`12% → 100%`) before `renderer.compile()`.
  - `CuteErrorScreen` + `SanctuaryErrorBoundary` handle unsupported WebGL, `webglcontextlost`, or runtime errors with a "Wake Sanctuary" retry button and a full "Open 2D Portfolio" fallback.
