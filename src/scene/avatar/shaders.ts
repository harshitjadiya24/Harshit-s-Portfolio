// Ashima simplex 3D (MIT), trimmed.
const noise = /* glsl */ `
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

varying float vBright;
varying float vAlpha;
varying float vHeat;

${noise}

void main() {
  // Staggered formation: each point lands on its own schedule.
  float delay = aRandom.x * 0.45;
  float f = clamp((uForm - delay) / 0.55, 0.0, 1.0);
  f = 1.0 - pow(1.0 - f, 4.0);

  vec3 p = mix(aScatter, position, f);

  // Idle life: slow noise drift + per-point shimmer, stronger mid-flight.
  float t = uTime;
  float loose = 0.025 + (1.0 - f) * 0.4;
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

  float size = uSize * (0.55 + aRandom.y * 0.9) * (0.65 + aBright * 0.7) * (1.0 + infl * 0.8);
  gl_PointSize = size * uPixelRatio / -mv.z;

  vBright = aBright;
  vHeat = infl;
  // Back of the head and mid-flight points recede.
  float depth = smoothstep(-0.9, 0.7, position.z);
  vAlpha = mix(0.25, 1.0, f) * mix(0.35, 1.0, depth) * uFade;
}
`

export const fragmentShader = /* glsl */ `
uniform vec3 uDeep;
uniform vec3 uInk;
uniform vec3 uSignal;

varying float vBright;
varying float vAlpha;
varying float vHeat;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.05, d);
  vec3 col = mix(uDeep, uInk, smoothstep(0.1, 0.8, vBright));
  col = mix(col, uSignal, smoothstep(0.05, 0.7, vHeat));
  gl_FragColor = vec4(col, a * a * vAlpha * 0.85);
}
`
