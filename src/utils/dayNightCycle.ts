export type CycleMode = 'auto' | 'dawn' | 'day' | 'dusk' | 'night' | 'custom';
export type DayPhase = 'dawn' | 'day' | 'dusk' | 'night';

export interface AtmosphereKeyframe {
  hour: number;
  skyZenith: string;
  skyMid: string;
  skyHorizon: string;
  skyDeep: string;
  fogColor: string;
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  keyColor: string;
  keyIntensity: number;
  rimColor: string;
  rimIntensity: number;
  cloudTint: string;
  cloudEmissive: string;
  cloudEmissiveIntensity: number;
  fireflyOpacity: number;
  starOpacity: number;
  lanternIntensity: number;
  moonOpacity: number;
  sunOpacity: number;
  exposure: number;
  overlayTopRgba: [number, number, number, number];
  overlayHorizonRgba: [number, number, number, number];
}

export interface SampledAtmosphere {
  hour: number;
  phase: DayPhase;
  phaseLabel: string;
  ambientPercent: number;
  skyZenith: string;
  skyMid: string;
  skyHorizon: string;
  skyDeep: string;
  fogColor: string;
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  keyColor: string;
  keyIntensity: number;
  rimColor: string;
  rimIntensity: number;
  cloudTint: string;
  cloudEmissive: string;
  cloudEmissiveIntensity: number;
  fireflyOpacity: number;
  starOpacity: number;
  lanternIntensity: number;
  moonOpacity: number;
  sunOpacity: number;
  exposure: number;
  overlayGradient: string;
}

export const PRESET_HOURS: Record<Exclude<CycleMode, 'auto' | 'custom'>, number> = {
  dawn: 6.25,
  day: 12.5,
  dusk: 18.75,
  night: 22.5,
};

const KEYFRAMES: AtmosphereKeyframe[] = [
  {
    hour: 0.0,
    skyZenith: '#070f0b',
    skyMid: '#0f261d',
    skyHorizon: '#1b3f30',
    skyDeep: '#050b08',
    fogColor: '#12281f',
    hemiSky: '#86efac',
    hemiGround: '#1a3326',
    hemiIntensity: 0.9,
    keyColor: '#dbeafe',
    keyIntensity: 1.45,
    rimColor: '#7dd3fc',
    rimIntensity: 0.72,
    cloudTint: '#cfe8dd',
    cloudEmissive: '#34d399',
    cloudEmissiveIntensity: 0.14,
    fireflyOpacity: 0.94,
    starOpacity: 0.9,
    lanternIntensity: 0.95,
    moonOpacity: 0.95,
    sunOpacity: 0.0,
    exposure: 1.08,
    overlayTopRgba: [9, 18, 14, 0.18],
    overlayHorizonRgba: [16, 185, 129, 0.08],
  },
  {
    hour: 5.5,
    skyZenith: '#1a2742',
    skyMid: '#4c5f82',
    skyHorizon: '#f4a28c',
    skyDeep: '#15202b',
    fogColor: '#484a5e',
    hemiSky: '#fed7aa',
    hemiGround: '#2c4736',
    hemiIntensity: 1.08,
    keyColor: '#ffedd5',
    keyIntensity: 1.75,
    rimColor: '#fbcfe8',
    rimIntensity: 0.85,
    cloudTint: '#fde2d8',
    cloudEmissive: '#fda4af',
    cloudEmissiveIntensity: 0.22,
    fireflyOpacity: 0.45,
    starOpacity: 0.25,
    lanternIntensity: 0.65,
    moonOpacity: 0.25,
    sunOpacity: 0.65,
    exposure: 1.12,
    overlayTopRgba: [244, 162, 140, 0.07],
    overlayHorizonRgba: [251, 191, 36, 0.1],
  },
  {
    hour: 8.5,
    skyZenith: '#2a6f97',
    skyMid: '#63a9cc',
    skyHorizon: '#bee6d8',
    skyDeep: '#204d4a',
    fogColor: '#72aba5',
    hemiSky: '#e0f2fe',
    hemiGround: '#396b49',
    hemiIntensity: 1.32,
    keyColor: '#fffbeb',
    keyIntensity: 2.2,
    rimColor: '#bae6fd',
    rimIntensity: 0.78,
    cloudTint: '#f8fafc',
    cloudEmissive: '#e0f2fe',
    cloudEmissiveIntensity: 0.1,
    fireflyOpacity: 0.16,
    starOpacity: 0.0,
    lanternIntensity: 0.28,
    moonOpacity: 0.0,
    sunOpacity: 0.92,
    exposure: 1.15,
    overlayTopRgba: [186, 230, 253, 0.05],
    overlayHorizonRgba: [110, 231, 183, 0.04],
  },
  {
    hour: 13.0,
    skyZenith: '#2574a9',
    skyMid: '#6bb8de',
    skyHorizon: '#c9efe3',
    skyDeep: '#265c52',
    fogColor: '#82bdb5',
    hemiSky: '#f0f9ff',
    hemiGround: '#407550',
    hemiIntensity: 1.42,
    keyColor: '#fffef5',
    keyIntensity: 2.35,
    rimColor: '#a5f3fc',
    rimIntensity: 0.72,
    cloudTint: '#ffffff',
    cloudEmissive: '#f0f9ff',
    cloudEmissiveIntensity: 0.12,
    fireflyOpacity: 0.12,
    starOpacity: 0.0,
    lanternIntensity: 0.22,
    moonOpacity: 0.0,
    sunOpacity: 1.0,
    exposure: 1.16,
    overlayTopRgba: [224, 242, 254, 0.04],
    overlayHorizonRgba: [167, 243, 208, 0.04],
  },
  {
    hour: 17.5,
    skyZenith: '#2c4c70',
    skyMid: '#7d6c88',
    skyHorizon: '#f3b07c',
    skyDeep: '#28363d',
    fogColor: '#7a646e',
    hemiSky: '#fde68a',
    hemiGround: '#365840',
    hemiIntensity: 1.18,
    keyColor: '#fed7aa',
    keyIntensity: 2.05,
    rimColor: '#f9a8d4',
    rimIntensity: 0.85,
    cloudTint: '#ffe8d6',
    cloudEmissive: '#fdba74',
    cloudEmissiveIntensity: 0.24,
    fireflyOpacity: 0.42,
    starOpacity: 0.05,
    lanternIntensity: 0.6,
    moonOpacity: 0.1,
    sunOpacity: 0.85,
    exposure: 1.13,
    overlayTopRgba: [251, 146, 60, 0.07],
    overlayHorizonRgba: [244, 114, 182, 0.08],
  },
  {
    hour: 19.5,
    skyZenith: '#121d33',
    skyMid: '#373256',
    skyHorizon: '#c96f72',
    skyDeep: '#0d181a',
    fogColor: '#2d2b40',
    hemiSky: '#c4b5fd',
    hemiGround: '#243c2e',
    hemiIntensity: 1.0,
    keyColor: '#fdba74',
    keyIntensity: 1.65,
    rimColor: '#a78bfa',
    rimIntensity: 0.82,
    cloudTint: '#e9d5ff',
    cloudEmissive: '#c084fc',
    cloudEmissiveIntensity: 0.18,
    fireflyOpacity: 0.82,
    starOpacity: 0.55,
    lanternIntensity: 0.9,
    moonOpacity: 0.65,
    sunOpacity: 0.2,
    exposure: 1.1,
    overlayTopRgba: [139, 92, 246, 0.09],
    overlayHorizonRgba: [244, 114, 182, 0.08],
  },
  {
    hour: 21.5,
    skyZenith: '#09120e',
    skyMid: '#112b20',
    skyHorizon: '#1e4635',
    skyDeep: '#070e0b',
    fogColor: '#132b20',
    hemiSky: '#a7f3d0',
    hemiGround: '#1e3a2b',
    hemiIntensity: 0.96,
    keyColor: '#e0f2fe',
    keyIntensity: 1.5,
    rimColor: '#7dd3fc',
    rimIntensity: 0.75,
    cloudTint: '#d8f3ea',
    cloudEmissive: '#6ee7b7',
    cloudEmissiveIntensity: 0.14,
    fireflyOpacity: 0.92,
    starOpacity: 0.85,
    lanternIntensity: 0.95,
    moonOpacity: 0.92,
    sunOpacity: 0.0,
    exposure: 1.1,
    overlayTopRgba: [9, 18, 14, 0.15],
    overlayHorizonRgba: [16, 185, 129, 0.08],
  },
];

function lerpNum(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpHex(hexA: string, hexB: string, t: number): string {
  const a = parseInt(hexA.slice(1), 16);
  const b = parseInt(hexB.slice(1), 16);
  const ar = (a >> 16) & 255;
  const ag = (a >> 8) & 255;
  const ab = a & 255;
  const br = (b >> 16) & 255;
  const bg = (b >> 8) & 255;
  const bb = b & 255;
  const r = Math.round(lerpNum(ar, br, t));
  const g = Math.round(lerpNum(ag, bg, t));
  const bl = Math.round(lerpNum(ab, bb, t));
  return `#${((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1)}`;
}

function lerpRgba(
  a: [number, number, number, number],
  b: [number, number, number, number],
  t: number
): string {
  const r = Math.round(lerpNum(a[0], b[0], t));
  const g = Math.round(lerpNum(a[1], b[1], t));
  const bl = Math.round(lerpNum(a[2], b[2], t));
  const alpha = lerpNum(a[3], b[3], t).toFixed(3);
  return `rgba(${r}, ${g}, ${bl}, ${alpha})`;
}

export function getPhaseFromHour(hour: number): { phase: DayPhase; label: string } {
  const h = ((hour % 24) + 24) % 24;
  if (h >= 5 && h < 8) return { phase: 'dawn', label: 'Soft Dawn' };
  if (h >= 8 && h < 17) return { phase: 'day', label: 'Sunlit Day' };
  if (h >= 17 && h < 20.5) return { phase: 'dusk', label: 'Golden Dusk' };
  return { phase: 'night', label: 'Firefly Night' };
}

export function getLocalHourDecimal(date = new Date()): number {
  return date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
}

export function formatHourLabel(hour: number): string {
  const hNorm = ((hour % 24) + 24) % 24;
  const hh = Math.floor(hNorm);
  const mm = Math.floor((hNorm - hh) * 60);
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export function sampleAtmosphere(hourInput: number): SampledAtmosphere {
  const hour = ((hourInput % 24) + 24) % 24;

  let prev = KEYFRAMES[KEYFRAMES.length - 1];
  let next = KEYFRAMES[0];
  let span = 24 - prev.hour + next.hour;
  let elapsed = hour >= prev.hour ? hour - prev.hour : 24 - prev.hour + hour;

  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (hour >= KEYFRAMES[i].hour && hour < KEYFRAMES[i + 1].hour) {
      prev = KEYFRAMES[i];
      next = KEYFRAMES[i + 1];
      span = next.hour - prev.hour;
      elapsed = hour - prev.hour;
      break;
    }
  }

  const rawT = span > 0 ? elapsed / span : 0;
  // Smoothstep easing so transitions glide organically across twilight boundaries
  const t = rawT * rawT * (3 - 2 * rawT);

  const hemiIntensity = lerpNum(prev.hemiIntensity, next.hemiIntensity, t);
  const ambientPercent = Math.round(((hemiIntensity - 0.85) / (1.45 - 0.85)) * 60 + 40);
  const { phase, label } = getPhaseFromHour(hour);

  const topColor = lerpRgba(prev.overlayTopRgba, next.overlayTopRgba, t);
  const horizonColor = lerpRgba(prev.overlayHorizonRgba, next.overlayHorizonRgba, t);

  return {
    hour,
    phase,
    phaseLabel: label,
    ambientPercent: Math.max(25, Math.min(100, ambientPercent)),
    skyZenith: lerpHex(prev.skyZenith, next.skyZenith, t),
    skyMid: lerpHex(prev.skyMid, next.skyMid, t),
    skyHorizon: lerpHex(prev.skyHorizon, next.skyHorizon, t),
    skyDeep: lerpHex(prev.skyDeep, next.skyDeep, t),
    fogColor: lerpHex(prev.fogColor, next.fogColor, t),
    hemiSky: lerpHex(prev.hemiSky, next.hemiSky, t),
    hemiGround: lerpHex(prev.hemiGround, next.hemiGround, t),
    hemiIntensity,
    keyColor: lerpHex(prev.keyColor, next.keyColor, t),
    keyIntensity: lerpNum(prev.keyIntensity, next.keyIntensity, t),
    rimColor: lerpHex(prev.rimColor, next.rimColor, t),
    rimIntensity: lerpNum(prev.rimIntensity, next.rimIntensity, t),
    cloudTint: lerpHex(prev.cloudTint, next.cloudTint, t),
    cloudEmissive: lerpHex(prev.cloudEmissive, next.cloudEmissive, t),
    cloudEmissiveIntensity: lerpNum(
      prev.cloudEmissiveIntensity,
      next.cloudEmissiveIntensity,
      t
    ),
    fireflyOpacity: lerpNum(prev.fireflyOpacity, next.fireflyOpacity, t),
    starOpacity: lerpNum(prev.starOpacity, next.starOpacity, t),
    lanternIntensity: lerpNum(prev.lanternIntensity, next.lanternIntensity, t),
    moonOpacity: lerpNum(prev.moonOpacity, next.moonOpacity, t),
    sunOpacity: lerpNum(prev.sunOpacity, next.sunOpacity, t),
    exposure: lerpNum(prev.exposure, next.exposure, t),
    overlayGradient: `linear-gradient(180deg, ${topColor} 0%, rgba(0,0,0,0) 48%, ${horizonColor} 100%)`,
  };
}
