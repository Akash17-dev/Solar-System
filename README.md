# Solar System — Helios Tour

![Preview](assets/preview.png)

A small WebGL + React demo that renders an immersive solar system tour. The scene uses a shader-based renderer for volumetric lighting and procedural planet surfaces, plus placeholder equirectangular textures and cloud overlays for higher realism.

Live demo: https://solar-system-xi-ruddy.vercel.app/

## Features
- Real-time WebGL shader rendering of the Solar System
- Procedural planet surfaces with improved bump mapping and atmospheric scattering
- Per-planet scientific details (mass, gravity, composition, axial tilt, mean temperature, escape velocity, moons)
- Side panel UI to select destinations and a right-side details panel with scientific data
- Placeholder texture sampling for Earth, Jupiter, and Saturn with cloud overlays (replaceable with real textures)

## Run locally
Requirements: Node.js >= 16

1. Install dependencies
```
npm install
```
2. Run dev server
```
npm run dev
```
3. Open the site in your browser (usually at `http://localhost:3000` or as printed by the dev server).

## Preview image
<img width="1470" height="839" alt="Screenshot 2026-06-01 at 4 42 25 AM" src="https://github.com/user-attachments/assets/d38ee6aa-fa89-4546-bfb1-37bc12672d6f" />


## Using real textures
To replace the placeholder procedural textures with real equirectangular images:

1. Create `src/textures/` and add files named `earth.jpg`, `jupiter.jpg`, `saturn.jpg`, and `clouds.png` (equirectangular projections).
2. Update the texture-loading code in `src/main.jsx` (the shader currently samples `uTexEarth`, `uTexJupiter`, `uTexSaturn`, `uTexClouds`).

## License & Credits
This project was created by Akash. The shader and procedural code are original for this demo. Replace textures only with images you have rights to use.

---
If you want, I can add the actual uploaded screenshot into the repository at `assets/preview.png` (I can commit it for you) and wire in specific real texture files if you provide them.
