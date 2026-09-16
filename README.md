# NAVDHRISHTI / POLARIS

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
- Spiral opening descent, sea-level camera skim, volumetric iceberg tomography, an orbital polar globe, a vessel-follow climax, aurora and polar sunrise. Desktop rendering includes a lightweight lens pass; eco mode skips it.
- Guided film playback, chapter navigation, high-fidelity/eco rendering, and reduced-motion support.
- Digital-twin layer controls, orbit/zoom/focus, station selection, accessible command-center dialog, object inspection, route comparison, and five replayable scenario simulations.
- PDF-based system architecture explorer and decision studio: three passage options, vessel profiles, forecast horizon, observation age, widening uncertainty, cached-data demonstration, and approval that resets when its evidence changes.

The terrain and vessel are generated with geometry. No stock imagery, remote 3D models, or texture downloads are required. Google Fonts supplies optional typography with local fallback fonts.

The orbital globe uses a bundled public-domain Natural Earth coastline, triangulated onto a sphere at runtime. Its surrounding field, elevations, vessel and station positions remain illustrative. Content provenance and proposed-versus-implemented boundaries are documented in [CONTENT_SOURCES.md](CONTENT_SOURCES.md).

## Scope

This is an interactive SIH concept prototype, not an operational navigation system. Satellite readings, iceberg velocities, station conditions, risk scores, and simulation outcomes are illustrative. The simulator uses preset scenarios; it is not connected to a trained AI model or live satellite feeds. Station placement in the 3D scene and navigation map is illustrative. No government affiliation or official deployment is claimed.

## Architecture

- `src/scenes`: persistent Three.js world, shader materials, procedural geometry, camera director, vessel and routes.
- `src/components`: story sections, expedition interface, navigation map, command center.
- `src/hooks/useExperience.ts`: scrolling, guided playback, animation lifecycle, reduced-motion preference.
- `src/data/mission.ts`: chapters, camera shots, iceberg observations, stations and scenarios.
- `src/data/project.ts`: PDF-derived architecture, proposed source layers and demonstration route options.
- `src/data/antarcticCoast.ts`: locally bundled polar coastline for the orbital mesh.
- `src/styles.css` and `src/enhancements.css`: responsive visual design and interface motion.

Eco mode lowers ocean subdivisions, particle and sea-ice counts, antialiasing and pixel ratio. A simplified view appears if WebGL cannot initialize. Shader and camera animations honor reduced motion.

## Verification

Start the development server on port 4173 with `npm run dev -- --port 4173`, then run `npm run test:browser`. The suite uses Chrome on macOS, checks live shader updates and interactions, and captures desktop/mobile screenshots in `artifacts/`. Set `POLARIS_TEST_URL` to check a different development-server address. `npm run build` checks TypeScript and creates the production bundle.

The cached-data control does not implement a service worker or satellite sync. RIO, confidence, fuel savings and risk percentages are demonstration presets, not trained-model outputs or operational calculations. No additional runtime packages were needed for this enhancement.
