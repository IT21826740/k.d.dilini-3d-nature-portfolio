import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { WORLD_INTERACTABLES, WorldInteractable } from '../../data/worldData';
import { walkAudio } from '../../utils/walkAudio';
import { JoystickVector } from '../world/TouchControls';
import { SanctuaryErrorKind } from '../world/CuteErrorScreen';
import { SampledAtmosphere } from '../../utils/dayNightCycle';

export interface TeleportCommand {
  poiId: string;
  nonce: number;
}

export interface CameraActionCommand {
  type: 'zoom' | 'reset';
  delta?: number;
  nonce: number;
}

interface WalkableIslandCanvasProps {
  onNearbyInteractable: (poi: WorldInteractable | null) => void;
  onOpenInteractable: (poi: WorldInteractable) => void;
  isAnyModalOpen: boolean;
  teleportCommand: TeleportCommand | null;
  cameraAction: CameraActionCommand | null;
  joystickRef: React.MutableRefObject<JoystickVector>;
  atmosphereRef: React.MutableRefObject<SampledAtmosphere>;
  onLoadProgress: (progress: number, statusText: string) => void;
  onSceneReady: () => void;
  onSceneError: (kind: SanctuaryErrorKind, detail?: string) => void;
}

const TOP_RADIUS = 14.8;
const MAX_ISLAND_RADIUS = TOP_RADIUS - 1.3;

/** Deterministic smooth terrain elevation shared across island geometry, landmarks, and player physics */
function getTerrainHeight(x: number, z: number): number {
  const dist = Math.hypot(x, z);
  const gentleWave =
    Math.sin(x * 0.28) * Math.cos(z * 0.28) * 0.36 +
    Math.sin((x + z) * 0.18) * 0.14;
  const edgeRoll =
    dist > 11.2 ? -0.32 * Math.pow(Math.min(1, (dist - 11.2) / (TOP_RADIUS - 11.2)), 1.6) : 0;
  return 1.25 + gentleWave + edgeRoll;
}

/** Responsive vertical FOV & base camera distance tuned for portrait phones vs widescreen desktops */
function getResponsiveCameraConfig(aspect: number) {
  const safeAspect = Math.max(0.45, Math.min(2.4, aspect || 1));
  if (safeAspect < 1) {
    const portraitFactor = 1 - safeAspect;
    return {
      fov: THREE.MathUtils.clamp(50 + portraitFactor * 34, 50, 68),
      baseDistance: THREE.MathUtils.clamp(7.4 + portraitFactor * 4.4, 7.4, 9.8),
    };
  }
  return {
    fov: 50,
    baseDistance: 7.4,
  };
}

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl =
      (probeCanvas.getContext('webgl2') as WebGL2RenderingContext | null) ||
      (probeCanvas.getContext('webgl') as WebGLRenderingContext | null);
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

/** Procedural soft radial glow sprite texture for dreamy fireflies, mist, and contact shadows */
function createRadialGlowTexture(
  innerColor: string,
  midColor: string,
  outerColor = 'rgba(0,0,0,0)',
  size = 128
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const half = size / 2;
    const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
    grad.addColorStop(0, innerColor);
    grad.addColorStop(0.45, midColor);
    grad.addColorStop(1, outerColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/** Procedural smooth waterfall streak texture */
function createWaterfallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, 'rgba(186, 230, 253, 0.92)');
    grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.85)');
    grad.addColorStop(1, 'rgba(224, 242, 254, 0.45)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 256);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.48)';
    for (let i = 0; i < 24; i++) {
      const x = (i * 17) % 120;
      const y = (i * 37) % 210;
      const w = 2 + (i % 3);
      const h = 36 + (i % 5) * 14;
      ctx.fillRect(x, y, w, h);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/** Smooth rounded leaf blade geometry matching the Mint Leaf Spirit mascot */
function createLeafGeometry(length = 0.36, width = 0.16): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.quadraticCurveTo(width, length * 0.45, 0, length);
  shape.quadraticCurveTo(-width, length * 0.45, 0, 0);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.024,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 2,
    curveSegments: 10,
  });
  geo.center();
  return geo;
}

/** Smooth rounded-arch standing stone geometry */
function createArchMonolithGeometry(w = 0.56, h = 2.2, d = 0.34): THREE.ExtrudeGeometry {
  const hw = w / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-hw, 0);
  shape.lineTo(hw, 0);
  shape.lineTo(hw, h - hw);
  shape.absarc(0, h - hw, hw, 0, Math.PI, false);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: d,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.05,
    bevelSegments: 3,
    curveSegments: 12,
  });
  geo.translate(0, 0, -d / 2);
  return geo;
}

// Reusable math helpers outside the render loop (Zero-GC)
const _desiredCamPos = new THREE.Vector3();
const _desiredTargetPos = new THREE.Vector3();
const _tmpColor = new THREE.Color();
const _targetColor = new THREE.Color();

export const WalkableIslandCanvas: React.FC<WalkableIslandCanvasProps> = ({
  onNearbyInteractable,
  onOpenInteractable,
  isAnyModalOpen,
  teleportCommand,
  cameraAction,
  joystickRef,
  atmosphereRef,
  onLoadProgress,
  onSceneReady,
  onSceneError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const onNearbyRef = useRef(onNearbyInteractable);
  const onOpenRef = useRef(onOpenInteractable);
  const onProgressRef = useRef(onLoadProgress);
  const onReadyRef = useRef(onSceneReady);
  const onErrorRef = useRef(onSceneError);
  onNearbyRef.current = onNearbyInteractable;
  onOpenRef.current = onOpenInteractable;
  onProgressRef.current = onLoadProgress;
  onReadyRef.current = onSceneReady;
  onErrorRef.current = onSceneError;

  const isModalOpenRef = useRef(isAnyModalOpen);
  isModalOpenRef.current = isAnyModalOpen;

  // Player & Camera Refs
  const playerPos = useRef(new THREE.Vector3(0, getTerrainHeight(0, 7.2), 7.2));
  const playerAngle = useRef(Math.PI);
  const stepTimerRef = useRef(0);
  const hopVelocityRef = useRef(0);
  const hopOffsetRef = useRef(0);
  const nearbyPoiRef = useRef<WorldInteractable | null>(null);

  const cameraTarget = useRef(new THREE.Vector3(0, 2.3, 7.2));
  const cameraActual = useRef(new THREE.Vector3(0, 5.1, 14.5));
  const cameraOrbitYaw = useRef(0);
  const cameraOrbitYawTarget = useRef(0);
  const cameraOrbitPitch = useRef(0.32);
  const cameraOrbitPitchTarget = useRef(0.32);
  const cameraZoom = useRef(1.0);
  const cameraZoomTarget = useRef(1.0);

  const keysDown = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (isAnyModalOpen) {
      keysDown.current = {};
    }
  }, [isAnyModalOpen]);

  const teleportToPoi = useRef<(poi: WorldInteractable) => void>(() => {});

  useEffect(() => {
    if (!teleportCommand) return;
    const found = WORLD_INTERACTABLES.find((p) => p.id === teleportCommand.poiId);
    if (found) {
      teleportToPoi.current(found);
    }
  }, [teleportCommand]);

  useEffect(() => {
    if (!cameraAction) return;
    if (cameraAction.type === 'zoom' && typeof cameraAction.delta === 'number') {
      cameraZoomTarget.current = THREE.MathUtils.clamp(
        cameraZoomTarget.current + cameraAction.delta,
        0.72,
        1.45
      );
    } else if (cameraAction.type === 'reset') {
      cameraOrbitYawTarget.current = 0;
      cameraOrbitPitchTarget.current = 0.32;
      cameraZoomTarget.current = 1.0;
    }
  }, [cameraAction]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    onProgressRef.current(12, 'Checking WebGL graphics capabilities...');

    const probe = document.createElement('canvas');
    const hasWebGL = Boolean(
      probe.getContext('webgl2') ||
        probe.getContext('webgl') ||
        probe.getContext('experimental-webgl')
    );
    if (!hasWebGL) {
      onErrorRef.current(
        'webgl-unsupported',
        'No WebGL context available in this browser.'
      );
      return;
    }

    const isSoftwareGl = detectSoftwareWebGL();
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const disposables: Array<{ dispose: () => void }> = [];
    const track = <T extends { dispose: () => void }>(item: T): T => {
      disposables.push(item);
      return item;
    };

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch (err) {
      onErrorRef.current(
        'webgl-unsupported',
        err instanceof Error ? err.message : 'Unable to initialize WebGLRenderer.'
      );
      return;
    }

    onProgressRef.current(28, 'Painting twilight sky & soft fluffy clouds...');

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x132b20, 0.0115);

    const initW = container.clientWidth || window.innerWidth;
    const initH = container.clientHeight || window.innerHeight;
    let camConfig = getResponsiveCameraConfig(initW / Math.max(1, initH));

    const camera = new THREE.PerspectiveCamera(
      camConfig.fov,
      initW / Math.max(1, initH),
      0.1,
      700
    );
    camera.position.copy(cameraActual.current);

    renderer.setSize(initW, initH);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'none';
    container.appendChild(renderer.domElement);

    const maxAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy?.() || 1);

    // Procedural Studio Environment Reflection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();
    disposables.push(envTarget);

    // Procedural Soft Textures
    const fireflyGlowTex = track(
      createRadialGlowTexture(
        'rgba(255, 253, 224, 1)',
        'rgba(253, 224, 71, 0.45)',
        'rgba(253, 224, 71, 0)',
        128
      )
    );
    fireflyGlowTex.anisotropy = maxAnisotropy;

    const petalGlowTex = track(
      createRadialGlowTexture(
        'rgba(255, 241, 246, 0.95)',
        'rgba(249, 168, 212, 0.55)',
        'rgba(249, 168, 212, 0)',
        64
      )
    );

    const contactShadowTex = track(
      createRadialGlowTexture(
        'rgba(6, 22, 14, 0.42)',
        'rgba(6, 22, 14, 0.16)',
        'rgba(6, 22, 14, 0)',
        128
      )
    );

    const waterfallTex = track(createWaterfallTexture());
    waterfallTex.anisotropy = maxAnisotropy;

    // ==========================================
    // 1. DYNAMIC DAY/NIGHT SKY SHADER, CELESTIALS & CLOUDS
    // ==========================================
    const initAtmo = atmosphereRef.current;
    scene.fog = new THREE.FogExp2(initAtmo.fogColor, 0.0112);

    const skyGeo = track(new THREE.SphereGeometry(240, 36, 26));
    const skyUniforms = {
      uZenith: { value: new THREE.Color(initAtmo.skyZenith) },
      uMid: { value: new THREE.Color(initAtmo.skyMid) },
      uHorizon: { value: new THREE.Color(initAtmo.skyHorizon) },
      uDeep: { value: new THREE.Color(initAtmo.skyDeep) },
      uStarOpacity: { value: initAtmo.starOpacity },
      uTime: { value: 0 },
    };

    const skyMat = track(
      new THREE.ShaderMaterial({
        uniforms: skyUniforms,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        vertexShader: `
          varying vec3 vWorldDir;
          void main() {
            vWorldDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vWorldDir;
          uniform vec3 uZenith;
          uniform vec3 uMid;
          uniform vec3 uHorizon;
          uniform vec3 uDeep;
          uniform float uStarOpacity;
          uniform float uTime;

          float hash21(vec2 p) {
            p = fract(p * vec2(123.34, 456.21));
            p += dot(p, p + 45.32);
            return fract(p.x * p.y);
          }

          void main() {
            float y = vWorldDir.y;
            vec3 col;
            if (y >= 0.28) {
              float t = clamp((y - 0.28) / 0.72, 0.0, 1.0);
              col = mix(uMid, uZenith, smoothstep(0.0, 1.0, t));
            } else if (y >= -0.08) {
              float t = (y + 0.08) / 0.36;
              col = mix(uHorizon, uMid, smoothstep(0.0, 1.0, t));
            } else {
              float t = clamp((-0.08 - y) / 0.52, 0.0, 1.0);
              col = mix(uHorizon, uDeep, smoothstep(0.0, 1.0, t));
            }

            if (uStarOpacity > 0.02 && y > 0.06) {
              float phi = atan(vWorldDir.z, vWorldDir.x);
              float theta = asin(clamp(y, -1.0, 1.0));
              vec2 uvGrid = vec2(phi * 16.0, theta * 16.0);
              vec2 cell = floor(uvGrid);
              vec2 f = fract(uvGrid) - 0.5;
              float rnd = hash21(cell);
              if (rnd > 0.91) {
                vec2 offset = vec2(hash21(cell + 7.1), hash21(cell + 19.3)) - 0.5;
                float dist = length(f - offset * 0.5);
                float star = smoothstep(0.11, 0.0, dist);
                float twinkle = 0.65 + 0.35 * sin(uTime * 2.4 + rnd * 40.0);
                float horizonFade = smoothstep(0.06, 0.32, y);
                col += vec3(0.95, 0.97, 0.88) * star * twinkle * uStarOpacity * horizonFade * 0.85;
              }
            }

            gl_FragColor = vec4(col, 1.0);
          }
        `,
      })
    );
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyDome);

    // Distant Glowing Moon (Night / Twilight)
    const moonGroup = new THREE.Group();
    moonGroup.position.set(-48, 42, -78);
    scene.add(moonGroup);

    const moonBodyMat = track(
      new THREE.MeshBasicMaterial({
        color: 0xfef3c7,
        transparent: true,
        opacity: initAtmo.moonOpacity,
        fog: false,
      })
    );
    const moonMesh = new THREE.Mesh(
      track(new THREE.SphereGeometry(4.0, 24, 24)),
      moonBodyMat
    );
    moonGroup.add(moonMesh);

    const moonHaloMat = track(
      new THREE.SpriteMaterial({
        map: fireflyGlowTex,
        color: 0xfde68a,
        transparent: true,
        opacity: initAtmo.moonOpacity * 0.45,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
      })
    );
    const moonHalo = new THREE.Sprite(moonHaloMat);
    moonHalo.scale.set(22, 22, 1);
    moonGroup.add(moonHalo);

    // Warm Daytime Sun Orb + Halo
    const sunOrbGroup = new THREE.Group();
    sunOrbGroup.position.set(48, 38, -68);
    scene.add(sunOrbGroup);

    const sunBodyMat = track(
      new THREE.MeshBasicMaterial({
        color: 0xfffbeb,
        transparent: true,
        opacity: initAtmo.sunOpacity,
        fog: false,
      })
    );
    const sunOrbMesh = new THREE.Mesh(
      track(new THREE.SphereGeometry(4.6, 24, 24)),
      sunBodyMat
    );
    sunOrbGroup.add(sunOrbMesh);

    const sunHaloMat = track(
      new THREE.SpriteMaterial({
        map: fireflyGlowTex,
        color: 0xfde68a,
        transparent: true,
        opacity: initAtmo.sunOpacity * 0.65,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
      })
    );
    const sunHalo = new THREE.Sprite(sunHaloMat);
    sunHalo.scale.set(28, 28, 1);
    sunOrbGroup.add(sunHalo);

    // Fluffy floating clouds orbiting calmly around the island
    const cloudMat = track(
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(initAtmo.cloudTint),
        emissive: new THREE.Color(initAtmo.cloudEmissive),
        emissiveIntensity: initAtmo.cloudEmissiveIntensity,
        roughness: 0.92,
        metalness: 0.0,
      })
    );
    const cloudPuffGeo = track(new THREE.SphereGeometry(1, 16, 14));
    const floatingClouds: Array<{
      group: THREE.Group;
      radius: number;
      baseY: number;
      angle: number;
      speed: number;
    }> = [];

    const cloudConfigs = [
      { angle: 0.4, radius: 24, y: 8.5, scale: 1.1, speed: 0.022 },
      { angle: 1.7, radius: 27, y: 11.2, scale: 1.35, speed: 0.017 },
      { angle: 3.1, radius: 22, y: 6.8, scale: 0.95, speed: 0.026 },
      { angle: 4.5, radius: 28, y: 10.0, scale: 1.25, speed: 0.019 },
      { angle: 5.5, radius: 25, y: 7.5, scale: 1.0, speed: 0.024 },
    ];
    const puffOffsets: Array<[number, number, number, number]> = [
      [0, 0.25, 0, 1.15],
      [-1.1, 0.05, 0.15, 0.88],
      [1.15, 0.08, -0.1, 0.92],
      [-0.5, -0.05, 0.65, 0.72],
      [0.55, -0.05, -0.58, 0.75],
    ];

    cloudConfigs.forEach((cfg) => {
      const cGroup = new THREE.Group();
      puffOffsets.forEach(([px, py, pz, ps]) => {
        const puff = new THREE.Mesh(cloudPuffGeo, cloudMat);
        puff.position.set(px, py, pz);
        puff.scale.set(ps * 1.15, ps * 0.78, ps * 0.95);
        cGroup.add(puff);
      });
      cGroup.scale.setScalar(cfg.scale);
      scene.add(cGroup);
      floatingClouds.push({
        group: cGroup,
        radius: cfg.radius,
        baseY: cfg.y,
        angle: cfg.angle,
        speed: cfg.speed,
      });
    });

    // ==========================================
    // 2. WARM & COZY 3-POINT LIGHTING RIG
    // ==========================================
    const hemiLight = new THREE.HemisphereLight(0xa7f3d0, 0x1e3a2b, 1.05);
    scene.add(hemiLight);

    const sun = new THREE.DirectionalLight(0xfff5d6, 2.05);
    sun.position.set(22, 36, 20);
    sun.castShadow = !isSoftwareGl;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 110;
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -20;
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.02;
    scene.add(sun);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.75);
    rimLight.position.set(-18, 14, -22);
    scene.add(rimLight);

    onProgressRef.current(48, 'Spreading velvety moss & garden stepping stones...');

    // ==========================================
    // 3. SMOOTH FLOATING ISLAND & STEPPING STONES
    // ==========================================
    const island = new THREE.Group();
    scene.add(island);

    // Smooth vertex-colored mossy meadow terrain
    const grassGeo = track(
      new THREE.CylinderGeometry(TOP_RADIUS, TOP_RADIUS * 0.93, 2.6, 72, 10)
    );
    const grassPos = grassGeo.attributes.position;
    const grassColors = new Float32Array(grassPos.count * 3);
    const mossDeep = new THREE.Color(0x4d8853);
    const mossBright = new THREE.Color(0x65a86a);
    const mossHighlight = new THREE.Color(0x7bc27e);

    for (let i = 0; i < grassPos.count; i++) {
      const x = grassPos.getX(i);
      const y = grassPos.getY(i);
      const z = grassPos.getZ(i);
      const dist = Math.hypot(x, z);

      if (y > 0.35) {
        const h = getTerrainHeight(x, z);
        grassPos.setY(i, h);
        const radialBlend = THREE.MathUtils.clamp(1 - dist / TOP_RADIUS, 0, 1);
        const waveTint = (Math.sin(x * 0.35) * Math.cos(z * 0.35) + 1) * 0.5;
        _tmpColor
          .copy(mossDeep)
          .lerp(mossBright, radialBlend * 0.75 + waveTint * 0.25)
          .lerp(mossHighlight, Math.max(0, waveTint - 0.55) * 0.45);
      } else {
        _tmpColor.copy(mossDeep).multiplyScalar(0.8);
      }
      grassColors[i * 3] = _tmpColor.r;
      grassColors[i * 3 + 1] = _tmpColor.g;
      grassColors[i * 3 + 2] = _tmpColor.b;
    }
    grassGeo.setAttribute('color', new THREE.BufferAttribute(grassColors, 3));
    grassGeo.computeVertexNormals();

    const grassMat = track(
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.88,
        metalness: 0.02,
      })
    );
    const grassMesh = new THREE.Mesh(grassGeo, grassMat);
    grassMesh.receiveShadow = true;
    grassMesh.castShadow = true;
    island.add(grassMesh);

    // Smooth rounded mossy rim hugging the edge of the island
    const mossRimGeo = track(new THREE.TorusGeometry(TOP_RADIUS - 0.25, 0.42, 12, 64));
    mossRimGeo.rotateX(Math.PI / 2);
    const mossRimMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x569a5c,
        roughness: 0.85,
        metalness: 0.02,
      })
    );
    const mossRimMesh = new THREE.Mesh(mossRimGeo, mossRimMat);
    mossRimMesh.position.y = 0.85;
    mossRimMesh.receiveShadow = true;
    island.add(mossRimMesh);

    // Rounded rocky cliff underbelly + glowing crystal roots underneath
    const cliffGeo = track(new THREE.ConeGeometry(TOP_RADIUS * 0.91, 14.5, 36, 8));
    cliffGeo.rotateX(Math.PI);
    const cliffPos = cliffGeo.attributes.position;
    for (let i = 0; i < cliffPos.count; i++) {
      const cx = cliffPos.getX(i);
      const cy = cliffPos.getY(i);
      const cz = cliffPos.getZ(i);
      const bump = 1 + Math.sin(cx * 0.45 + cy * 0.35) * 0.05 + Math.cos(cz * 0.5) * 0.04;
      cliffPos.setX(i, cx * bump);
      cliffPos.setZ(i, cz * bump);
    }
    cliffGeo.computeVertexNormals();

    const cliffMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x3f3833,
        roughness: 0.94,
        metalness: 0.04,
      })
    );
    const cliffMesh = new THREE.Mesh(cliffGeo, cliffMat);
    cliffMesh.position.y = -7.8;
    cliffMesh.receiveShadow = true;
    cliffMesh.castShadow = true;
    island.add(cliffMesh);

    // Tiny glowing sanctuary crystals sprouting beneath the floating island
    const crystalMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x6ee7b7,
        emissive: 0x10b981,
        emissiveIntensity: 0.75,
        roughness: 0.2,
        metalness: 0.35,
      })
    );
    const crystalGeo = track(new THREE.OctahedronGeometry(0.55, 0));
    const crystalPositions: Array<[number, number, number, number]> = [
      [0, -14.8, 0, 1.3],
      [-4.2, -9.2, 3.1, 0.75],
      [5.1, -8.5, -2.5, 0.82],
      [-2.1, -10.8, -4.4, 0.7],
    ];
    crystalPositions.forEach(([x, y, z, s]) => {
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.set(x, y, z);
      crystal.scale.set(s * 0.65, s * 1.6, s * 0.65);
      island.add(crystal);
    });

    // Cozy Stepping-Stone Garden Paths grounded flush on the curved terrain
    const steppingStoneCurves = [
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 8.2),
        new THREE.Vector3(0, 0, 5.2),
        new THREE.Vector3(0, 0, 1.5),
        new THREE.Vector3(0, 0, -2.2),
        new THREE.Vector3(0, 0, -5.2),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 2.2),
        new THREE.Vector3(-2.3, 0, 0.5),
        new THREE.Vector3(-4.2, 0, -1.7),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 1.6),
        new THREE.Vector3(2.8, 0, 0.6),
        new THREE.Vector3(5.6, 0, -0.4),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.4, 0, 4.4),
        new THREE.Vector3(2.0, 0, 4.2),
        new THREE.Vector3(3.3, 0, 4.0),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.4, 0, 4.5),
        new THREE.Vector3(-2.5, 0, 4.3),
        new THREE.Vector3(-4.6, 0, 4.0),
      ]),
    ];

    const stonePaverGeo = track(new THREE.CylinderGeometry(0.48, 0.54, 0.14, 14));
    const stonePaverColors = [0xd6d3d1, 0xe7e5e4, 0xc7c2bc];
    const paverPoints: Array<{ x: number; z: number; rot: number; scale: number; tint: number }> = [];

    steppingStoneCurves.forEach((curve, cIdx) => {
      const count = cIdx === 0 ? 11 : 5;
      for (let i = 0; i <= count; i++) {
        const pt = curve.getPoint(i / count);
        // Skip overlap right on center monuments
        if (Math.hypot(pt.x - 0, pt.z - 5) < 1.5 && cIdx > 0) continue;
        paverPoints.push({
          x: pt.x + Math.sin(i * 2.1 + cIdx) * 0.12,
          z: pt.z + Math.cos(i * 1.7 + cIdx) * 0.1,
          rot: i * 0.8 + cIdx,
          scale: 0.85 + ((i + cIdx) % 3) * 0.14,
          tint: stonePaverColors[(i + cIdx) % stonePaverColors.length],
        });
      }
    });

    const paverMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.9,
        metalness: 0.04,
      })
    );
    const paverInstanced = new THREE.InstancedMesh(stonePaverGeo, paverMat, paverPoints.length);
    paverInstanced.receiveShadow = true;
    const dummy = new THREE.Object3D();

    paverPoints.forEach((p, idx) => {
      const py = getTerrainHeight(p.x, p.z) + 0.02;
      dummy.position.set(p.x, py, p.z);
      dummy.rotation.set(0, p.rot, 0);
      dummy.scale.set(p.scale, 1, p.scale * 0.88);
      dummy.updateMatrix();
      paverInstanced.setMatrixAt(idx, dummy.matrix);
      _tmpColor.setHex(p.tint);
      paverInstanced.setColorAt(idx, _tmpColor);
    });
    paverInstanced.instanceMatrix.needsUpdate = true;
    if (paverInstanced.instanceColor) paverInstanced.instanceColor.needsUpdate = true;
    paverInstanced.computeBoundingSphere();
    island.add(paverInstanced);

    onProgressRef.current(68, 'Growing blossom oak, lily pond & cozy landmarks...');

    // ==========================================
    // 4. SHARED CRAFTED MATERIALS & LANDMARKS
    // ==========================================
    const warmWoodMat = track(
      new THREE.MeshStandardMaterial({ color: 0x6b4c35, roughness: 0.86 })
    );
    const softStoneMat = track(
      new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.88 })
    );
    const darkStoneMat = track(
      new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.9 })
    );
    const warmGoldMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xd97706,
        emissiveIntensity: 0.25,
        roughness: 0.28,
        metalness: 0.82,
      })
    );
    const paperLanternMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xfef3c7,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.85,
        roughness: 0.35,
      })
    );
    const sageLeafMat = track(
      new THREE.MeshStandardMaterial({ color: 0x4d8853, roughness: 0.78 })
    );
    const mintLeafMat = track(
      new THREE.MeshStandardMaterial({ color: 0x65a86a, roughness: 0.75 })
    );
    const sakuraMat = track(
      new THREE.MeshStandardMaterial({ color: 0xf9a8d4, roughness: 0.72 })
    );
    const sakuraLightMat = track(
      new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.7 })
    );

    // ---------------------------------------------------------
    // LANDMARK 1: Dilini's Hermitage & Monument [0, y, 5]
    // ---------------------------------------------------------
    const profileMonument = new THREE.Group();
    profileMonument.position.set(0, getTerrainHeight(0, 5) - 0.06, 5);
    island.add(profileMonument);

    const daisBase = new THREE.Mesh(
      track(new THREE.CylinderGeometry(1.55, 1.75, 0.28, 24)),
      darkStoneMat
    );
    daisBase.position.y = 0.14;
    daisBase.receiveShadow = true;
    profileMonument.add(daisBase);

    const daisTop = new THREE.Mesh(
      track(new THREE.CylinderGeometry(1.2, 1.35, 0.18, 24)),
      softStoneMat
    );
    daisTop.position.y = 0.36;
    daisTop.receiveShadow = true;
    profileMonument.add(daisTop);

    const pedestalCol = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.32, 0.44, 0.72, 16)),
      softStoneMat
    );
    pedestalCol.position.y = 0.8;
    pedestalCol.castShadow = true;
    profileMonument.add(pedestalCol);

    const beaconMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x6ee7b7,
        emissive: 0x10b981,
        emissiveIntensity: 0.8,
        roughness: 0.18,
        metalness: 0.7,
      })
    );
    const beacon = new THREE.Mesh(track(new THREE.OctahedronGeometry(0.42, 1)), beaconMat);
    beacon.position.y = 1.68;
    profileMonument.add(beacon);

    const beaconRing = new THREE.Mesh(
      track(new THREE.TorusGeometry(0.62, 0.035, 10, 32)),
      warmGoldMat
    );
    beaconRing.position.y = 1.68;
    profileMonument.add(beaconRing);

    // Cozy garden lanterns flanking the dais
    const miniPostGeo = track(new THREE.CylinderGeometry(0.06, 0.08, 0.65, 10));
    const miniLanternGeo = track(new THREE.SphereGeometry(0.14, 12, 10));
    [-1.4, 1.4].forEach((lx) => {
      const post = new THREE.Mesh(miniPostGeo, warmWoodMat);
      post.position.set(lx, 0.32, 0.6);
      profileMonument.add(post);

      const orb = new THREE.Mesh(miniLanternGeo, paperLanternMat);
      orb.position.set(lx, 0.7, 0.6);
      profileMonument.add(orb);
    });

    // ---------------------------------------------------------
    // LANDMARK 2: Ancient Architecture Tree [-4.5, y, -2]
    // ---------------------------------------------------------
    const treeGroup = new THREE.Group();
    treeGroup.position.set(-4.5, getTerrainHeight(-4.5, -2) - 0.12, -2);
    island.add(treeGroup);

    const treeTrunk = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.75, 1.45, 5.2, 16)),
      warmWoodMat
    );
    treeTrunk.position.y = 2.55;
    treeTrunk.castShadow = true;
    treeTrunk.receiveShadow = true;
    treeGroup.add(treeTrunk);

    // Root flares
    const rootGeo = track(new THREE.CylinderGeometry(0.22, 0.45, 1.4, 10));
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + 0.35;
      const root = new THREE.Mesh(rootGeo, warmWoodMat);
      root.position.set(Math.cos(a) * 1.15, 0.55, Math.sin(a) * 1.15);
      root.rotation.z = -Math.cos(a) * 0.55;
      root.rotation.x = Math.sin(a) * 0.55;
      treeGroup.add(root);
    }

    // Lush fluffy cloud-like canopy puffs (pink cherry blossom + mint sage)
    const canopyPuffs: Array<[number, number, number, number, THREE.Material]> = [
      [0, 5.6, 0, 2.75, sageLeafMat],
      [-1.7, 5.3, 0.8, 2.05, mintLeafMat],
      [1.8, 5.2, -0.7, 2.15, sakuraMat],
      [0.6, 6.8, 0.7, 2.25, sakuraLightMat],
      [-0.9, 6.6, -0.8, 2.1, sakuraMat],
      [0, 7.6, 0, 1.75, sakuraLightMat],
    ];
    const puffGeo = track(new THREE.SphereGeometry(1, 18, 16));
    canopyPuffs.forEach(([px, py, pz, pr, mat]) => {
      const puff = new THREE.Mesh(puffGeo, mat);
      puff.position.set(px, py, pz);
      puff.scale.set(pr * 1.1, pr * 0.88, pr * 1.05);
      puff.castShadow = true;
      puff.receiveShadow = true;
      treeGroup.add(puff);
    });

    // Hanging fairy lanterns beneath oak canopy
    const hangingLanterns: THREE.Group[] = [];
    const lanternChordGeo = track(new THREE.CylinderGeometry(0.015, 0.015, 0.8, 6));
    const lanternBodyGeo = track(new THREE.SphereGeometry(0.2, 12, 12));
    [
      [-1.9, 4.5, 1.3],
      [2.0, 4.4, 0.9],
    ].forEach(([lx, ly, lz]) => {
      const hGroup = new THREE.Group();
      hGroup.position.set(lx, ly, lz);

      const cord = new THREE.Mesh(lanternChordGeo, warmWoodMat);
      cord.position.y = -0.4;
      hGroup.add(cord);

      const glowBall = new THREE.Mesh(lanternBodyGeo, paperLanternMat);
      glowBall.position.y = -0.85;
      glowBall.scale.set(0.95, 1.15, 0.95);
      hGroup.add(glowBall);

      treeGroup.add(hGroup);
      hangingLanterns.push(hGroup);
    });

    // ---------------------------------------------------------
    // LANDMARK 3: Cascade of Streaming APIs (Pond + Bridge + Cliff Fall)
    // ---------------------------------------------------------
    const pondPos = [7.5, getTerrainHeight(7.5, -1) - 0.08, -1] as const;
    const waterfallGroup = new THREE.Group();
    waterfallGroup.position.set(pondPos[0], pondPos[1], pondPos[2]);
    island.add(waterfallGroup);

    const waterMat = track(
      new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.28,
        transmission: isSoftwareGl ? 0 : 0.45,
        transparent: true,
        opacity: isSoftwareGl ? 0.75 : 0.9,
        roughness: 0.1,
        ior: 1.33,
      })
    );

    const pond = new THREE.Mesh(
      track(new THREE.CylinderGeometry(2.55, 2.3, 0.28, 28)),
      waterMat
    );
    pond.position.set(0, 0.08, 0);
    waterfallGroup.add(pond);

    // Smooth pebble shoreline ring around pond
    const pebbleGeo = track(new THREE.SphereGeometry(0.32, 12, 10));
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI * 2) / 16;
      if (Math.abs(a) < 0.38) continue; // opening for eastern stream outflow
      const pebble = new THREE.Mesh(pebbleGeo, i % 2 === 0 ? softStoneMat : darkStoneMat);
      pebble.position.set(Math.cos(a) * 2.55, 0.14, Math.sin(a) * 2.55);
      pebble.scale.set(1.2, 0.55, 0.95);
      pebble.rotation.y = a;
      waterfallGroup.add(pebble);
    }

    // Stream channel flowing from pond edge out to the island cliff edge (x = +6.9 local -> ~14.4 world)
    const streamMesh = new THREE.Mesh(
      track(new THREE.BoxGeometry(5.2, 0.18, 1.55)),
      waterMat
    );
    streamMesh.position.set(4.5, 0.02, 0);
    waterfallGroup.add(streamMesh);

    // Shimmering waterfall curtain spilling cleanly off the eastern cliff edge
    const fallGeo = track(new THREE.PlaneGeometry(1.75, 14.5, 6, 20));
    fallGeo.rotateY(Math.PI / 2);
    const fallMat = track(
      new THREE.MeshStandardMaterial({
        map: waterfallTex,
        color: 0xbae6fd,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.86,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    const fallMesh = new THREE.Mesh(fallGeo, fallMat);
    fallMesh.position.set(7.15, -7.1, 0);
    waterfallGroup.add(fallMesh);

    // Cute floating lily pads + tiny pink lotus flowers
    const lilyMat = track(
      new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.65 })
    );
    const lotusMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xf9a8d4,
        emissive: 0xf472b6,
        emissiveIntensity: 0.25,
        roughness: 0.5,
      })
    );
    const lilyGeo = track(new THREE.CylinderGeometry(0.36, 0.36, 0.04, 16, 1, false, 0, Math.PI * 1.8));
    const lotusGeo = track(new THREE.SphereGeometry(0.14, 10, 8));
    const lilyPads: THREE.Group[] = [];
    [
      [-0.9, 0.24, 0.7],
      [0.8, 0.24, -0.95],
      [-0.4, 0.24, -1.1],
    ].forEach(([lx, ly, lz], idx) => {
      const lGroup = new THREE.Group();
      lGroup.position.set(lx, ly, lz);
      const pad = new THREE.Mesh(lilyGeo, lilyMat);
      pad.rotation.y = idx * 1.4;
      lGroup.add(pad);
      if (idx < 2) {
        const flower = new THREE.Mesh(lotusGeo, lotusMat);
        flower.position.y = 0.08;
        flower.scale.set(1.1, 0.7, 1.1);
        lGroup.add(flower);
      }
      waterfallGroup.add(lGroup);
      lilyPads.push(lGroup);
    });

    // Cute curved wooden footbridge beside pond
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(2.8, 0.25, 0);
    const plankGeo = track(new THREE.BoxGeometry(0.32, 0.08, 2.25));
    for (let i = -3; i <= 3; i++) {
      const plank = new THREE.Mesh(plankGeo, warmWoodMat);
      const arcY = Math.cos((i / 3.5) * (Math.PI / 2)) * 0.42;
      plank.position.set(i * 0.34, arcY, 0);
      plank.rotation.z = -i * 0.08;
      plank.castShadow = true;
      bridgeGroup.add(plank);
    }
    const bridgePostGeo = track(new THREE.CylinderGeometry(0.06, 0.07, 0.7, 8));
    [-1.0, 1.0].forEach((bx) => {
      [-1.05, 1.05].forEach((bz) => {
        const bPost = new THREE.Mesh(bridgePostGeo, warmWoodMat);
        bPost.position.set(bx, 0.5, bz);
        bridgeGroup.add(bPost);
      });
    });
    waterfallGroup.add(bridgeGroup);

    // ---------------------------------------------------------
    // LANDMARK 4: Monoliths of Accreditation [3.5, y, 4]
    // ---------------------------------------------------------
    const stoneGroup = new THREE.Group();
    stoneGroup.position.set(3.5, getTerrainHeight(3.5, 4) - 0.08, 4);
    island.add(stoneGroup);

    const archGeo = track(createArchMonolithGeometry(0.54, 1.95, 0.3));
    const runicCrystalMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xc4b5fd,
        emissive: 0x8b5cf6,
        emissiveIntensity: 0.65,
        roughness: 0.25,
        metalness: 0.45,
      })
    );
    const runeInlayGeo = track(new THREE.OctahedronGeometry(0.14, 0));

    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const arch = new THREE.Mesh(archGeo, i % 2 === 0 ? softStoneMat : darkStoneMat);
      arch.position.set(Math.cos(angle) * 2.05, 0, Math.sin(angle) * 2.05);
      arch.rotation.y = -angle + Math.PI / 2;
      arch.castShadow = true;
      stoneGroup.add(arch);

      const inlay = new THREE.Mesh(runeInlayGeo, runicCrystalMat);
      inlay.position.set(Math.cos(angle) * 2.05, 1.35, Math.sin(angle) * 2.05);
      inlay.scale.set(0.8, 1.4, 0.8);
      stoneGroup.add(inlay);
    }

    // ---------------------------------------------------------
    // LANDMARK 5: Campfire of Innovation [-5, y, 4]
    // ---------------------------------------------------------
    const campGroup = new THREE.Group();
    campGroup.position.set(-5, getTerrainHeight(-5, 4) - 0.05, 4);
    island.add(campGroup);

    const campStoneGeo = track(new THREE.SphereGeometry(0.2, 10, 8));
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI * 2) / 10;
      const st = new THREE.Mesh(campStoneGeo, i % 2 === 0 ? softStoneMat : darkStoneMat);
      st.position.set(Math.cos(a) * 0.82, 0.1, Math.sin(a) * 0.82);
      st.scale.set(1.15, 0.65, 1.0);
      campGroup.add(st);
    }

    const logGeo = track(new THREE.CylinderGeometry(0.08, 0.09, 0.95, 8));
    for (let i = 0; i < 4; i++) {
      const log = new THREE.Mesh(logGeo, warmWoodMat);
      log.rotation.z = Math.PI / 4.2;
      log.rotation.y = (i * Math.PI) / 2;
      log.position.y = 0.2;
      campGroup.add(log);
    }

    const fireLight = new THREE.PointLight(0xfb923c, 2.5, 11);
    fireLight.position.set(0, 1.0, 0);
    campGroup.add(fireLight);

    const outerFlameMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xf97316,
        emissive: 0xea580c,
        emissiveIntensity: 0.95,
        roughness: 0.2,
      })
    );
    const innerFlameMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xfbbf24,
        emissiveIntensity: 1.1,
        roughness: 0.15,
      })
    );
    const flameGroup = new THREE.Group();
    flameGroup.position.y = 0.42;
    const outerFlame = new THREE.Mesh(track(new THREE.ConeGeometry(0.3, 0.72, 12)), outerFlameMat);
    outerFlame.position.y = 0.15;
    flameGroup.add(outerFlame);
    const innerFlame = new THREE.Mesh(track(new THREE.ConeGeometry(0.17, 0.46, 10)), innerFlameMat);
    innerFlame.position.y = 0.08;
    flameGroup.add(innerFlame);
    campGroup.add(flameGroup);

    // Cute tree-stump seats beside campfire
    const stumpGeo = track(new THREE.CylinderGeometry(0.32, 0.36, 0.44, 12));
    const stumpTopMat = track(
      new THREE.MeshStandardMaterial({ color: 0xe7d3b5, roughness: 0.8 })
    );
    const stumpTopGeo = track(new THREE.CylinderGeometry(0.28, 0.28, 0.05, 12));
    [
      [-1.45, 0.22, -0.6],
      [1.35, 0.22, 0.85],
    ].forEach(([sx, sy, sz]) => {
      const stump = new THREE.Mesh(stumpGeo, warmWoodMat);
      stump.position.set(sx, sy, sz);
      stump.castShadow = true;
      campGroup.add(stump);

      const topRing = new THREE.Mesh(stumpTopGeo, stumpTopMat);
      topRing.position.set(sx, sy + 0.23, sz);
      campGroup.add(topRing);
    });

    // ---------------------------------------------------------
    // LANDMARK 6: Pavilion of Inquiries [0, y, -5.5]
    // ---------------------------------------------------------
    const shrineGroup = new THREE.Group();
    shrineGroup.position.set(0, getTerrainHeight(0, -5.5) - 0.08, -5.5);
    island.add(shrineGroup);

    const shrineBase = new THREE.Mesh(
      track(new THREE.CylinderGeometry(2.15, 2.35, 0.38, 24)),
      softStoneMat
    );
    shrineBase.position.y = 0.19;
    shrineBase.receiveShadow = true;
    shrineGroup.add(shrineBase);

    const shrineInnerFloor = new THREE.Mesh(
      track(new THREE.CylinderGeometry(1.85, 1.85, 0.1, 24)),
      stumpTopMat
    );
    shrineInnerFloor.position.y = 0.42;
    shrineGroup.add(shrineInnerFloor);

    const pillarGeo = track(new THREE.CylinderGeometry(0.11, 0.14, 2.55, 12));
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const pillar = new THREE.Mesh(pillarGeo, warmWoodMat);
      pillar.position.set(Math.cos(angle) * 1.45, 1.65, Math.sin(angle) * 1.45);
      pillar.castShadow = true;
      shrineGroup.add(pillar);
    }

    const shrineRoofMat = track(
      new THREE.MeshStandardMaterial({ color: 0xe15b64, roughness: 0.65 })
    );
    const roofTier1 = new THREE.Mesh(
      track(new THREE.ConeGeometry(2.55, 0.95, 20)),
      shrineRoofMat
    );
    roofTier1.position.y = 3.25;
    roofTier1.castShadow = true;
    shrineGroup.add(roofTier1);

    const roofTier2 = new THREE.Mesh(
      track(new THREE.ConeGeometry(1.45, 0.72, 20)),
      shrineRoofMat
    );
    roofTier2.position.y = 3.92;
    shrineGroup.add(roofTier2);

    const shrineFinial = new THREE.Mesh(
      track(new THREE.SphereGeometry(0.22, 14, 14)),
      warmGoldMat
    );
    shrineFinial.position.y = 4.35;
    shrineGroup.add(shrineFinial);

    const shrineLantern = new THREE.Mesh(
      track(new THREE.SphereGeometry(0.28, 14, 14)),
      paperLanternMat
    );
    shrineLantern.position.y = 2.45;
    shrineLantern.scale.set(1, 1.2, 1);
    shrineGroup.add(shrineLantern);

    // Ground Beacon Rings + Floating Gems + Layer-1 Hitboxes for All POIs
    const poiMarkers: Array<{
      poi: WorldInteractable;
      ring: THREE.Mesh;
      diamond: THREE.Mesh;
      light: THREE.PointLight;
    }> = [];
    const poiHitboxes: THREE.Mesh[] = [];
    const hitboxGeo = track(new THREE.CylinderGeometry(1.9, 1.9, 3.8, 12));
    const hitboxMat = track(new THREE.MeshBasicMaterial({ visible: false }));
    const diamondGeo = track(new THREE.OctahedronGeometry(0.36, 1));

    WORLD_INTERACTABLES.forEach((poi) => {
      const groundY = getTerrainHeight(poi.worldPos[0], poi.worldPos[2]);
      const pGroup = new THREE.Group();
      pGroup.position.set(poi.worldPos[0], groundY + 0.09, poi.worldPos[2]);
      island.add(pGroup);

      const ringGeo = track(new THREE.RingGeometry(poi.radius * 0.36, poi.radius * 0.43, 40));
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = track(
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(poi.glowColor),
          transparent: true,
          opacity: 0.58,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      pGroup.add(ringMesh);

      const diamondMat = track(
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(poi.glowColor),
          emissive: new THREE.Color(poi.glowColor),
          emissiveIntensity: 0.65,
          roughness: 0.18,
          metalness: 0.45,
        })
      );
      const diamond = new THREE.Mesh(diamondGeo, diamondMat);
      diamond.position.y = 3.1;
      pGroup.add(diamond);

      const pLight = new THREE.PointLight(new THREE.Color(poi.glowColor), 1.35, 8);
      pLight.position.y = 3.1;
      pGroup.add(pLight);

      const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
      hitbox.position.y = 1.9;
      hitbox.layers.set(1);
      hitbox.userData.poi = poi;
      pGroup.add(hitbox);
      poiHitboxes.push(hitbox);

      poiMarkers.push({ poi, ring: ringMesh, diamond, light: pLight });
    });

    // ==========================================
    // 5. CUTE MINT LEAF SPIRIT AVATAR (Matches Loading Screen!)
    // ==========================================
    const playerAvatar = new THREE.Group();
    playerAvatar.position.copy(playerPos.current);
    playerAvatar.rotation.y = playerAngle.current;
    scene.add(playerAvatar);

    // Body rig group so squash-and-stretch & bounce keep feet planted cleanly
    const spiritRig = new THREE.Group();
    playerAvatar.add(spiritRig);

    const spiritCreamMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xd1fae5,
        emissive: 0x34d399,
        emissiveIntensity: 0.1,
        roughness: 0.48,
        metalness: 0.04,
      })
    );
    const spiritBellyMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xa7f3d0,
        roughness: 0.52,
      })
    );
    const scarfAmberMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.14,
        roughness: 0.65,
      })
    );
    const scarfTailMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        roughness: 0.65,
      })
    );
    const sproutStemMat = track(
      new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.55 })
    );
    const sproutLeafLightMat = track(
      new THREE.MeshStandardMaterial({ color: 0x6ee7b7, roughness: 0.48 })
    );
    const eyeDarkMat = track(
      new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.15, metalness: 0.2 })
    );
    const eyeShineMat = track(
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    const blushPinkMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xfda4af,
        emissive: 0xfb7185,
        emissiveIntensity: 0.18,
        roughness: 0.7,
      })
    );

    // Chubby round Mint Spirit torso/head silhouette
    const spiritBody = new THREE.Mesh(
      track(new THREE.SphereGeometry(0.52, 24, 20)),
      spiritCreamMat
    );
    spiritBody.scale.set(1.06, 0.94, 1.0);
    spiritBody.position.y = 0.64;
    spiritBody.castShadow = true;
    spiritRig.add(spiritBody);

    // Soft mint belly patch
    const spiritBelly = new THREE.Mesh(
      track(new THREE.SphereGeometry(0.42, 18, 16)),
      spiritBellyMat
    );
    spiritBelly.scale.set(0.95, 0.85, 0.72);
    spiritBelly.position.set(0, 0.54, 0.18);
    spiritRig.add(spiritBelly);

    // Cute Cozy Eyes + Highlights + Rosy Blush + Smile (Facing +Z local forward)
    const eyeGeo = track(new THREE.SphereGeometry(0.068, 12, 12));
    const shineGeo = track(new THREE.SphereGeometry(0.024, 8, 8));
    const blushGeo = track(new THREE.SphereGeometry(0.075, 10, 8));

    const leftEye = new THREE.Group();
    leftEye.position.set(-0.17, 0.74, 0.46);
    const leftEyeBall = new THREE.Mesh(eyeGeo, eyeDarkMat);
    const leftEyeShine = new THREE.Mesh(shineGeo, eyeShineMat);
    leftEyeShine.position.set(0.024, 0.025, 0.056);
    leftEye.add(leftEyeBall, leftEyeShine);
    spiritRig.add(leftEye);

    const rightEye = new THREE.Group();
    rightEye.position.set(0.17, 0.74, 0.46);
    const rightEyeBall = new THREE.Mesh(eyeGeo, eyeDarkMat);
    const rightEyeShine = new THREE.Mesh(shineGeo, eyeShineMat);
    rightEyeShine.position.set(0.024, 0.025, 0.056);
    rightEye.add(rightEyeBall, rightEyeShine);
    spiritRig.add(rightEye);

    [-0.27, 0.27].forEach((bx) => {
      const blush = new THREE.Mesh(blushGeo, blushPinkMat);
      blush.position.set(bx, 0.62, 0.43);
      blush.scale.set(1.15, 0.65, 0.5);
      spiritRig.add(blush);
    });

    const smileMesh = new THREE.Mesh(
      track(new THREE.TorusGeometry(0.065, 0.016, 8, 14, Math.PI * 0.85)),
      eyeDarkMat
    );
    smileMesh.position.set(0, 0.62, 0.49);
    smileMesh.rotation.z = Math.PI + Math.PI * 0.075;
    spiritRig.add(smileMesh);

    // Snug Golden-Amber Scarf + Fluttering Tail
    const scarfCollar = new THREE.Mesh(
      track(new THREE.TorusGeometry(0.45, 0.095, 12, 24)),
      scarfAmberMat
    );
    scarfCollar.rotation.x = Math.PI / 2 + 0.08;
    scarfCollar.position.set(0, 0.42, 0.02);
    scarfCollar.castShadow = true;
    spiritRig.add(scarfCollar);

    const scarfTailPivot = new THREE.Group();
    scarfTailPivot.position.set(0.16, 0.4, -0.36);
    const scarfTail = new THREE.Mesh(
      track(new THREE.CapsuleGeometry(0.075, 0.26, 6, 10)),
      scarfTailMat
    );
    scarfTail.position.set(0, -0.14, -0.06);
    scarfTail.rotation.x = 0.42;
    scarfTail.scale.set(1.25, 1, 0.65);
    scarfTailPivot.add(scarfTail);
    spiritRig.add(scarfTailPivot);

    // Twin Sprout Leaves on Top of Head
    const sproutPivot = new THREE.Group();
    sproutPivot.position.set(0, 1.09, 0);
    spiritRig.add(sproutPivot);

    const stem = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.032, 0.042, 0.28, 10)),
      sproutStemMat
    );
    stem.position.y = 0.12;
    sproutPivot.add(stem);

    const leafGeo = track(createLeafGeometry(0.36, 0.16));
    const leafLeft = new THREE.Mesh(leafGeo, sproutStemMat);
    leafLeft.position.set(-0.15, 0.27, 0);
    leafLeft.rotation.set(0.25, 0, Math.PI / 3.1);
    sproutPivot.add(leafLeft);

    const leafRight = new THREE.Mesh(leafGeo, sproutLeafLightMat);
    leafRight.position.set(0.16, 0.29, 0);
    leafRight.rotation.set(-0.2, 0, -Math.PI / 3.0);
    sproutPivot.add(leafRight);

    // Cute Stubby Feet
    const footGeo = track(new THREE.SphereGeometry(0.13, 12, 10));
    const leftFoot = new THREE.Mesh(footGeo, spiritBellyMat);
    leftFoot.position.set(-0.2, 0.12, 0.05);
    leftFoot.scale.set(0.95, 0.68, 1.3);
    playerAvatar.add(leftFoot);

    const rightFoot = new THREE.Mesh(footGeo, spiritBellyMat);
    rightFoot.position.set(0.2, 0.12, 0.05);
    rightFoot.scale.set(0.95, 0.68, 1.3);
    playerAvatar.add(rightFoot);

    // Soft radial contact shadow under the spirit
    const shadowMat = track(
      new THREE.MeshBasicMaterial({
        map: contactShadowTex,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      })
    );
    const shadowMesh = new THREE.Mesh(track(new THREE.PlaneGeometry(1.35, 1.35)), shadowMat);
    shadowMesh.rotateX(-Math.PI / 2);
    shadowMesh.position.y = 0.03;
    playerAvatar.add(shadowMesh);

    // Tiny golden companion firefly orbiting the player just like the loading screen
    const buddyFirefly = new THREE.Mesh(
      track(new THREE.SphereGeometry(0.065, 10, 10)),
      track(
        new THREE.MeshBasicMaterial({
          color: 0xfde68a,
        })
      )
    );
    const buddySpriteMat = track(
      new THREE.SpriteMaterial({
        map: fireflyGlowTex,
        color: 0xfcd34d,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    const buddySprite = new THREE.Sprite(buddySpriteMat);
    buddySprite.scale.set(0.55, 0.55, 1);
    buddyFirefly.add(buddySprite);
    playerAvatar.add(buddyFirefly);

    // ==========================================
    // 6. FLUFFY ROUNDED TREES, WILDFLOWERS, MUSHROOMS & PARTICLES
    // ==========================================
    const perimeterTrees: Array<[number, number, number, boolean]> = [
      [-8.2, -4.6, 1.05, false],
      [-9.6, 1.2, 0.88, true],
      [-7.2, -7.8, 0.92, false],
      [2.2, -8.8, 1.12, true],
      [5.5, -7.2, 0.96, false],
      [-2.8, -8.5, 0.85, false],
      [9.4, 3.6, 0.9, true],
    ];

    const smallTrunkGeo = track(new THREE.CylinderGeometry(0.18, 0.28, 1.45, 10));
    const roundCanopyGeo = track(new THREE.SphereGeometry(1, 16, 14));

    perimeterTrees.forEach(([tx, tz, ts, isBlossom]) => {
      const tGroup = new THREE.Group();
      tGroup.position.set(tx, getTerrainHeight(tx, tz) - 0.12, tz);
      tGroup.scale.setScalar(ts);

      const trunk = new THREE.Mesh(smallTrunkGeo, warmWoodMat);
      trunk.position.y = 0.72;
      trunk.castShadow = true;
      tGroup.add(trunk);

      const cMat1 = isBlossom ? sakuraMat : sageLeafMat;
      const cMat2 = isBlossom ? sakuraLightMat : mintLeafMat;

      const crown1 = new THREE.Mesh(roundCanopyGeo, cMat1);
      crown1.position.y = 1.95;
      crown1.scale.set(1.22, 1.05, 1.2);
      crown1.castShadow = true;
      tGroup.add(crown1);

      const crown2 = new THREE.Mesh(roundCanopyGeo, cMat2);
      crown2.position.set(0.42, 2.55, 0.25);
      crown2.scale.set(0.88, 0.82, 0.86);
      tGroup.add(crown2);

      const crown3 = new THREE.Mesh(roundCanopyGeo, cMat1);
      crown3.position.set(-0.4, 2.35, -0.28);
      crown3.scale.set(0.82, 0.76, 0.82);
      tGroup.add(crown3);

      island.add(tGroup);
    });

    // Instanced Pastel Meadow Wildflowers
    const flowerPositions: Array<[number, number, number]> = [];
    const flowerPalette = [0xfbcfe8, 0xfde68a, 0xddd6fe, 0xa7f3d0, 0xfda4af];
    for (let i = 0; i < 95; i++) {
      const a = i * 2.39996; // Golden angle spread
      const r = 1.6 + Math.sqrt((i + 1) / 96) * (TOP_RADIUS - 2.6);
      const fx = Math.cos(a) * r;
      const fz = Math.sin(a) * r;
      // Avoid inside pond
      if (Math.hypot(fx - pondPos[0], fz - pondPos[2]) < 3.0) continue;
      flowerPositions.push([fx, fz, flowerPalette[i % flowerPalette.length]]);
    }

    const stemGeo = track(new THREE.CylinderGeometry(0.022, 0.025, 0.24, 6));
    const flowerHeadGeo = track(new THREE.SphereGeometry(0.11, 10, 8));
    const flowerStems = new THREE.InstancedMesh(stemGeo, sageLeafMat, flowerPositions.length);
    const flowerHeads = new THREE.InstancedMesh(
      flowerHeadGeo,
      track(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.65 })),
      flowerPositions.length
    );

    flowerPositions.forEach(([fx, fz, fColor], idx) => {
      const fy = getTerrainHeight(fx, fz);
      const s = 0.82 + (idx % 4) * 0.14;
      dummy.position.set(fx, fy + 0.1 * s, fz);
      dummy.rotation.set(0, idx * 0.7, 0);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      flowerStems.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(fx, fy + 0.24 * s, fz);
      dummy.scale.set(s * 1.1, s * 0.75, s * 1.1);
      dummy.updateMatrix();
      flowerHeads.setMatrixAt(idx, dummy.matrix);
      _tmpColor.setHex(fColor);
      flowerHeads.setColorAt(idx, _tmpColor);
    });
    flowerStems.instanceMatrix.needsUpdate = true;
    flowerHeads.instanceMatrix.needsUpdate = true;
    if (flowerHeads.instanceColor) flowerHeads.instanceColor.needsUpdate = true;
    flowerStems.computeBoundingSphere();
    flowerHeads.computeBoundingSphere();
    island.add(flowerStems, flowerHeads);

    // Instanced Cute Glowing Mushrooms near the Oak & Campfire
    const mushroomCoords: Array<[number, number, number]> = [
      [-6.1, -1.3, 1.0],
      [-5.6, -0.5, 0.75],
      [-3.1, -3.4, 0.9],
      [-6.2, 2.7, 0.85],
      [-3.7, 5.4, 0.95],
      [2.1, 5.1, 0.8],
      [-1.9, -6.2, 0.85],
      [2.3, -6.1, 0.72],
    ];
    const mushStemGeo = track(new THREE.CylinderGeometry(0.055, 0.075, 0.2, 10));
    const mushCapGeo = track(
      new THREE.SphereGeometry(0.17, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.58)
    );
    const mushStemMat = track(
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.7 })
    );
    const mushCapMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xfda4af,
        emissive: 0xfb7185,
        emissiveIntensity: 0.35,
        roughness: 0.45,
      })
    );
    const mushStems = new THREE.InstancedMesh(mushStemGeo, mushStemMat, mushroomCoords.length);
    const mushCaps = new THREE.InstancedMesh(mushCapGeo, mushCapMat, mushroomCoords.length);

    mushroomCoords.forEach(([mx, mz, ms], idx) => {
      const my = getTerrainHeight(mx, mz);
      dummy.position.set(mx, my + 0.09 * ms, mz);
      dummy.rotation.set(0, idx, 0);
      dummy.scale.setScalar(ms);
      dummy.updateMatrix();
      mushStems.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(mx, my + 0.17 * ms, mz);
      dummy.scale.set(ms * 1.05, ms * 0.85, ms * 1.05);
      dummy.updateMatrix();
      mushCaps.setMatrixAt(idx, dummy.matrix);
    });
    mushStems.instanceMatrix.needsUpdate = true;
    mushCaps.instanceMatrix.needsUpdate = true;
    mushStems.computeBoundingSphere();
    mushCaps.computeBoundingSphere();
    island.add(mushStems, mushCaps);

    // Soft Glowing Fireflies (using radial sprite texture!)
    const fireflyCount = 110;
    const fireflyGeo = track(new THREE.BufferGeometry());
    const fireflyPos = new Float32Array(fireflyCount * 3);
    const fireflyBaseY = new Float32Array(fireflyCount);
    const fireflyBaseX = new Float32Array(fireflyCount);
    const fireflyBaseZ = new Float32Array(fireflyCount);

    for (let i = 0; i < fireflyCount; i++) {
      const bx = (Math.random() - 0.5) * 26;
      const by = 1.65 + Math.random() * 6.8;
      const bz = (Math.random() - 0.5) * 26;
      fireflyBaseX[i] = bx;
      fireflyBaseY[i] = by;
      fireflyBaseZ[i] = bz;
      fireflyPos[i * 3] = bx;
      fireflyPos[i * 3 + 1] = by;
      fireflyPos[i * 3 + 2] = bz;
    }
    fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPos, 3));
    const fireflyMat = track(
      new THREE.PointsMaterial({
        map: fireflyGlowTex,
        color: 0xfef08a,
        size: 0.72,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    const fireflies = new THREE.Points(fireflyGeo, fireflyMat);
    scene.add(fireflies);

    // Drifting Pink Blossom Petals around the Ancient Blossom Tree
    const petalCount = 42;
    const petalGeo = track(new THREE.BufferGeometry());
    const petalPos = new Float32Array(petalCount * 3);
    for (let i = 0; i < petalCount; i++) {
      petalPos[i * 3] = -4.5 + (Math.random() - 0.5) * 7.5;
      petalPos[i * 3 + 1] = 2.0 + Math.random() * 5.8;
      petalPos[i * 3 + 2] = -2.0 + (Math.random() - 0.5) * 7.5;
    }
    petalGeo.setAttribute('position', new THREE.BufferAttribute(petalPos, 3));
    const petalMat = track(
      new THREE.PointsMaterial({
        map: petalGlowTex,
        color: 0xfbcfe8,
        size: 0.42,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      })
    );
    const blossomPetals = new THREE.Points(petalGeo, petalMat);
    scene.add(blossomPetals);

    onProgressRef.current(88, 'Waking the Mint Leaf Spirit & calibrating controls...');

    // ==========================================
    // 7. FAST TRAVEL & PROXIMITY EVALUATION
    // ==========================================
    let lastFoundNearby: WorldInteractable | null = null;

    const evaluateProximity = (elapsed: number) => {
      let closestPoi: WorldInteractable | null = null;
      let minDistance = Infinity;

      for (const poi of WORLD_INTERACTABLES) {
        const dx = playerPos.current.x - poi.worldPos[0];
        const dz = playerPos.current.z - poi.worldPos[2];
        const dist = Math.hypot(dx, dz);
        if (dist < poi.radius && dist < minDistance) {
          closestPoi = poi;
          minDistance = dist;
        }
      }

      if (closestPoi !== lastFoundNearby) {
        lastFoundNearby = closestPoi;
        nearbyPoiRef.current = closestPoi;
        onNearbyRef.current(closestPoi);
        if (closestPoi) {
          walkAudio.playDiscoveryChime(528);
          hopVelocityRef.current = 2.4; // cute excited hop!
        }
      }

      for (const marker of poiMarkers) {
        const isNear = closestPoi?.id === marker.poi.id;
        const scale = isNear
          ? 1 + Math.sin(elapsed * 4) * 0.14
          : 1 + Math.sin(elapsed * 2) * 0.05;
        marker.ring.scale.set(scale, scale, scale);
        marker.diamond.rotation.y += 0.024;
        marker.diamond.position.y = 3.1 + Math.sin(elapsed * 2.4 + marker.poi.worldPos[0]) * 0.14;
        marker.light.intensity = isNear ? 2.3 : 1.15;
      }
    };

    teleportToPoi.current = (poi: WorldInteractable) => {
      const angleFromCenter = Math.atan2(poi.worldPos[2], poi.worldPos[0]);
      const landX = poi.worldPos[0] - Math.cos(angleFromCenter) * 2.05;
      const landZ = poi.worldPos[2] - Math.sin(angleFromCenter) * 2.05;

      const dist = Math.hypot(landX, landZ);
      const clampedX = dist > MAX_ISLAND_RADIUS ? (landX / dist) * MAX_ISLAND_RADIUS : landX;
      const clampedZ = dist > MAX_ISLAND_RADIUS ? (landZ / dist) * MAX_ISLAND_RADIUS : landZ;

      playerPos.current.set(clampedX, getTerrainHeight(clampedX, clampedZ), clampedZ);
      playerAngle.current = Math.atan2(
        poi.worldPos[0] - clampedX,
        poi.worldPos[2] - clampedZ
      );

      cameraOrbitYawTarget.current = playerAngle.current + Math.PI;
      hopVelocityRef.current = 3.2;
      walkAudio.playDiscoveryChime(659.25);
      evaluateProximity(0);
    };

    // ==========================================
    // 8. INPUT: KEYBOARD, POINTER ORBIT, PINCH ZOOM, TAP RAYCAST
    // ==========================================
    const MOVEMENT_CODES = new Set([
      'KeyW',
      'KeyA',
      'KeyS',
      'KeyD',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
    ]);

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (isModalOpenRef.current) {
        keysDown.current = {};
        return;
      }

      if (MOVEMENT_CODES.has(e.code)) {
        if (e.code.startsWith('Arrow')) {
          e.preventDefault();
        }
        keysDown.current[e.code] = true;
      }

      if (e.code === 'KeyE' || e.code === 'Space') {
        if (e.code === 'Space') {
          e.preventDefault();
        }
        if (nearbyPoiRef.current) {
          walkAudio.playDiscoveryChime(783.99);
          onOpenRef.current(nearbyPoiRef.current);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.current[e.code] = false;
    };

    const clearAllKeys = () => {
      keysDown.current = {};
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearAllKeys();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', clearAllKeys);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const canvasEl = renderer.domElement;
    const activePointers = new Map<number, { x: number; y: number }>();
    let downX = 0;
    let downY = 0;
    let downTime = 0;
    let totalDragDist = 0;
    let lastPinchDist: number | null = null;
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const ndcPointer = new THREE.Vector2();

    const getPinchDistance = (): number | null => {
      if (activePointers.size < 2) return null;
      const pts = Array.from(activePointers.values());
      return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (isModalOpenRef.current) return;
      canvasEl.setPointerCapture(e.pointerId);
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activePointers.size === 1) {
        downX = e.clientX;
        downY = e.clientY;
        downTime = performance.now();
        totalDragDist = 0;
        lastPinchDist = null;
      } else if (activePointers.size === 2) {
        lastPinchDist = getPinchDistance();
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const prev = activePointers.get(e.pointerId);
      if (!prev) return;

      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activePointers.size === 1) {
        totalDragDist += Math.hypot(dx, dy);
        cameraOrbitYawTarget.current -= dx * 0.006;
        cameraOrbitYaw.current -= dx * 0.006;
        cameraOrbitPitchTarget.current = THREE.MathUtils.clamp(
          cameraOrbitPitchTarget.current + dy * 0.004,
          0.12,
          0.85
        );
        cameraOrbitPitch.current = cameraOrbitPitchTarget.current;
      } else if (activePointers.size >= 2) {
        const nextPinch = getPinchDistance();
        if (nextPinch !== null && lastPinchDist !== null) {
          const pinchDelta = lastPinchDist - nextPinch;
          cameraZoomTarget.current = THREE.MathUtils.clamp(
            cameraZoomTarget.current + pinchDelta * 0.0035,
            0.72,
            1.45
          );
        }
        lastPinchDist = nextPinch;
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      const wasSingleTap =
        activePointers.size === 1 &&
        totalDragDist < 9 &&
        performance.now() - downTime < 350;

      activePointers.delete(e.pointerId);
      if (canvasEl.hasPointerCapture(e.pointerId)) {
        canvasEl.releasePointerCapture(e.pointerId);
      }
      if (activePointers.size < 2) {
        lastPinchDist = null;
      }

      if (wasSingleTap && !isModalOpenRef.current) {
        const rect = canvasEl.getBoundingClientRect();
        ndcPointer.x = ((downX - rect.left) / rect.width) * 2 - 1;
        ndcPointer.y = -((downY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(ndcPointer, camera);
        const hits = raycaster.intersectObjects(poiHitboxes, false);
        if (hits.length > 0) {
          const tappedPoi = hits[0].object.userData.poi as WorldInteractable | undefined;
          if (tappedPoi) {
            if (nearbyPoiRef.current?.id === tappedPoi.id) {
              walkAudio.playDiscoveryChime(783.99);
              onOpenRef.current(tappedPoi);
            } else {
              teleportToPoi.current(tappedPoi);
            }
          }
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (isModalOpenRef.current) return;
      e.preventDefault();
      cameraZoomTarget.current = THREE.MathUtils.clamp(
        cameraZoomTarget.current + e.deltaY * 0.0008,
        0.72,
        1.45
      );
    };

    canvasEl.addEventListener('pointerdown', handlePointerDown);
    canvasEl.addEventListener('pointermove', handlePointerMove);
    canvasEl.addEventListener('pointerup', handlePointerUp);
    canvasEl.addEventListener('pointercancel', handlePointerUp);
    canvasEl.addEventListener('wheel', handleWheel, { passive: false });

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      onErrorRef.current(
        'context-lost',
        'WebGL context was paused by the browser or GPU.'
      );
    };
    const handleContextRestored = () => {
      renderer.setSize(
        container.clientWidth || window.innerWidth,
        container.clientHeight || window.innerHeight
      );
    };
    canvasEl.addEventListener('webglcontextlost', handleContextLost);
    canvasEl.addEventListener('webglcontextrestored', handleContextRestored);

    const updateViewportSize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      if (w === 0 || h === 0) return;

      const aspect = w / h;
      camConfig = getResponsiveCameraConfig(aspect);
      camera.fov = camConfig.fov;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    };

    const resizeObserver = new ResizeObserver(updateViewportSize);
    resizeObserver.observe(container);
    window.addEventListener('resize', updateViewportSize);
    window.addEventListener('orientationchange', updateViewportSize);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    onProgressRef.current(100, 'Sanctuary ready!');
    const readyTimer = window.setTimeout(() => {
      onReadyRef.current();
    }, 260);

    // ==========================================
    // 9. ANIMATION & KINEMATICS LOOP
    // ==========================================
    let frameId = 0;
    let isDisposed = false;
    let walkPhase = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (isDisposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    const tick = () => {
      if (isDisposed) return;
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();
      const motionScale = prefersReducedMotion ? 0.25 : 1;

      // Combine keyboard + analog touch joystick
      let rawForward = 0;
      let rawRight = 0;

      if (!isModalOpenRef.current) {
        if (keysDown.current['KeyW'] || keysDown.current['ArrowUp']) rawForward += 1;
        if (keysDown.current['KeyS'] || keysDown.current['ArrowDown']) rawForward -= 1;
        if (keysDown.current['KeyD'] || keysDown.current['ArrowRight']) rawRight += 1;
        if (keysDown.current['KeyA'] || keysDown.current['ArrowLeft']) rawRight -= 1;

        rawForward += joystickRef.current.y;
        rawRight += joystickRef.current.x;
      }

      const inputMag = Math.hypot(rawForward, rawRight);
      const isMoving = inputMag > 0.05;

      if (isMoving) {
        const clampedMag = Math.min(1, inputMag);
        const normFwd = rawForward / inputMag;
        const normRight = rawRight / inputMag;

        const yaw = cameraOrbitYaw.current;
        const fwdX = -Math.sin(yaw);
        const fwdZ = -Math.cos(yaw);
        const rightX = Math.cos(yaw);
        const rightZ = -Math.sin(yaw);

        const moveX = fwdX * normFwd + rightX * normRight;
        const moveZ = fwdZ * normFwd + rightZ * normRight;

        const walkSpeed = 6.2 * clampedMag;
        playerPos.current.x += moveX * walkSpeed * delta;
        playerPos.current.z += moveZ * walkSpeed * delta;

        const targetAngle = Math.atan2(moveX, moveZ);
        const angleDiff = Math.atan2(
          Math.sin(targetAngle - playerAngle.current),
          Math.cos(targetAngle - playerAngle.current)
        );
        playerAngle.current += angleDiff * (1 - Math.exp(-12 * delta));

        walkPhase += delta * 11 * clampedMag;

        stepTimerRef.current += delta * clampedMag;
        if (stepTimerRef.current > 0.34) {
          walkAudio.playFootstep();
          stepTimerRef.current = 0;
        }
      }

      // Clamp player within island perimeter
      const distFromCenter = Math.hypot(playerPos.current.x, playerPos.current.z);
      if (distFromCenter > MAX_ISLAND_RADIUS) {
        playerPos.current.x = (playerPos.current.x / distFromCenter) * MAX_ISLAND_RADIUS;
        playerPos.current.z = (playerPos.current.z / distFromCenter) * MAX_ISLAND_RADIUS;
      }

      playerPos.current.y = getTerrainHeight(playerPos.current.x, playerPos.current.z);

      // Cute celebratory hop physics on discovery / teleport
      if (hopOffsetRef.current > 0 || hopVelocityRef.current !== 0) {
        hopOffsetRef.current += hopVelocityRef.current * delta;
        hopVelocityRef.current -= 14 * delta;
        if (hopOffsetRef.current <= 0) {
          hopOffsetRef.current = 0;
          hopVelocityRef.current = 0;
        }
      }

      playerAvatar.position.set(
        playerPos.current.x,
        playerPos.current.y + hopOffsetRef.current,
        playerPos.current.z
      );
      playerAvatar.rotation.y = playerAngle.current;

      // Keep shadow planted softly on terrain even when hopping
      shadowMesh.position.y = 0.03 - hopOffsetRef.current;
      const shadowShrink = Math.max(0.55, 1 - hopOffsetRef.current * 0.45);
      shadowMesh.scale.setScalar(shadowShrink);

      // Cute Mint Leaf Spirit squash-and-stretch + leaf sway + blinking
      const idleBreath = Math.sin(elapsed * 2.6) * 0.035 * motionScale;
      const walkBounce = isMoving ? Math.abs(Math.sin(walkPhase)) * 0.14 : 0;

      spiritRig.position.y = walkBounce;
      const targetScaleY = isMoving
        ? 0.96 + Math.sin(walkPhase * 2) * 0.05
        : 1 + idleBreath;
      const targetScaleXZ = 1 / Math.sqrt(targetScaleY);
      spiritRig.scale.y = THREE.MathUtils.damp(spiritRig.scale.y, targetScaleY, 14, delta);
      spiritRig.scale.x = THREE.MathUtils.damp(spiritRig.scale.x, targetScaleXZ, 14, delta);
      spiritRig.scale.z = spiritRig.scale.x;
      spiritRig.rotation.z = THREE.MathUtils.damp(
        spiritRig.rotation.z,
        isMoving ? Math.sin(walkPhase) * 0.075 : 0,
        12,
        delta
      );

      // Cute sprout sway
      sproutPivot.rotation.z =
        Math.sin(elapsed * (isMoving ? 8.5 : 2.5)) * (isMoving ? 0.14 : 0.07) * motionScale;
      scarfTailPivot.rotation.x = THREE.MathUtils.damp(
        scarfTailPivot.rotation.x,
        isMoving ? 0.45 + Math.sin(walkPhase) * 0.25 : 0.1 + Math.sin(elapsed * 2.2) * 0.05,
        12,
        delta
      );

      // Pitter-patter feet
      leftFoot.position.z = THREE.MathUtils.damp(
        leftFoot.position.z,
        isMoving ? 0.05 + Math.sin(walkPhase) * 0.16 : 0.05,
        16,
        delta
      );
      rightFoot.position.z = THREE.MathUtils.damp(
        rightFoot.position.z,
        isMoving ? 0.05 - Math.sin(walkPhase) * 0.16 : 0.05,
        16,
        delta
      );

      // Natural eye blink every ~3.8 seconds
      const blinkCycle = elapsed % 3.8;
      const isBlinking = blinkCycle > 3.66;
      const targetEyeScaleY = isBlinking ? 0.12 : 1;
      leftEye.scale.y = THREE.MathUtils.damp(leftEye.scale.y, targetEyeScaleY, 26, delta);
      rightEye.scale.y = leftEye.scale.y;

      // Companion firefly orbiting the Mint Spirit
      buddyFirefly.position.set(
        Math.cos(elapsed * 1.9) * 0.72,
        1.28 + Math.sin(elapsed * 3.1) * 0.14,
        Math.sin(elapsed * 1.9) * 0.72
      );

      evaluateProximity(elapsed);

      // Frame-rate independent smooth 3rd-person orbit camera (including yaw glide)
      const yawDiff = Math.atan2(
        Math.sin(cameraOrbitYawTarget.current - cameraOrbitYaw.current),
        Math.cos(cameraOrbitYawTarget.current - cameraOrbitYaw.current)
      );
      cameraOrbitYaw.current += yawDiff * (1 - Math.exp(-8 * delta));
      cameraOrbitPitch.current = THREE.MathUtils.damp(
        cameraOrbitPitch.current,
        cameraOrbitPitchTarget.current,
        10,
        delta
      );
      cameraZoom.current = THREE.MathUtils.damp(
        cameraZoom.current,
        cameraZoomTarget.current,
        10,
        delta
      );

      const effectiveDistance = camConfig.baseDistance * cameraZoom.current;
      const horizDist = effectiveDistance * Math.cos(cameraOrbitPitch.current);

      _desiredCamPos.set(
        playerPos.current.x + Math.sin(cameraOrbitYaw.current) * horizDist,
        playerPos.current.y + 1.55 + Math.sin(cameraOrbitPitch.current) * effectiveDistance,
        playerPos.current.z + Math.cos(cameraOrbitYaw.current) * horizDist
      );
      _desiredTargetPos.set(
        playerPos.current.x,
        playerPos.current.y + 1.05,
        playerPos.current.z
      );

      cameraActual.current.lerp(_desiredCamPos, 1 - Math.exp(-8.5 * delta));
      cameraTarget.current.lerp(_desiredTargetPos, 1 - Math.exp(-10.5 * delta));

      camera.position.copy(cameraActual.current);
      camera.lookAt(cameraTarget.current);

      // Ambient world animations
      waterfallTex.offset.y -= delta * 1.65 * motionScale;
      const fPos = fallGeo.attributes.position;
      for (let i = 0; i < fPos.count; i++) {
        const y = fPos.getY(i);
        fPos.setX(i, Math.sin(y * 1.5 - elapsed * 6) * 0.06 * motionScale);
      }
      fPos.needsUpdate = true;

      lilyPads.forEach((pad, idx) => {
        pad.position.y = 0.24 + Math.sin(elapsed * 1.8 + idx * 1.7) * 0.025 * motionScale;
      });

      hangingLanterns.forEach((hGroup, idx) => {
        hGroup.rotation.z = Math.sin(elapsed * 1.6 + idx * 1.2) * 0.08 * motionScale;
      });

      // Smooth Real-Time Local Day/Night Atmosphere Cycle
      const targetAtmo = atmosphereRef.current;
      const atmoBlend = 1 - Math.exp(-3.5 * delta);

      skyUniforms.uTime.value = elapsed * motionScale;
      _targetColor.set(targetAtmo.skyZenith);
      skyUniforms.uZenith.value.lerp(_targetColor, atmoBlend);
      _targetColor.set(targetAtmo.skyMid);
      skyUniforms.uMid.value.lerp(_targetColor, atmoBlend);
      _targetColor.set(targetAtmo.skyHorizon);
      skyUniforms.uHorizon.value.lerp(_targetColor, atmoBlend);
      _targetColor.set(targetAtmo.skyDeep);
      skyUniforms.uDeep.value.lerp(_targetColor, atmoBlend);
      skyUniforms.uStarOpacity.value = THREE.MathUtils.damp(
        skyUniforms.uStarOpacity.value,
        targetAtmo.starOpacity,
        3.5,
        delta
      );

      if (scene.fog instanceof THREE.FogExp2) {
        _targetColor.set(targetAtmo.fogColor);
        scene.fog.color.lerp(_targetColor, atmoBlend);
      }

      _targetColor.set(targetAtmo.hemiSky);
      hemiLight.color.lerp(_targetColor, atmoBlend);
      _targetColor.set(targetAtmo.hemiGround);
      hemiLight.groundColor.lerp(_targetColor, atmoBlend);
      hemiLight.intensity = THREE.MathUtils.damp(
        hemiLight.intensity,
        targetAtmo.hemiIntensity,
        3.5,
        delta
      );

      _targetColor.set(targetAtmo.keyColor);
      sun.color.lerp(_targetColor, atmoBlend);
      sun.intensity = THREE.MathUtils.damp(
        sun.intensity,
        targetAtmo.keyIntensity,
        3.5,
        delta
      );

      // Gently sweep directional sun angle across day/night arc while keeping crisp shadow elevation
      const dayAngle = ((targetAtmo.hour - 6) / 12) * Math.PI;
      const desiredSunX = -Math.cos(dayAngle) * 26;
      const desiredSunY = 18 + Math.max(0, Math.sin(dayAngle)) * 22;
      sun.position.x = THREE.MathUtils.damp(sun.position.x, desiredSunX, 3.0, delta);
      sun.position.y = THREE.MathUtils.damp(sun.position.y, desiredSunY, 3.0, delta);

      _targetColor.set(targetAtmo.rimColor);
      rimLight.color.lerp(_targetColor, atmoBlend);
      rimLight.intensity = THREE.MathUtils.damp(
        rimLight.intensity,
        targetAtmo.rimIntensity,
        3.5,
        delta
      );

      _targetColor.set(targetAtmo.cloudTint);
      cloudMat.color.lerp(_targetColor, atmoBlend);
      _targetColor.set(targetAtmo.cloudEmissive);
      cloudMat.emissive.lerp(_targetColor, atmoBlend);
      cloudMat.emissiveIntensity = THREE.MathUtils.damp(
        cloudMat.emissiveIntensity,
        targetAtmo.cloudEmissiveIntensity,
        3.5,
        delta
      );

      // Celestial sun & moon positioning + smooth fade
      const sunSkyAngle = ((targetAtmo.hour - 5.5) / 14) * Math.PI;
      sunOrbGroup.position.set(
        -Math.cos(sunSkyAngle) * 72,
        12 + Math.sin(sunSkyAngle) * 44,
        -76
      );
      sunOrbGroup.visible = targetAtmo.sunOpacity > 0.02 || sunBodyMat.opacity > 0.02;
      sunBodyMat.opacity = THREE.MathUtils.damp(sunBodyMat.opacity, targetAtmo.sunOpacity, 3.5, delta);
      sunHaloMat.opacity = sunBodyMat.opacity * 0.65;

      const moonHour = targetAtmo.hour >= 12 ? targetAtmo.hour - 18 : targetAtmo.hour + 6;
      const moonSkyAngle = (moonHour / 12) * Math.PI;
      moonGroup.position.set(
        -Math.cos(moonSkyAngle) * 68,
        16 + Math.max(0, Math.sin(moonSkyAngle)) * 36,
        -82
      );
      moonGroup.visible = targetAtmo.moonOpacity > 0.02 || moonBodyMat.opacity > 0.02;
      moonBodyMat.opacity = THREE.MathUtils.damp(
        moonBodyMat.opacity,
        targetAtmo.moonOpacity,
        3.5,
        delta
      );
      moonHaloMat.opacity = moonBodyMat.opacity * 0.45;

      fireflyMat.opacity = THREE.MathUtils.damp(
        fireflyMat.opacity,
        targetAtmo.fireflyOpacity,
        3.5,
        delta
      );
      buddySpriteMat.opacity = Math.max(0.35, fireflyMat.opacity);

      paperLanternMat.emissiveIntensity = THREE.MathUtils.damp(
        paperLanternMat.emissiveIntensity,
        targetAtmo.lanternIntensity,
        3.5,
        delta
      );
      renderer.toneMappingExposure = THREE.MathUtils.damp(
        renderer.toneMappingExposure,
        targetAtmo.exposure,
        3.5,
        delta
      );

      fireLight.intensity =
        (1.45 + targetAtmo.lanternIntensity * 1.1) + Math.sin(elapsed * 11) * 0.35 * motionScale;
      flameGroup.rotation.y += 2.2 * delta;
      flameGroup.scale.y = 1 + Math.sin(elapsed * 13) * 0.09 * motionScale;

      beacon.rotation.y += 1.15 * delta;
      beaconRing.rotation.x = Math.sin(elapsed * 1.3) * 0.45;
      beaconRing.rotation.y += 0.9 * delta;

      // Drifting clouds
      floatingClouds.forEach((c) => {
        c.angle += c.speed * delta * motionScale;
        c.group.position.set(
          Math.cos(c.angle) * c.radius,
          c.baseY + Math.sin(elapsed * 0.8 + c.angle) * 0.35 * motionScale,
          Math.sin(c.angle) * c.radius
        );
        c.group.lookAt(0, c.baseY, 0);
      });

      // Soft floating fireflies
      const ffPos = fireflyGeo.attributes.position;
      for (let i = 0; i < fireflyCount; i++) {
        ffPos.setX(
          i,
          fireflyBaseX[i] + Math.cos(elapsed * 0.7 + i * 0.9) * 0.25 * motionScale
        );
        ffPos.setY(
          i,
          fireflyBaseY[i] + Math.sin(elapsed * 1.5 + i) * 0.42 * motionScale
        );
      }
      ffPos.needsUpdate = true;

      // Drifting blossom petals
      const pPos = petalGeo.attributes.position;
      for (let i = 0; i < petalCount; i++) {
        let py = pPos.getY(i) - delta * 0.65 * motionScale;
        let px = pPos.getX(i) + Math.sin(elapsed * 1.4 + i) * delta * 0.32 * motionScale;
        if (py < 1.35) {
          py = 6.8 + (i % 3) * 0.5;
          px = -4.5 + Math.sin(i * 2.1) * 3.2;
        }
        pPos.setX(i, px);
        pPos.setY(i, py);
      }
      pPos.needsUpdate = true;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      isDisposed = true;
      window.clearTimeout(readyTimer);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);

      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', clearAllKeys);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', updateViewportSize);
      window.removeEventListener('orientationchange', updateViewportSize);
      resizeObserver.disconnect();

      canvasEl.removeEventListener('pointerdown', handlePointerDown);
      canvasEl.removeEventListener('pointermove', handlePointerMove);
      canvasEl.removeEventListener('pointerup', handlePointerUp);
      canvasEl.removeEventListener('pointercancel', handlePointerUp);
      canvasEl.removeEventListener('wheel', handleWheel);
      canvasEl.removeEventListener('webglcontextlost', handleContextLost);
      canvasEl.removeEventListener('webglcontextrestored', handleContextRestored);

      disposables.forEach((d) => d.dispose());
      renderer.dispose();

      if (container.contains(canvasEl)) {
        container.removeChild(canvasEl);
      }
    };
  }, [joystickRef, atmosphereRef]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing"
    />
  );
};
