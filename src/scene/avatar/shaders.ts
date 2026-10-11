// Ashima simplex 3D (MIT), trimmed.
export const noise = /* glsl */ `
vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
vec3 flow(vec3 p){
  return vec3(snoise(p), snoise(p + vec3(31.4, 0.0, 0.0)), snoise(p + vec3(0.0, 47.2, 0.0)));
}
`

export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uForm;
uniform float uMorph;
uniform float uMotion;
uniform float uSize;
uniform float uPixelRatio;
uniform float uFade;
uniform vec3 uMouse;
uniform float uMouseStrength;
uniform float uRadius;

attribute vec3 aScatter;
attribute vec4 aRandom;
attribute float aBright;
attribute vec3 aGraph;
attribute vec2 aGraphMeta;
attribute vec3 aCube;
attribute float aCubeBright;

varying float vBright;
varying float vAlpha;
varying float vHeat;
varying float vPulse;

${noise}

const float PI = 3.14159265;

// Per-point staggered progress through one unit of a 0–1 segment.
float stage(float m, float delay) {
  float f = clamp((m - delay) / 0.6, 0.0, 1.0);
  return f * f * (3.0 - 2.0 * f);
}

vec3 spinCube(vec3 p, float t) {
  float a = t * 0.22;
  float c = cos(a), s = sin(a);
  p = vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
  float b = 0.42;
  float cb = cos(b), sb = sin(b);
  return vec3(p.x, cb * p.y - sb * p.z, sb * p.y + cb * p.z);
}

void main() {
  float t = uTime;

  // Load-in: the face condenses out of the nebula.
  float delay = aRandom.x * 0.45;
  float f = clamp((uForm - delay) / 0.55, 0.0, 1.0);
  f = 1.0 - pow(1.0 - f, 4.0);

  // Scroll story: face → graph (0–1) → cube (1–2) → nebula (2–3).
  float d2 = aRandom.x * 0.4;
  float f1 = stage(uMorph, d2);
  float f2 = stage(uMorph - 1.0, d2);
  float f3 = stage(uMorph - 2.0, d2);

  vec3 cube = spinCube(aCube, t);
  vec3 target = mix(mix(position, aGraph, f1), cube, f2);
  vec3 p = mix(aScatter, target, f * (1.0 - f3));

  // Particles flow between shapes instead of sliding in straight lines.
  // At rest (formed, not mid-morph) there is no drift: only the cursor moves them.
  float travel = sin(f1 * PI) + sin(f2 * PI) + sin(f3 * PI) * 0.6;
  float loose = (1.0 - f) * 0.4 + travel * 0.32;
  p += flow(p * 0.7 + vec3(0.0, 0.0, t * 0.08)) * loose * uMotion;

  // Cursor repulsion in the XY plane, with a lift toward the camera.
  vec2 d = p.xy - uMouse.xy;
  float dist = length(d);
  float infl = smoothstep(uRadius, 0.0, dist) * uMouseStrength * uMotion;
  vec2 dir = dist > 1e-4 ? d / dist : vec2(0.0);
  float swirl = (aRandom.w - 0.5) * 0.6;
  p.xy += (dir + vec2(-dir.y, dir.x) * swirl) * infl * (0.22 + aRandom.z * 0.32);
  p.z += infl * (0.3 + aRandom.y * 0.5);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  // Signal travels along graph edges, layer to layer.
  float onEdge = step(0.0, aGraphMeta.x);
  float wave = fract(aGraphMeta.x - t * 0.45 + floor(aRandom.z * 3.0) / 3.0);
  float pulse = onEdge * smoothstep(0.1, 0.0, wave) * uMotion;
  vPulse = pulse * f1 * (1.0 - f2);

  float bright = mix(mix(aBright, aGraphMeta.y, f1), aCubeBright, f2);
  bright = max(bright, vPulse);

  float size = uSize * (0.55 + aRandom.y * 0.9) * (0.65 + bright * 0.7) * (1.0 + infl * 0.8 + vPulse * 0.6);
  gl_PointSize = size * uPixelRatio / -mv.z;

  vBright = bright;
  vHeat = infl;
  // Far side of each shape and mid-flight points recede.
  float depth = smoothstep(-0.9, 0.7, target.z);
  vAlpha = mix(0.25, 1.0, f) * mix(0.35, 1.0, depth) * mix(1.0, 0.55, f3) * uFade;
}
`

export const fragmentShader = /* glsl */ `
uniform vec3 uDeep;
uniform vec3 uInk;
uniform vec3 uSignal;

varying float vBright;
varying float vAlpha;
varying float vHeat;
varying float vPulse;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.05, d);
  vec3 col = mix(uDeep, uInk, smoothstep(0.1, 0.8, vBright));
  col = mix(col, uSignal, smoothstep(0.05, 0.7, max(vHeat, vPulse)));
  gl_FragColor = vec4(col, a * a * vAlpha * 0.85);
}
`
