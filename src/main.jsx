import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const DESTINATIONS = [
  {
    name: "Sun",
    label: "Stellar core",
    tone: "#ffb24a",
    distance: "0 AU",
    diameter: "1.39M km",
    detail: "Plasma turbulence, corona bloom, and lens flare define the opening flyby.",
    mass: "1.99e30 kg",
    orbitalPeriod: "-",
    moons: 0,
    gravity: "274 m/s²",
    composition: "Hydrogen/Helium plasma",
    meanTemperature: "≈5,778 K",
    axialTilt: "7.25°",
    escapeVelocity: "617.7 km/s",
  },
  {
    name: "Mercury",
    label: "Inner orbit",
    tone: "#aeb2b5",
    distance: "0.39 AU",
    diameter: "4,879 km",
    detail: "Metallic terrain catches a harsh sunrise across the fastest orbital path.",
    mass: "3.30e23 kg",
    orbitalPeriod: "88 days",
    moons: 0,
    gravity: "3.7 m/s²",
    composition: "Rocky (silicates, metal)",
    meanTemperature: "167 °C (avg)",
    axialTilt: "0.03°",
    escapeVelocity: "4.25 km/s",
  },
  {
    name: "Venus",
    label: "Cloud world",
    tone: "#f3ad58",
    distance: "0.72 AU",
    diameter: "12,104 km",
    detail: "Heavy gold cloud bands glow under dense atmospheric scattering.",
    mass: "4.87e24 kg",
    orbitalPeriod: "225 days",
    moons: 0,
    gravity: "8.87 m/s²",
    composition: "CO₂-rich atmosphere over rocky mantle",
    meanTemperature: "464 °C",
    axialTilt: "177.4° (retrograde)",
    escapeVelocity: "10.36 km/s",
  },
  {
    name: "Earth",
    label: "Blue marble",
    tone: "#55cfff",
    distance: "1 AU",
    diameter: "12,742 km",
    detail: "Ocean speculars, cloud motion, and night-side city lights rotate through view.",
    mass: "5.97e24 kg",
    orbitalPeriod: "365 days",
    moons: 1,
    gravity: "9.807 m/s²",
    composition: "Nitrogen/Oxygen atmosphere, silicate crust",
    meanTemperature: "15 °C",
    axialTilt: "23.44°",
    escapeVelocity: "11.186 km/s",
  },
  {
    name: "Mars",
    label: "Rust frontier",
    tone: "#ee7354",
    distance: "1.52 AU",
    diameter: "6,779 km",
    detail: "Dust haze and polar frost carve contrast into a warm red pass.",
    mass: "6.42e23 kg",
    orbitalPeriod: "687 days",
    moons: 2,
    gravity: "3.721 m/s²",
    composition: "CO₂ atmosphere, iron-rich rocks",
    meanTemperature: "-65 °C",
    axialTilt: "25.19°",
    escapeVelocity: "5.03 km/s",
  },
  {
    name: "Jupiter",
    label: "Gas giant",
    tone: "#f2bd78",
    distance: "5.2 AU",
    diameter: "139,820 km",
    detail: "Layered storm belts and a glowing storm eye create the largest close approach.",
    mass: "1.90e27 kg",
    orbitalPeriod: "12 yrs",
    moons: 79,
    gravity: "24.79 m/s² (cloud tops)",
    composition: "Hydrogen/Helium gas giant",
    meanTemperature: "-110 °C (cloud tops)",
    axialTilt: "3.13°",
    escapeVelocity: "59.5 km/s",
  },
  {
    name: "Saturn",
    label: "Ring plane",
    tone: "#ead18e",
    distance: "9.58 AU",
    diameter: "116,460 km",
    detail: "Etched ice rings sweep across the camera in a high-contrast orbital cut.",
    mass: "5.68e26 kg",
    orbitalPeriod: "29 yrs",
    moons: 82,
    gravity: "10.44 m/s² (cloud tops)",
    composition: "Hydrogen/Helium with ring ices",
    meanTemperature: "-140 °C (cloud tops)",
    axialTilt: "26.73°",
    escapeVelocity: "35.5 km/s",
  },
  {
    name: "Uranus",
    label: "Tilted ice",
    tone: "#8ee8ee",
    distance: "19.2 AU",
    diameter: "50,724 km",
    detail: "A soft cyan haze makes the planet feel glassy and distant.",
    mass: "8.68e25 kg",
    orbitalPeriod: "84 yrs",
    moons: 27,
    gravity: "8.69 m/s²",
    composition: "Ices and gas (water, ammonia, methane)",
    meanTemperature: "-195 °C",
    axialTilt: "97.77°",
    escapeVelocity: "21.3 km/s",
  },
  {
    name: "Neptune",
    label: "Outer drift",
    tone: "#6489ff",
    distance: "30.1 AU",
    diameter: "49,244 km",
    detail: "Deep blue winds and electric rim light close the tour in the outer system.",
    mass: "1.02e26 kg",
    orbitalPeriod: "165 yrs",
    moons: 14,
    gravity: "11.15 m/s²",
    composition: "Ices and hydrogen/helium envelope",
    meanTemperature: "-200 °C",
    axialTilt: "28.32°",
    escapeVelocity: "23.5 km/s",
  },
];

const vertexSource = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const fragmentSource = `#version 300 es
precision highp float;

uniform vec3 iResolution;
uniform float iTime;
uniform vec4 iMouse;
uniform float uFocus;
uniform float uMotion;
uniform sampler2D uTexEarth;
uniform sampler2D uTexJupiter;
uniform sampler2D uTexSaturn;
uniform sampler2D uTexClouds;

out vec4 fragColor;

#define PLANETS 8
#define DESTINATIONS 9
#define FAR 180.0
#define PI 3.14159265359

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n = dot(i, vec3(1.0, 57.0, 113.0));
  return mix(
    mix(mix(hash11(n + 0.0), hash11(n + 1.0), f.x),
        mix(hash11(n + 57.0), hash11(n + 58.0), f.x), f.y),
    mix(mix(hash11(n + 113.0), hash11(n + 114.0), f.x),
        mix(hash11(n + 170.0), hash11(n + 171.0), f.x), f.y),
    f.z
  );
}

float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.55;
  mat3 m = mat3(0.00, 0.80, 0.60, -0.80, 0.36, -0.48, -0.60, -0.48, 0.64);
  for (int i = 0; i < 7; i++) {
    v += a * noise(p);
    p = m * p * 2.07 + 17.13;
    a *= 0.5;
  }
  return v;
}

// Convert 3D normal to equirectangular UV
vec2 normalToEquirect(vec3 n) {
  float u = atan(n.z, n.x) / (2.0 * PI) + 0.5;
  float v = asin(clamp(n.y, -1.0, 1.0)) / PI + 0.5;
  return vec2(u, 1.0 - v);
}

mat2 rot(float a) {
  float s = sin(a), c = cos(a);
  return mat2(c, -s, s, c);
}

float radiusFor(int id) {
  if (id == 4) return 2.35;
  if (id == 5) return 2.05;
  if (id == 6) return 1.34;
  if (id == 7) return 1.42;
  if (id == 2) return 1.14;
  return 0.68 + float(id) * 0.07;
}

float orbitFor(int id) {
  float f = float(id);
  return 5.2 + f * 2.88 + max(0.0, f - 3.0) * 0.58;
}

vec3 orbitPlane(int id, vec3 p) {
  float f = float(id);
  p.yz = rot(0.04 * sin(f * 2.1) + 0.025 * f) * p.yz;
  p.xz = rot(0.02 * cos(f * 1.7)) * p.xz;
  return p;
}

vec3 planetPos(int id, float t) {
  float f = float(id);
  float orbit = orbitFor(id);
  float speed = 0.55 / (1.0 + f * 0.42);
  float a = t * speed + f * 1.36;
  vec3 p = vec3(cos(a) * orbit, 0.0, sin(a) * orbit);
  p = orbitPlane(id, p);
  p.y += sin(a * 0.7 + f) * 0.2;
  return p;
}

vec3 destinationPos(int id, float t) {
  if (id == 0) return vec3(0.0);
  return planetPos(id - 1, t);
}

vec3 targetFor(float focus, float t) {
  int a = int(floor(mod(focus, 9.0)));
  int b = int(mod(float(a + 1), 9.0));
  float m = smoothstep(0.0, 1.0, fract(focus));
  return mix(destinationPos(a, t), destinationPos(b, t), m);
}

float sphereHit(vec3 ro, vec3 rd, vec3 ce, float ra) {
  vec3 oc = ro - ce;
  float b = dot(oc, rd);
  float c = dot(oc, oc) - ra * ra;
  float h = b * b - c;
  if (h < 0.0) return -1.0;
  h = sqrt(h);
  float t = -b - h;
  return t > 0.001 ? t : -b + h;
}

vec3 starfield(vec3 rd, vec2 fragCoord) {
  vec2 polar = vec2(atan(rd.z, rd.x) / PI, asin(rd.y) / (0.5 * PI));
  vec3 col = vec3(0.005, 0.009, 0.016);
  float cloud = fbm(rd * 2.4 + vec3(1.0, iTime * 0.018, 0.0));
  col += vec3(0.03, 0.055, 0.08) * cloud;
  col += vec3(0.07, 0.025, 0.09) * pow(fbm(rd * 4.5 + 7.0), 2.4);

  vec2 grid = floor(polar * vec2(420.0, 210.0));
  float h = hash21(grid);
  float sparkle = smoothstep(0.992, 1.0, h);
  float small = smoothstep(0.982, 1.0, hash21(grid + 19.7)) * 0.35;
  float twinkle = 0.58 + 0.42 * sin(iTime * (2.0 + h * 4.0) + h * 25.0);
  col += (sparkle + small) * twinkle * vec3(0.9, 0.95, 1.0);
  col += pow(max(rd.y + 0.08, 0.0), 4.0) * vec3(0.02, 0.06, 0.11);
  return col;
}

vec3 planetSurface(int id, vec3 n, vec3 p) {
  float lat = n.y;
  float t = iTime;
  float clouds = fbm(n * 8.0 + vec3(t * 0.1, 4.0, 0.0));
  float grain = fbm(n * 17.0 + float(id) * 3.0);
  float belts = 0.5 + 0.5 * sin(lat * (34.0 + float(id) * 2.0) + fbm(n * 3.0) * 5.5);

  if (id == 0) {
    return mix(vec3(0.28, 0.27, 0.25), vec3(0.82, 0.78, 0.67), grain) * (0.82 + 0.22 * fbm(n * 34.0));
  }
  if (id == 1) {
    vec3 storm = mix(vec3(0.78, 0.38, 0.13), vec3(1.0, 0.78, 0.35), clouds);
    return storm + vec3(0.18, 0.08, 0.0) * sin(lat * 46.0 + t);
  }
  if (id == 2) {
    float land = smoothstep(0.47, 0.58, fbm(n * 4.2 + vec3(2.0, 0.0, 0.0)));
    float ice = smoothstep(0.72, 0.94, abs(lat));
    vec3 ocean = mix(vec3(0.015, 0.12, 0.36), vec3(0.02, 0.34, 0.68), max(0.0, n.z));
    vec3 ground = mix(vec3(0.08, 0.38, 0.18), vec3(0.66, 0.52, 0.28), grain);
    vec3 base = mix(ocean, ground, land);
    base = mix(base, vec3(0.94), ice);
    return mix(base, vec3(1.0), smoothstep(0.61, 0.79, clouds) * 0.48);
  }
  if (id == 3) {
    float frost = smoothstep(0.76, 0.95, abs(lat));
    return mix(mix(vec3(0.42, 0.1, 0.055), vec3(1.0, 0.42, 0.22), grain), vec3(0.88, 0.75, 0.62), frost);
  }
  if (id == 4) {
    float storm = smoothstep(0.7, 0.95, fbm(vec3(n.x * 4.0, n.y * 20.0, n.z * 3.0) + t * 0.06));
    vec3 base = mix(vec3(0.53, 0.25, 0.13), vec3(1.0, 0.78, 0.5), belts);
    return mix(base, vec3(0.95, 0.38, 0.18), storm * smoothstep(0.1, 0.45, n.x) * smoothstep(-0.28, -0.05, n.y));
  }
  if (id == 5) {
    return mix(vec3(0.62, 0.43, 0.26), vec3(1.0, 0.86, 0.58), belts * 0.72 + 0.16);
  }
  if (id == 6) {
    return mix(vec3(0.32, 0.76, 0.8), vec3(0.72, 1.0, 0.98), grain * 0.4 + 0.42);
  }
  return mix(vec3(0.035, 0.12, 0.5), vec3(0.28, 0.55, 1.0), grain) + belts * vec3(0.02, 0.06, 0.18);
}

float ringMask(vec3 p, float innerR, float outerR) {
  float r = length(p.xz);
  float disk = smoothstep(innerR, innerR + 0.08, r) * (1.0 - smoothstep(outerR - 0.1, outerR, r));
  float etched = 0.56 + 0.44 * sin(r * 39.0 + fbm(p * 10.0) * 4.5);
  float gap = 1.0 - 0.55 * smoothstep(0.02, 0.06, abs(r - mix(innerR, outerR, 0.58)));
  return disk * etched * gap * smoothstep(0.13, 0.0, abs(p.y));
}

vec3 cameraFor(float focus, float t) {
  vec3 target = targetFor(focus, t);
  float sunFocus = 1.0 - smoothstep(0.28, 0.8, abs(focus));
  float sweep = t * 0.2 + focus * 0.92;
  float breathe = 0.5 + 0.5 * sin(t * 0.36);
  float dist = mix(mix(8.7, 5.2, breathe), 10.8, sunFocus);
  vec3 offset = vec3(cos(sweep) * dist, mix(2.15 + sin(t * 0.27 + focus) * 1.45, 3.4, sunFocus), sin(sweep) * dist);
  return target + offset;
}

vec3 sunSurface(vec3 n, float t) {
  float cells = fbm(n * 5.0 + vec3(t * 0.16, 0.0, 0.0));
  float storms = fbm(n * 14.0 + vec3(0.0, t * 0.28, t * 0.08));
  vec3 core = vec3(1.0, 0.74, 0.25);
  vec3 ember = vec3(1.0, 0.22, 0.035);
  vec3 whiteHot = vec3(1.0, 0.94, 0.68);
  return mix(mix(ember, core, cells), whiteHot, smoothstep(0.58, 0.92, storms));
}

void mainImage(out vec4 outColor, vec2 fragCoord) {
  vec2 uv = (fragCoord - iResolution.xy * 0.5) / iResolution.y;
  vec2 mouse = iMouse.z > 0.0 ? (iMouse.xy / iResolution.xy - 0.5) : vec2(0.0);
  float time = iTime * uMotion;
  float focus = mod(uFocus, 9.0);

  vec3 target = targetFor(focus, time);
  vec3 ro = cameraFor(focus, time);
  ro.xz = target.xz + rot(mouse.x * 1.35) * (ro.xz - target.xz);
  ro.y += mouse.y * 5.5;

  vec3 ww = normalize(target - ro);
  vec3 uu = normalize(cross(vec3(0.0, 1.0, 0.0), ww));
  vec3 vv = cross(ww, uu);
  vec3 rd = normalize(uv.x * uu + uv.y * vv + 1.64 * ww);

  vec3 sun = vec3(0.0);
  vec3 sunRay = normalize(sun - ro);
  vec3 color = starfield(rd, fragCoord);

  float sunDot = max(dot(rd, sunRay), 0.0);
  color += vec3(1.0, 0.58, 0.19) * pow(sunDot, 850.0) * 9.0;
  color += vec3(1.0, 0.38, 0.08) * pow(sunDot, 9.0) * 0.95;
  color += vec3(0.42, 0.68, 1.0) * pow(sunDot, 2.0) * 0.04;

  float best = FAR;
  int hitId = -1;
  vec3 hitCenter = vec3(0.0);
  float hitRadius = 1.0;

  float sunRadius = 2.15;
  float sunHit = sphereHit(ro, rd, sun, sunRadius);
  if (sunHit > 0.0) {
    best = sunHit;
    hitId = 100;
    hitRadius = sunRadius;
  }

  for (int i = 0; i < PLANETS; i++) {
    vec3 ce = planetPos(i, time);
    float ra = radiusFor(i);
    float h = sphereHit(ro, rd, ce, ra);
    if (h > 0.0 && h < best) {
      best = h;
      hitId = i;
      hitCenter = ce;
      hitRadius = ra;
    }
  }

  vec3 saturn = planetPos(5, time);
  vec3 rp = ro - saturn;
  vec3 rr = rd;
  rp.yz = rot(0.62) * rp.yz;
  rr.yz = rot(0.62) * rr.yz;
  rp.xy = rot(-0.15) * rp.xy;
  rr.xy = rot(-0.15) * rr.xy;
  float ringT = -rp.y / rr.y;
  if (ringT > 0.0 && ringT < best) {
    vec3 ringP = rp + rr * ringT;
    float m = ringMask(ringP, 2.45, 4.45);
    if (m > 0.01) {
      vec3 ringWorld = ro + rd * ringT;
      vec3 l = normalize(sun - ringWorld);
      float light = 0.35 + 0.85 * max(dot(normalize(vec3(0.0, 1.0, 0.18)), l), 0.0);
      vec3 rc = mix(vec3(0.34, 0.27, 0.2), vec3(1.0, 0.88, 0.62), m) * light;
      color = mix(color, rc, clamp(m * 0.82, 0.0, 0.86));
      best = ringT;
    }
  }

  if (hitId == 100) {
    vec3 pos = ro + rd * best;
    vec3 n = normalize(pos);
    vec3 v = normalize(ro - pos);
    float limb = pow(1.0 - max(dot(n, v), 0.0), 1.65);
    vec3 plasma = sunSurface(n, time);
    float flare = smoothstep(0.1, 1.0, limb);
    color = plasma * 1.75 + vec3(1.0, 0.36, 0.05) * flare * 2.0;
  } else if (hitId >= 0) {
    vec3 pos = ro + rd * best;
    vec3 n0 = normalize(pos - hitCenter);
    // planetary spin
    n0.xz = rot(time * (0.13 + float(hitId) * 0.025)) * n0.xz;

    float hid = float(hitId);
    // bump / normal perturbation (procedural micro-detail)
    float bumpA = fbm(n0 * (10.0 + hid * 2.0) + vec3(time * (0.02 + hid * 0.006)));
    float bumpB = fbm(n0 * (20.0 + hid * 3.0) + vec3(time * (0.04 + hid * 0.009)));
    float bumpStrength = 0.04 + 0.02 * mod(hid, 3.0);
    vec3 n = normalize(n0 + bumpStrength * vec3(bumpA - 0.5, bumpB - 0.5, fbm(n0 * 18.0 + vec3(time * 0.11)) - 0.5));

    vec3 l = normalize(sun - pos);
    vec3 v = normalize(ro - pos);
    float diff = max(dot(n, l), 0.0);
    float halfLambert = diff * 0.75 + 0.25 * diff * diff;

    // base coloration
    vec3 base = planetSurface(hitId, n, pos);

    // per-planet cloud layer: coverage and speed
    float cloudCoverage = mix(0.1, 0.7, clamp(hid / 8.0, 0.0, 1.0));
    float cloudSpeed = 0.02 + 0.02 * mod(hid, 5.0);
    float clouds = smoothstep(0.45, 0.78, fbm(n0 * (4.0 + hid * 0.6) + vec3(time * cloudSpeed, 3.0, 1.0)));
    vec3 cloudColor = mix(vec3(1.0, 0.98, 0.96), vec3(0.95, 0.97, 1.0), fbm(n0 * 10.0));
    base = mix(base, cloudColor, clouds * cloudCoverage * 0.7);

    // texture sampling for photorealism (placeholder equirectangular textures)
    vec2 texUV = normalToEquirect(n0);
    if (hitId == 2) {
      vec3 tex = texture(uTexEarth, texUV).rgb;
      base = mix(base, tex, 0.86);
      // add cloud texture overlay
      vec3 cloudTex = texture(uTexClouds, vec2(texUV.x + time * cloudSpeed * 0.04, texUV.y)).rgb;
      base = mix(base, cloudTex, clouds * 0.45 * cloudCoverage);
    }
    if (hitId == 4) {
      vec3 tex = texture(uTexJupiter, texUV).rgb;
      base = mix(base, tex, 0.72);
      vec3 cloudTex = texture(uTexClouds, vec2(texUV.x + time * cloudSpeed * 0.02, texUV.y)).rgb;
      base = mix(base, cloudTex, clouds * 0.25 * cloudCoverage);
    }
    if (hitId == 5) {
      vec3 tex = texture(uTexSaturn, texUV).rgb;
      base = mix(base, tex, 0.68);
    }

    // atmosphere tint per planet
    vec3 atmosphere = vec3(0.22, 0.58, 1.0);
    if (hitId == 1) atmosphere = vec3(1.0, 0.58, 0.12);
    if (hitId == 3) atmosphere = vec3(1.0, 0.28, 0.12);
    if (hitId == 4) atmosphere = vec3(1.0, 0.7, 0.38);
    if (hitId == 6) atmosphere = vec3(0.45, 1.0, 0.94);
    if (hitId == 7) atmosphere = vec3(0.19, 0.36, 1.0);

    // wavelength-ish scattering (simple approximation)
    vec3 rayleigh = vec3(0.6, 1.0, 1.8) * 0.45;
    float limb = pow(1.0 - max(dot(n0, v), 0.0), 3.0);
    vec3 scatter = rayleigh * atmosphere * limb * (0.7 + 0.3 * (1.0 - diff));

    // fresnel / rim and improved specular
    float fresnel = pow(1.0 - max(dot(n, v), 0.0), 2.0 + hid * 0.02);
    float specPower = hitId == 2 ? 80.0 : (hitId <= 3 ? 36.0 : 20.0);
    float spec = pow(max(dot(reflect(-l, n), v), 0.0), specPower) * (0.5 + 0.5 * diff);
    spec += clouds * 0.12; // cloud highlights

    // subtle city lights for Earth-like bodies
    vec3 city = vec3(0.0);
    if (hitId == 2) {
      float grid = smoothstep(0.82, 1.0, fbm(n * 48.0)) * smoothstep(0.45, 0.62, fbm(n * 6.0 + 2.0));
      city = vec3(1.0, 0.68, 0.28) * grid * (1.0 - smoothstep(-0.2, 0.4, dot(n, l))) * 0.9;
    }

    color = base * (0.06 + halfLambert * 1.22) + city + scatter + atmosphere * fresnel * (0.5 + diff * 0.3) + spec * vec3(1.0, 0.95, 0.85);
  }

  for (int i = 0; i < PLANETS; i++) {
    float orbit = orbitFor(i);
    vec3 planeRo = ro;
    vec3 planeRd = rd;
    planeRo = orbitPlane(i, planeRo);
    planeRd = orbitPlane(i, planeRd);
    float ot = -planeRo.y / planeRd.y;
    vec3 op = planeRo + planeRd * ot;
    float r = length(op.xz);
    float ring = exp(-abs(r - orbit) * 26.0) * smoothstep(0.0, 1.0, ot);
    float dash = 0.58 + 0.42 * sin(atan(op.z, op.x) * 80.0 - time * (2.0 + float(i) * 0.2));
    color += ring * dash * vec3(0.13, 0.38, 0.66) * 0.16;

    vec3 ce = planetPos(i, time);
    float d = length(cross(rd, ce - ro));
    float along = dot(ce - ro, rd);
    color += exp(-d * 1.45) * smoothstep(0.0, 18.0, along) * vec3(0.24, 0.55, 0.9) * 0.016;
  }

  float beltT = -ro.y / rd.y;
  if (beltT > 0.0 && beltT < best) {
    vec3 bp = ro + rd * beltT;
    float beltR = length(bp.xz);
    float belt = smoothstep(14.2, 15.1, beltR) * (1.0 - smoothstep(17.2, 18.3, beltR));
    vec2 cell = floor(vec2(atan(bp.z, bp.x) * 180.0, beltR * 42.0));
    float rock = smoothstep(0.955, 1.0, hash21(cell));
    float shimmer = 0.62 + 0.38 * sin(time * 2.2 + hash21(cell + 7.0) * 20.0);
    color += belt * rock * shimmer * vec3(0.62, 0.54, 0.42) * 0.42;
    color += belt * vec3(0.05, 0.08, 0.11) * 0.1;
  }

  vec3 cometDir = normalize(vec3(-0.65, 0.22, 0.73));
  vec3 cometAnchor = vec3(sin(time * 0.18) * 17.0, 4.2 + sin(time * 0.27) * 2.0, cos(time * 0.18) * 17.0);
  vec3 cometToRay = cometAnchor - ro;
  float cometAlong = dot(cometToRay, rd);
  vec3 cometClosest = ro + rd * cometAlong;
  float cometCore = length(cometClosest - cometAnchor);
  float tail = max(dot(normalize(cometClosest - cometAnchor), cometDir), 0.0);
  color += exp(-cometCore * 4.2) * smoothstep(0.0, 20.0, cometAlong) * vec3(0.72, 0.9, 1.0) * 0.42;
  color += exp(-cometCore * 1.1) * pow(tail, 5.0) * vec3(0.28, 0.52, 1.0) * 0.28;

  float vignette = smoothstep(1.48, 0.24, length(uv));
  color *= 0.52 + 0.48 * vignette;
  color += vec3(0.015, 0.025, 0.04) * (1.0 - vignette);
  color = color / (1.0 + color * 0.45);
  color = pow(color, vec3(0.78));
  outColor = vec4(color, 1.0);
}

void main() {
  mainImage(fragColor, gl_FragCoord.xy);
}`;

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "Shader compile failed");
  }
  return shader;
}

function createProgram(gl) {
  const program = gl.createProgram();
  gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? "Program link failed");
  }
  return program;
}

function ShaderTour({ focus, motion }) {
  const canvasRef = useRef(null);
  const focusRef = useRef(focus);
  const previousFocusRef = useRef(focus);
  const transitionStartRef = useRef(performance.now());
  const mouseRef = useRef({ x: 0, y: 0, active: 0 });
  const motionRef = useRef(motion);

  useEffect(() => {
    previousFocusRef.current = focusRef.current;
    focusRef.current = focus;
    transitionStartRef.current = performance.now();
  }, [focus]);

  useEffect(() => {
    motionRef.current = motion;
  }, [motion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl2", {
      antialias: false,
      depth: false,
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      canvas.classList.add("unsupported");
      return undefined;
    }

    let program;
    try {
      program = createProgram(gl);
    } catch (error) {
      console.error(error);
      canvas.classList.add("unsupported");
      return undefined;
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const position = gl.getAttribLocation(program, "position");
    const uniforms = {
      iResolution: gl.getUniformLocation(program, "iResolution"),
      iTime: gl.getUniformLocation(program, "iTime"),
      iMouse: gl.getUniformLocation(program, "iMouse"),
      uFocus: gl.getUniformLocation(program, "uFocus"),
      uMotion: gl.getUniformLocation(program, "uMotion"),
      uTexEarth: gl.getUniformLocation(program, "uTexEarth"),
      uTexJupiter: gl.getUniformLocation(program, "uTexJupiter"),
      uTexSaturn: gl.getUniformLocation(program, "uTexSaturn"),
      uTexClouds: gl.getUniformLocation(program, "uTexClouds"),
    };

    // textures (created from canvas placeholders)
    let texEarth = null;
    let texJupiter = null;
    let texSaturn = null;
    let texClouds = null;

    function createGLTextureFromCanvas(canvas) {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    }

    function makeEarthCanvas() {
      const c = document.createElement('canvas');
      c.width = 2048; c.height = 1024;
      const ctx = c.getContext('2d');
      // base ocean
      const g = ctx.createLinearGradient(0,0,c.width,0);
      g.addColorStop(0, '#0b3d91');
      g.addColorStop(0.5, '#1177bb');
      g.addColorStop(1, '#0b3d91');
      ctx.fillStyle = g; ctx.fillRect(0,0,c.width,c.height);
      // simple continents blobs
      ctx.fillStyle = '#2e8b57';
      for (let i=0;i<12;i++) {
        ctx.beginPath();
        ctx.ellipse(Math.random()*c.width, Math.random()*c.height, 120+Math.random()*260, 60+Math.random()*160, Math.random()*Math.PI, 0, Math.PI*2);
        ctx.fill();
      }
      // light beaches
      ctx.globalAlpha = 0.14; ctx.fillStyle = '#f1e7c9'; ctx.fillRect(0,0,10,0);
      ctx.globalAlpha = 1.0;
      return c;
    }

    function makeGasCanvas(type) {
      const c = document.createElement('canvas');
      c.width = 2048; c.height = 1024;
      const ctx = c.getContext('2d');
      let bands = 12;
      if (type === 'jupiter') {
        bands = 18;
        for (let i=0;i<bands;i++){
          const t = i / bands;
          const y = t * c.height;
          ctx.fillStyle = i%2 ? '#c6863d' : '#8f5a3a';
          ctx.fillRect(0, y, c.width, c.height/bands + (Math.sin(i)*4));
        }
      } else {
        bands = 10;
        for (let i=0;i<bands;i++){
          ctx.fillStyle = i%2 ? '#efe3b8' : '#d9c9a0';
          const y = (i / bands) * c.height;
          ctx.fillRect(0, y, c.width, c.height/bands + (Math.cos(i)*3));
        }
      }
      return c;
    }

    function makeCloudsCanvas() {
      const c = document.createElement('canvas');
      c.width = 1024; c.height = 512;
      const ctx = c.getContext('2d');
      ctx.fillStyle = 'rgba(255,255,255,0)'; ctx.fillRect(0,0,c.width,c.height);
      for (let i=0;i<1500;i++){
        ctx.fillStyle = 'rgba(255,255,255,' + (0.03 + Math.random()*0.12) + ')';
        ctx.beginPath();
        const r = 6 + Math.random()*30;
        ctx.ellipse(Math.random()*c.width, Math.random()*c.height, r, r*0.6, Math.random()*Math.PI, 0, Math.PI*2);
        ctx.fill();
      }
      return c;
    }

    // create and upload textures
    texEarth = createGLTextureFromCanvas(makeEarthCanvas());
    texJupiter = createGLTextureFromCanvas(makeGasCanvas('jupiter'));
    texSaturn = createGLTextureFromCanvas(makeGasCanvas('saturn'));
    texClouds = createGLTextureFromCanvas(makeCloudsCanvas());

    // bind texture units to uniform samplers
    gl.useProgram(program);
    gl.uniform1i(uniforms.uTexEarth, 0);
    gl.uniform1i(uniforms.uTexJupiter, 1);
    gl.uniform1i(uniforms.uTexSaturn, 2);
    gl.uniform1i(uniforms.uTexClouds, 3);

    let frame = 0;
    let lastFrame = performance.now();
    let shaderTime = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(window.innerWidth * dpr));
      const height = Math.max(1, Math.floor(window.innerHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
    };

    const render = (now) => {
      resize();
      const deltaSeconds = Math.min((now - lastFrame) * 0.001, 0.08);
      lastFrame = now;
      shaderTime += deltaSeconds * motionRef.current;

      const transition = Math.min((now - transitionStartRef.current) / 1550, 1);
      const eased = transition * transition * (3 - 2 * transition);
      let delta = focusRef.current - previousFocusRef.current;
      if (delta > DESTINATIONS.length / 2) delta -= DESTINATIONS.length;
      if (delta < -DESTINATIONS.length / 2) delta += DESTINATIONS.length;
      const cameraFocus = previousFocusRef.current + delta * eased;
      const mouse = mouseRef.current;

      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      gl.uniform3f(uniforms.iResolution, canvas.width, canvas.height, 1);
      gl.uniform1f(uniforms.iTime, shaderTime);
      gl.uniform4f(uniforms.iMouse, mouse.x, canvas.height - mouse.y, mouse.active, 0);
      gl.uniform1f(uniforms.uFocus, cameraFocus);
      gl.uniform1f(uniforms.uMotion, 1);
      // bind textures to units
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texEarth);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, texJupiter);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, texSaturn);
      gl.activeTexture(gl.TEXTURE3);
      gl.bindTexture(gl.TEXTURE_2D, texClouds);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      frame = requestAnimationFrame(render);
    };

    const onPointerMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = canvas.width / rect.width;
      mouseRef.current.x = (event.clientX - rect.left) * dpr;
      mouseRef.current.y = (event.clientY - rect.top) * dpr;
    };

    const onPointerDown = () => {
      mouseRef.current.active = 1;
    };

    const onPointerUp = () => {
      mouseRef.current.active = 0;
    };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("resize", resize);
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", resize);
      gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
        if (texEarth) gl.deleteTexture(texEarth);
        if (texJupiter) gl.deleteTexture(texJupiter);
        if (texSaturn) gl.deleteTexture(texSaturn);
        if (texClouds) gl.deleteTexture(texClouds);
    };
  }, []);

  return <canvas ref={canvasRef} className="shader-canvas" aria-label="Immersive shader solar system tour" />;
}

function App() {
  const [focus, setFocus] = useState(0);
  const [motion, setMotion] = useState(1);
  const [autoPlay, setAutoPlay] = useState(true);
  const [sidebarHidden, setSidebarHidden] = useState(false);

  useEffect(() => {
    if (!autoPlay) return undefined;
    const id = window.setInterval(() => {
      setFocus((value) => (value + 1) % DESTINATIONS.length);
    }, 3600);
    return () => window.clearInterval(id);
  }, [autoPlay]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        setFocus((value) => (value - 1 + DESTINATIONS.length) % DESTINATIONS.length);
      }
      if (event.key === "ArrowRight") {
        setFocus((value) => (value + 1) % DESTINATIONS.length);
      }
      if (event.key === " ") {
        event.preventDefault();
        setAutoPlay((value) => !value);
      }
      if (event.key.toLowerCase() === "h") {
        setSidebarHidden((value) => !value);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const activeDestination = DESTINATIONS[focus];
  const railStyle = useMemo(
    () => ({ "--active-tone": activeDestination.tone }),
    [activeDestination],
  );

  return (
    <>
      <ShaderTour focus={focus} motion={motion} />
      <div className="cinema-vignette" aria-hidden="true" />
      <main className={sidebarHidden ? "mission-layout panels-hidden" : "mission-layout"} style={railStyle}>
        <aside className="planet-sidebar" aria-label="Solar system destination names" aria-hidden={sidebarHidden}>
          <header className="console-header">
            <div>
              <span className="eyebrow">Helios Tour</span>
              <h1>Solar System</h1>
            </div>
            <div className="live-pill">
              <span />
              Live
            </div>
          </header>

          <nav className="destination-list" aria-label="Choose destination">
            {DESTINATIONS.map((destination, index) => (
              <button
                key={destination.name}
                className={index === focus ? "destination-row active" : "destination-row"}
                style={{ "--tone": destination.tone }}
                aria-current={index === focus ? "true" : undefined}
                onClick={() => setFocus(index)}
              >
                <span className="row-orb" />
                <span className="row-copy">
                  <strong>{destination.name}</strong>
                  <small>{destination.label}</small>
                </span>
                <span className="row-distance">{destination.distance}</span>
              </button>
            ))}
          </nav>
        </aside>

        <section className="details-panel" aria-label="Planet scientific details">
          <span className="destination-index">{String(focus + 1).padStart(2, "0")}</span>
          <p className="destination-label">{activeDestination.label}</p>
          <h2>{activeDestination.name}</h2>
          <p>{activeDestination.detail}</p>

          <div className="metric-grid" style={{ marginTop: 12 }}>
            <div>
              <span>Mass</span>
              <strong>{activeDestination.mass}</strong>
            </div>
            <div>
              <span>Diameter</span>
              <strong>{activeDestination.diameter}</strong>
            </div>
            <div>
              <span>Gravity</span>
              <strong>{activeDestination.gravity}</strong>
            </div>
            <div>
              <span>Escape velocity</span>
              <strong>{activeDestination.escapeVelocity}</strong>
            </div>
            <div>
              <span>Orbital period</span>
              <strong>{activeDestination.orbitalPeriod}</strong>
            </div>
            <div>
              <span>Distance</span>
              <strong>{activeDestination.distance}</strong>
            </div>
            <div>
              <span>Axial tilt</span>
              <strong>{activeDestination.axialTilt}</strong>
            </div>
            <div>
              <span>Mean temp</span>
              <strong>{activeDestination.meanTemperature}</strong>
            </div>
            <div>
              <span>Composition</span>
              <strong>{activeDestination.composition}</strong>
            </div>
            <div>
              <span>Moons</span>
              <strong>{activeDestination.moons}</strong>
            </div>
          </div>
        </section>
        

        <section className="bottom-dock" aria-label="Tour controls">
          <button
            className="dock-button"
            onClick={() => setFocus((value) => (value - 1 + DESTINATIONS.length) % DESTINATIONS.length)}
          >
            Prev
          </button>
          <button
            className="dock-button primary"
            aria-label={autoPlay ? "Stop autoplay" : "Start autoplay"}
            onClick={() => setAutoPlay((value) => !value)}
          >
            {autoPlay ? "Auto 3.6s" : "Autoplay"}
          </button>
          <button
            className="dock-button"
            aria-label={motion === 1 ? "Pause scene motion" : "Resume scene motion"}
            onClick={() => setMotion((value) => (value === 1 ? 0 : 1))}
          >
            {motion === 1 ? "Motion" : "Frozen"}
          </button>
          <button
            className="dock-button"
            onClick={() => setFocus((value) => (value + 1) % DESTINATIONS.length)}
          >
            Next
          </button>
        </section>

        <button
          className="hide-toggle"
          aria-label={sidebarHidden ? "Show interface panels" : "Hide interface panels"}
          onClick={() => setSidebarHidden((value) => !value)}
        >
          {sidebarHidden ? "Show UI" : "Hide UI"}
        </button>

        <section className="scene-caption" aria-label="Current destination">
          <span>{activeDestination.label}</span>
          <strong>{activeDestination.name}</strong>
        </section>
      </main>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
