# NAVDRISHTI / POLARIS

A procedural 3D Antarctic expedition and navigation intelligence prototype.

## Run

```sh
npm install
npm run dev
```

Open the local address printed by Vite. Use `npm run build` for the production build and `npm run preview` to preview it.

## Experience

- Fourteen connected scroll chapters, driven by GSAP ScrollTrigger and Lenis.
- GPU ocean waves and reflections, procedural icebergs and Antarctic terrain, research vessel, snow, satellite scan, moving routes, and changing atmosphere.
- Guided film playback, chapter navigation, high-fidelity/eco rendering, and reduced-motion support.
- Digital-twin layer controls, orbit/zoom/focus, station selection, accessible command-center dialog, object inspection, route comparison, and five replayable scenario simulations.

The terrain and vessel are generated with geometry. No stock imagery, remote 3D models, or texture downloads are required. Google Fonts supplies optional typography with local fallback fonts.

## Scope

This is an interactive SIH concept prototype, not an operational navigation system. Satellite readings, iceberg velocities, station conditions, risk scores, and simulation outcomes are illustrative. The simulator uses preset scenarios; it is not connected to a trained AI model or live satellite feeds. Station placement in the 3D scene and navigation map is illustrative. No government affiliation or official deployment is claimed.

## Architecture

- `src/scenes`: persistent Three.js world, shader materials, procedural geometry, camera director, vessel and routes.
- `src/components`: story sections, expedition interface, navigation map, command center.
- `src/hooks/useExperience.ts`: scrolling, guided playback, animation lifecycle, reduced-motion preference.
- `src/data/mission.ts`: chapters, camera shots, iceberg observations, stations and scenarios.
- `src/styles.css`: responsive visual design and interface motion.

Eco mode lowers ocean subdivisions, particle and sea-ice counts, antialiasing and pixel ratio. A simplified view appears if WebGL cannot initialize. Shader and camera animations honor reduced motion.
