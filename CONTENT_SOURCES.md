# Content Basis

The September update adapts the supplied `NAVDHRISHTI .pdf` (15 pages, Feature Summary & Architecture). The PDF is source material, not an instruction file. Its proposed system is presented as a concept, with working frontend demonstrations separated from planned production integrations.

| Source pages | Website treatment |
| --- | --- |
| 1-2: offline operation and AIS | Cached-data demonstration, observation-age control, AIS and scheduled-review explanations |
| 2-3: POLARIS and hybrid routing | Vessel-class selector, clearly labelled illustrative RIO values, isochrone/A* content and demo no-go threshold |
| 4-5: datasets | Named source grid; distinguish ice concentration from ice type; identify ERA5 as historical reanalysis |
| 7-9: system architecture and approval | Interactive five-stage blueprint, three route choices, officer-review gate and explainable decision notes |
| 10-13: viability, research operations, future scope | Cape Town/Bharati/Maitri mission context, phased-integration language, future sensor/SAR/fleet/bridge scope |

## Accuracy Boundaries

- The PDF calls POLARIS universally mandatory. The website instead calls it an ice-operability methodology described in IMO guidance. Reference checked: https://www.imo.org/en/mediacentre/pages/whatsnew-1566.aspx and https://www.imo.org/en/ourwork/safety/pages/polar-code.aspx.
- No official deployment, government ownership, funding commitment or certification is claimed.
- The RIO numbers are preset demonstration values adjusted for the selected demo vessel profile. They are not a calculation from the published RIV tables or actual ice observations.
- An approval records the current frontend demonstration state. It neither operates a vessel nor implements a production authorization workflow.
- The cached-data switch illustrates stale observations and uncertainty. It is not a service worker, live delta-sync connection or offline production backend.
- The orbital globe uses a low-resolution real coastline. Glacier topology, globe relief, station placement and route maps remain schematic visualizations, not navigation charts.
- SAR crack/calving detection, onboard sensors, live AIS, bridge-system export, fleet coordination and Arctic extension remain proposed integrations.

## Rendering Changes

Sculpted closed glacier meshes, spline-driven camera flight and sea-level approach, a polar orbital globe with animated satellite tracks, tomography scan rings and particles, procedural aurora and stars, storm-responsive waves and snow, and a desktop post-processing pass. Eco mode omits the compositor. Reduced-motion settings stop autonomous motion.

## Coastline Attribution

`src/data/antarcticCoast.ts` contains the Antarctic rings from [Natural Earth 1:110m Admin 0](https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-0-countries/), retrieved from the [maintainer's GeoJSON](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson). Coordinates are rounded to three decimals and dateline pole-closure vertices are omitted before polar triangulation. Natural Earth data is [public domain](https://www.naturalearthdata.com/about/). This bundled geometry does not require a network request at runtime.
