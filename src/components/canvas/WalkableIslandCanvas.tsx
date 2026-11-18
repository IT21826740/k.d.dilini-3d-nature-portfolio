import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { WORLD_INTERACTABLES, WorldInteractable } from '../../data/worldData';
import { walkAudio } from '../../utils/walkAudio';
import { JoystickVector } from '../world/TouchControls';
import { SanctuaryErrorKind } from '../world/CuteErrorScreen';

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
  onLoadProgress: (progress: number, statusText: string) => void;
  onSceneReady: () => void;
  onSceneError: (kind: SanctuaryErrorKind, detail?: string) => void;
}

const TOP_RADIUS = 14.5;
const MAX_ISLAND_RADIUS = TOP_RADIUS - 1.2;

/** Deterministic terrain elevation shared across island geometry, landmarks, and player physics */
function getTerrainHeight(x: number, z: number): number {
  const dist = Math.hypot(x, z);
  const wave = Math.sin(x * 0.35) * Math.cos(z * 0.35) * 0.55;
  const edgeSlope = dist > 11 ? -0.35 * Math.min(1, (dist - 11) / (TOP_RADIUS - 11)) : 0;
  return 1.25 + wave + edgeSlope;
}

/** Responsive vertical FOV & base camera distance tuned for portrait phones vs widescreen desktops */
function getResponsiveCameraConfig(aspect: number) {
  const safeAspect = Math.max(0.45, Math.min(2.4, aspect || 1));
  if (safeAspect < 1) {
    // Portrait mobile: widen vertical FOV and pull back slightly so island & nearby POIs stay framed
    const portraitFactor = 1 - safeAspect;
    return {
      fov: THREE.MathUtils.clamp(52 + portraitFactor * 34, 52, 70),
      baseDistance: THREE.MathUtils.clamp(7.5 + portraitFactor * 4.5, 7.5, 10.0),
    };
  }
  return {
    fov: 52,
    baseDistance: 7.5,
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

// Reusable math helpers outside the render loop (Zero-GC)
const _desiredCamPos = new THREE.Vector3();
const _desiredTargetPos = new THREE.Vector3();

export const WalkableIslandCanvas: React.FC<WalkableIslandCanvasProps> = ({
  onNearbyInteractable,
  onOpenInteractable,
  isAnyModalOpen,
  teleportCommand,
  cameraAction,
  joystickRef,
  onLoadProgress,
  onSceneReady,
  onSceneError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Latest React callbacks in refs so the Three.js scene mounts once and never resets
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
  const playerPos = useRef(new THREE.Vector3(0, getTerrainHeight(0, 7), 7));
  const playerAngle = useRef(Math.PI); // Facing North (-Z) towards island center
  const stepTimerRef = useRef(0);
  const nearbyPoiRef = useRef<WorldInteractable | null>(null);

  const cameraTarget = useRef(new THREE.Vector3(0, 2.4, 7));
  const cameraActual = useRef(new THREE.Vector3(0, 5.2, 14.5));
  const cameraOrbitYaw = useRef(0); // 0 = camera sits +Z behind player looking North (-Z)
  const cameraOrbitPitch = useRef(0.32);
  const cameraZoom = useRef(1.0);
  const cameraZoomTarget = useRef(1.0);

  // Key tracking by physical KeyboardEvent.code (immune to CapsLock / Shift / layout glitches)
  const keysDown = useRef<Record<string, boolean>>({});

  // Clear stuck movement keys whenever any modal opens
  useEffect(() => {
    if (isAnyModalOpen) {
      keysDown.current = {};
    }
  }, [isAnyModalOpen]);

  // Teleport / Fast-Travel command handler
  const teleportToPoi = useRef<(poi: WorldInteractable) => void>(() => {});

  useEffect(() => {
    if (!teleportCommand) return;
    const found = WORLD_INTERACTABLES.find((p) => p.id === teleportCommand.poiId);
    if (found) {
      teleportToPoi.current(found);
    }
  }, [teleportCommand]);

  // Camera Zoom / Reset command handler from TouchControls
  useEffect(() => {
    if (!cameraAction) return;
    if (cameraAction.type === 'zoom' && typeof cameraAction.delta === 'number') {
      cameraZoomTarget.current = THREE.MathUtils.clamp(
        cameraZoomTarget.current + cameraAction.delta,
        0.72,
        1.45
      );
    } else if (cameraAction.type === 'reset') {
      cameraOrbitYaw.current = 0;
      cameraOrbitPitch.current = 0.32;
      cameraZoomTarget.current = 1.0;
    }
  }, [cameraAction]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    onProgressRef.current(12, 'Checking WebGL graphics capabilities...');

    // Verify WebGL support
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

    onProgressRef.current(28, 'Setting up sunlit sky & studio reflections...');

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x13271f, 0.013);

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
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'none';
    container.appendChild(renderer.domElement);

    // Procedural Studio Environment Reflection (mandatory for PBR metals & water)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();
    disposables.push(envTarget);

    // ==========================================
    // 1. LIGHTING RIG (Warm Key + Cool Hemisphere)
    // ==========================================
    const hemiLight = new THREE.HemisphereLight(0x88d4ff, 0x224430, 0.9);
    scene.add(hemiLight);

    const sun = new THREE.DirectionalLight(0xfffaec, 2.2);
    sun.position.set(24, 38, 20);
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

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.65);
    rimLight.position.set(-18, 12, -22);
    scene.add(rimLight);

    onProgressRef.current(48, 'Sculpting floating island terrain & stone paths...');

    // ==========================================
    // 2. NATURE ISLAND TERRAIN
    // ==========================================
    const island = new THREE.Group();
    scene.add(island);

    const grassGeo = track(
      new THREE.CylinderGeometry(TOP_RADIUS, TOP_RADIUS * 0.96, 2.5, 40, 6)
    );
    const grassPos = grassGeo.attributes.position;
    for (let i = 0; i < grassPos.count; i++) {
      const y = grassPos.getY(i);
      if (y > 0.5) {
        const x = grassPos.getX(i);
        const z = grassPos.getZ(i);
        grassPos.setY(i, getTerrainHeight(x, z));
      }
    }
    grassGeo.computeVertexNormals();

    const grassMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x4d8853,
        roughness: 0.85,
        metalness: 0.05,
        flatShading: true,
      })
    );
    const grassMesh = new THREE.Mesh(grassGeo, grassMat);
    grassMesh.receiveShadow = true;
    grassMesh.castShadow = true;
    island.add(grassMesh);

    // Winding stone pathway grounded to terrain height
    const pathPoints = [
      new THREE.Vector3(0, getTerrainHeight(0, 8.5) - 0.55, 8.5),
      new THREE.Vector3(0, getTerrainHeight(0, 4) - 0.55, 4),
      new THREE.Vector3(-2, getTerrainHeight(-2, 1) - 0.55, 1),
      new THREE.Vector3(-3.5, getTerrainHeight(-3.5, -1.8) - 0.55, -1.8),
      new THREE.Vector3(0, getTerrainHeight(0, -2) - 0.55, -2),
      new THREE.Vector3(0, getTerrainHeight(0, -4.5) - 0.55, -4.5),
      new THREE.Vector3(3.2, getTerrainHeight(3.2, 0) - 0.55, 0),
      new THREE.Vector3(5.5, getTerrainHeight(5.5, 0.5) - 0.55, 0.5),
      new THREE.Vector3(7, getTerrainHeight(7, -0.8) - 0.55, -0.8),
    ];
    const pathCurve = new THREE.CatmullRomCurve3(pathPoints);
    const pathGeo = track(new THREE.TubeGeometry(pathCurve, 44, 0.85, 8, false));
    const pathMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xa8a29e,
        roughness: 0.95,
        flatShading: true,
      })
    );
    const pathMesh = new THREE.Mesh(pathGeo, pathMat);
    pathMesh.receiveShadow = true;
    island.add(pathMesh);

    // Inverted rock cliff underbelly
    const cliffGeo = track(new THREE.ConeGeometry(TOP_RADIUS * 0.96, 16, 22, 6));
    cliffGeo.rotateX(Math.PI);
    const cliffMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x3f3833,
        roughness: 0.95,
        flatShading: true,
      })
    );
    const cliffMesh = new THREE.Mesh(cliffGeo, cliffMat);
    cliffMesh.position.y = -8.5;
    cliffMesh.receiveShadow = true;
    cliffMesh.castShadow = true;
    island.add(cliffMesh);

    onProgressRef.current(68, 'Planting ancient oak, waterfall & shrine landmarks...');

    // ==========================================
    // 3. NATURE LANDMARKS (POI Geometries)
    // ==========================================
    const trunkMat = track(
      new THREE.MeshStandardMaterial({ color: 0x4a3321, roughness: 0.9, flatShading: true })
    );
    const greenFoliage = track(
      new THREE.MeshStandardMaterial({ color: 0x58a860, roughness: 0.8, flatShading: true })
    );
    const pinkFoliage = track(
      new THREE.MeshStandardMaterial({ color: 0xf492b4, roughness: 0.8, flatShading: true })
    );
    const stoneMat = track(
      new THREE.MeshStandardMaterial({ color: 0x736d67, roughness: 0.9, flatShading: true })
    );
    const runicMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xa78bfa,
        emissive: 0x6d28d9,
        emissiveIntensity: 0.5,
        roughness: 0.35,
      })
    );

    // Landmark 1: Ancient Architecture Tree
    const treeGroup = new THREE.Group();
    treeGroup.position.set(-4.5, getTerrainHeight(-4.5, -2) - 0.1, -2);
    island.add(treeGroup);

    const treeTrunk = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.85, 1.7, 6.5, 8)),
      trunkMat
    );
    treeTrunk.position.y = 3.2;
    treeTrunk.castShadow = true;
    treeGroup.add(treeTrunk);

    const f1 = new THREE.Mesh(track(new THREE.DodecahedronGeometry(3.5, 1)), greenFoliage);
    f1.position.y = 6.2;
    f1.castShadow = true;
    treeGroup.add(f1);

    const f2 = new THREE.Mesh(track(new THREE.DodecahedronGeometry(2.8, 1)), pinkFoliage);
    f2.position.set(0.8, 8.2, 0.5);
    f2.castShadow = true;
    treeGroup.add(f2);

    const f3 = new THREE.Mesh(track(new THREE.DodecahedronGeometry(2.2, 1)), pinkFoliage);
    f3.position.set(-1.2, 7.5, -0.6);
    f3.castShadow = true;
    treeGroup.add(f3);

    // Landmark 2: Cascade of Streaming APIs (Waterfall)
    const waterfallGroup = new THREE.Group();
    waterfallGroup.position.set(8.5, getTerrainHeight(8.5, -1) - 0.15, -1);
    island.add(waterfallGroup);

    const waterMat = track(
      new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.35,
        transmission: isSoftwareGl ? 0 : 0.55,
        transparent: true,
        opacity: isSoftwareGl ? 0.65 : 0.88,
        roughness: 0.12,
      })
    );
    const pond = new THREE.Mesh(
      track(new THREE.CylinderGeometry(2.4, 2.1, 0.4, 18)),
      waterMat
    );
    pond.position.set(-1.2, 0.15, 0);
    waterfallGroup.add(pond);

    const fallGeo = track(new THREE.PlaneGeometry(1.9, 16, 6, 16));
    fallGeo.rotateY(Math.PI / 2);
    const fallMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x7dd3fc,
        emissive: 0x0284c7,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.82,
        side: THREE.DoubleSide,
      })
    );
    const fallMesh = new THREE.Mesh(fallGeo, fallMat);
    fallMesh.position.set(0.6, -7.5, 0);
    waterfallGroup.add(fallMesh);

    // Landmark 3: Monolith Stone Ring (Certificates)
    const stoneGroup = new THREE.Group();
    stoneGroup.position.set(3.5, getTerrainHeight(3.5, 4) - 0.1, 4);
    island.add(stoneGroup);

    const monolithGeo = track(new THREE.BoxGeometry(0.5, 2.4, 0.4));
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const monolith = new THREE.Mesh(
        monolithGeo,
        i % 2 === 0 ? runicMat : stoneMat
      );
      monolith.position.set(Math.cos(angle) * 2.2, 1.2, Math.sin(angle) * 2.2);
      monolith.rotation.y = -angle;
      monolith.castShadow = true;
      stoneGroup.add(monolith);
    }

    // Landmark 4: Campfire of Innovation
    const campGroup = new THREE.Group();
    campGroup.position.set(-5, getTerrainHeight(-5, 4) - 0.05, 4);
    island.add(campGroup);

    const pitRing = new THREE.Mesh(
      track(new THREE.TorusGeometry(0.8, 0.15, 8, 12)),
      stoneMat
    );
    pitRing.rotation.x = Math.PI / 2;
    campGroup.add(pitRing);

    const logGeo = track(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 6));
    for (let i = 0; i < 4; i++) {
      const log = new THREE.Mesh(logGeo, trunkMat);
      log.rotation.z = Math.PI / 4;
      log.rotation.y = (i * Math.PI) / 2;
      log.position.y = 0.18;
      campGroup.add(log);
    }

    const fireLight = new THREE.PointLight(0xf97316, 2.4, 10);
    fireLight.position.set(0, 0.9, 0);
    campGroup.add(fireLight);

    const flameMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xea580c,
        emissiveIntensity: 0.9,
        roughness: 0.15,
      })
    );
    const flame = new THREE.Mesh(track(new THREE.OctahedronGeometry(0.35, 0)), flameMat);
    flame.position.y = 0.48;
    campGroup.add(flame);

    // Landmark 5: Pavilion of Inquiries (Shrine)
    const shrineGroup = new THREE.Group();
    shrineGroup.position.set(0, getTerrainHeight(0, -5.5) - 0.1, -5.5);
    island.add(shrineGroup);

    const shrineBase = new THREE.Mesh(
      track(new THREE.CylinderGeometry(2.2, 2.4, 0.5, 8)),
      stoneMat
    );
    shrineGroup.add(shrineBase);

    const pillarGeo = track(new THREE.CylinderGeometry(0.12, 0.15, 2.8, 8));
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const pillar = new THREE.Mesh(pillarGeo, trunkMat);
      pillar.position.set(Math.cos(angle) * 1.5, 1.4, Math.sin(angle) * 1.5);
      shrineGroup.add(pillar);
    }
    const shrineRoofMat = track(
      new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.75, flatShading: true })
    );
    const shrineRoof = new THREE.Mesh(
      track(new THREE.ConeGeometry(2.5, 1.2, 8)),
      shrineRoofMat
    );
    shrineRoof.position.y = 3.2;
    shrineGroup.add(shrineRoof);

    // Landmark 6: Character Monument (Profile Start)
    const profileMonument = new THREE.Group();
    profileMonument.position.set(0, getTerrainHeight(0, 5) - 0.1, 5);
    island.add(profileMonument);

    const archBase = new THREE.Mesh(
      track(new THREE.CylinderGeometry(1.6, 1.8, 0.4, 8)),
      stoneMat
    );
    profileMonument.add(archBase);

    const beaconMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x34d399,
        emissive: 0x059669,
        emissiveIntensity: 0.7,
        roughness: 0.2,
        metalness: 0.85,
      })
    );
    const beacon = new THREE.Mesh(track(new THREE.IcosahedronGeometry(0.55, 1)), beaconMat);
    beacon.position.y = 1.45;
    profileMonument.add(beacon);

    // Ground Beacon Rings + Layer-1 Tap Raycast Hitboxes for All Interactables
    const poiMarkers: Array<{
      poi: WorldInteractable;
      ring: THREE.Mesh;
      diamond: THREE.Mesh;
      light: THREE.PointLight;
    }> = [];
    const poiHitboxes: THREE.Mesh[] = [];
    const hitboxGeo = track(new THREE.CylinderGeometry(1.8, 1.8, 3.6, 12));
    const hitboxMat = track(new THREE.MeshBasicMaterial({ visible: false }));
    const diamondGeo = track(new THREE.OctahedronGeometry(0.4, 0));

    WORLD_INTERACTABLES.forEach((poi) => {
      const groundY = getTerrainHeight(poi.worldPos[0], poi.worldPos[2]);
      const pGroup = new THREE.Group();
      pGroup.position.set(poi.worldPos[0], groundY + 0.08, poi.worldPos[2]);
      island.add(pGroup);

      const ringGeo = track(new THREE.RingGeometry(poi.radius * 0.38, poi.radius * 0.46, 32));
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = track(
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(poi.glowColor),
          transparent: true,
          opacity: 0.55,
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
          roughness: 0.2,
          metalness: 0.5,
        })
      );
      const diamond = new THREE.Mesh(diamondGeo, diamondMat);
      diamond.position.y = 3.2;
      pGroup.add(diamond);

      const pLight = new THREE.PointLight(new THREE.Color(poi.glowColor), 1.4, 8);
      pLight.position.y = 3.2;
      pGroup.add(pLight);

      // Dedicated raycast proxy mesh on layer 1 for effortless tap/click inspection
      const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
      hitbox.position.y = 1.8;
      hitbox.layers.set(1);
      hitbox.userData.poi = poi;
      pGroup.add(hitbox);
      poiHitboxes.push(hitbox);

      poiMarkers.push({ poi, ring: ringMesh, diamond, light: pLight });
    });

    // ==========================================
    // 4. LOW-POLY PLAYER CHARACTER AVATAR
    // ==========================================
    const playerAvatar = new THREE.Group();
    playerAvatar.position.copy(playerPos.current);
    playerAvatar.rotation.y = playerAngle.current;
    scene.add(playerAvatar);

    const cloakMat = track(new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 }));
    const torso = new THREE.Mesh(track(new THREE.ConeGeometry(0.45, 1.1, 8)), cloakMat);
    torso.position.y = 0.65;
    torso.castShadow = true;
    playerAvatar.add(torso);

    const headMat = track(new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.5 }));
    const head = new THREE.Mesh(track(new THREE.SphereGeometry(0.24, 12, 12)), headMat);
    head.position.y = 1.35;
    head.castShadow = true;
    playerAvatar.add(head);

    const capMat = track(new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 }));
    const cap = new THREE.Mesh(track(new THREE.ConeGeometry(0.3, 0.4, 8)), capMat);
    cap.position.set(0, 1.55, -0.05);
    playerAvatar.add(cap);

    const scarfMat = track(new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.75 }));
    const scarf = new THREE.Mesh(track(new THREE.BoxGeometry(0.28, 0.5, 0.08)), scarfMat);
    scarf.position.set(0, 0.9, -0.28);
    playerAvatar.add(scarf);

    const shadowMat = track(
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      })
    );
    const shadowMesh = new THREE.Mesh(track(new THREE.CircleGeometry(0.5, 16)), shadowMat);
    shadowMesh.rotateX(-Math.PI / 2);
    shadowMesh.position.y = 0.03;
    playerAvatar.add(shadowMesh);

    // ==========================================
    // 5. SURROUNDING PINES & FIREFLIES
    // ==========================================
    const pineMat = track(
      new THREE.MeshStandardMaterial({ color: 0x22543d, roughness: 0.9, flatShading: true })
    );
    const pineTrunkGeo = track(new THREE.CylinderGeometry(0.18, 0.3, 1.6, 6));
    const pineCone1Geo = track(new THREE.ConeGeometry(1.5, 2.0, 6));
    const pineCone2Geo = track(new THREE.ConeGeometry(1.1, 1.6, 6));

    const createPine = (x: number, z: number, s = 1) => {
      const p = new THREE.Group();
      p.position.set(x, getTerrainHeight(x, z) - 0.15, z);
      p.scale.set(s, s, s);

      const t = new THREE.Mesh(pineTrunkGeo, trunkMat);
      t.position.y = 0.8;
      p.add(t);

      const c1 = new THREE.Mesh(pineCone1Geo, pineMat);
      c1.position.y = 2.0;
      p.add(c1);

      const c2 = new THREE.Mesh(pineCone2Geo, pineMat);
      c2.position.y = 3.0;
      p.add(c2);

      island.add(p);
    };

    createPine(-7.5, -4, 1.1);
    createPine(-9, 1, 0.85);
    createPine(-6.5, -7, 0.9);
    createPine(1.5, -8, 1.2);
    createPine(5, -6.5, 0.95);

    const fireflyCount = 130;
    const fireflyGeo = track(new THREE.BufferGeometry());
    const fireflyPos = new Float32Array(fireflyCount * 3);
    const fireflyBaseY = new Float32Array(fireflyCount);
    for (let i = 0; i < fireflyCount; i++) {
      fireflyPos[i * 3] = (Math.random() - 0.5) * 26;
      const baseY = 1.6 + Math.random() * 7.5;
      fireflyBaseY[i] = baseY;
      fireflyPos[i * 3 + 1] = baseY;
      fireflyPos[i * 3 + 2] = (Math.random() - 0.5) * 26;
    }
    fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPos, 3));
    const fireflyMat = track(
      new THREE.PointsMaterial({
        color: 0xfef08a,
        size: 0.36,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    const fireflies = new THREE.Points(fireflyGeo, fireflyMat);
    scene.add(fireflies);

    onProgressRef.current(86, 'Calibrating touch & keyboard navigation...');

    // ==========================================
    // 6. FAST TRAVEL & PROXIMITY EVALUATION
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
        }
      }

      for (const marker of poiMarkers) {
        const isNear = closestPoi?.id === marker.poi.id;
        const scale = isNear
          ? 1 + Math.sin(elapsed * 4) * 0.14
          : 1 + Math.sin(elapsed * 2) * 0.05;
        marker.ring.scale.set(scale, scale, scale);
        marker.diamond.rotation.y += 0.025;
        marker.light.intensity = isNear ? 2.4 : 1.2;
      }
    };

    teleportToPoi.current = (poi: WorldInteractable) => {
      // Land right inside the beacon perimeter facing the landmark
      const angleFromCenter = Math.atan2(poi.worldPos[2], poi.worldPos[0]);
      const landX = poi.worldPos[0] - Math.cos(angleFromCenter) * 2.1;
      const landZ = poi.worldPos[2] - Math.sin(angleFromCenter) * 2.1;

      const dist = Math.hypot(landX, landZ);
      const clampedX = dist > MAX_ISLAND_RADIUS ? (landX / dist) * MAX_ISLAND_RADIUS : landX;
      const clampedZ = dist > MAX_ISLAND_RADIUS ? (landZ / dist) * MAX_ISLAND_RADIUS : landZ;

      playerPos.current.set(clampedX, getTerrainHeight(clampedX, clampedZ), clampedZ);
      playerAngle.current = Math.atan2(
        poi.worldPos[0] - clampedX,
        poi.worldPos[2] - clampedZ
      );

      // Swing orbit camera gently behind the new facing direction
      cameraOrbitYaw.current = playerAngle.current + Math.PI;
      walkAudio.playDiscoveryChime(659.25);
      evaluateProximity(0);
    };

    // ==========================================
    // 7. INPUT: KEYBOARD, POINTER ORBIT, PINCH ZOOM, TAP RAYCAST
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

    // Unified Pointer Events on WebGL Canvas (Single-finger Orbit + Two-finger Pinch + Tap Raycast)
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
        // Smooth horizontal/vertical orbit drag
        cameraOrbitYaw.current -= dx * 0.006;
        cameraOrbitPitch.current = THREE.MathUtils.clamp(
          cameraOrbitPitch.current + dy * 0.004,
          0.12,
          0.85
        );
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

    // WebGL Context Loss & Restoration Safety
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      onErrorRef.current(
        'context-lost',
        'WebGL context was paused by the browser or GPU.'
      );
    };
    const handleContextRestored = () => {
      renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    };
    canvasEl.addEventListener('webglcontextlost', handleContextLost);
    canvasEl.addEventListener('webglcontextrestored', handleContextRestored);

    // Responsive Resize Observer + Orientation Change
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

    // Pre-warm shaders before showing the world
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    onProgressRef.current(100, 'Sanctuary ready!');
    // Slight defer so 100% progress bar paints cleanly before fading out
    const readyTimer = window.setTimeout(() => {
      onReadyRef.current();
    }, 260);

    // ==========================================
    // 8. ANIMATION & KINEMATICS LOOP
    // ==========================================
    let frameId = 0;
    let isDisposed = false;
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

        // Camera basis vectors projected onto XZ plane
        const yaw = cameraOrbitYaw.current;
        const fwdX = -Math.sin(yaw);
        const fwdZ = -Math.cos(yaw);
        const rightX = Math.cos(yaw);
        const rightZ = -Math.sin(yaw);

        const moveX = fwdX * normFwd + rightX * normRight;
        const moveZ = fwdZ * normFwd + rightZ * normRight;

        const walkSpeed = 6.4 * clampedMag;
        playerPos.current.x += moveX * walkSpeed * delta;
        playerPos.current.z += moveZ * walkSpeed * delta;

        // Smoothly turn avatar towards movement vector
        const targetAngle = Math.atan2(moveX, moveZ);
        const angleDiff = Math.atan2(
          Math.sin(targetAngle - playerAngle.current),
          Math.cos(targetAngle - playerAngle.current)
        );
        playerAngle.current += angleDiff * (1 - Math.exp(-12 * delta));

        // Footstep audio pacing
        stepTimerRef.current += delta * clampedMag;
        if (stepTimerRef.current > 0.34) {
          walkAudio.playFootstep();
          stepTimerRef.current = 0;
        }
      }

      // Clamp player within island boundary
      const distFromCenter = Math.hypot(playerPos.current.x, playerPos.current.z);
      if (distFromCenter > MAX_ISLAND_RADIUS) {
        playerPos.current.x = (playerPos.current.x / distFromCenter) * MAX_ISLAND_RADIUS;
        playerPos.current.z = (playerPos.current.z / distFromCenter) * MAX_ISLAND_RADIUS;
      }

      // Exact terrain elevation under player
      playerPos.current.y = getTerrainHeight(playerPos.current.x, playerPos.current.z);

      // Avatar transform + gentle walk bob
      playerAvatar.position.copy(playerPos.current);
      playerAvatar.rotation.y = playerAngle.current;

      if (isMoving) {
        playerAvatar.position.y += Math.abs(Math.sin(elapsed * 12)) * 0.11;
        torso.rotation.z = THREE.MathUtils.damp(
          torso.rotation.z,
          Math.sin(elapsed * 12) * 0.08,
          12,
          delta
        );
        scarf.rotation.x = THREE.MathUtils.damp(
          scarf.rotation.x,
          0.32 + Math.sin(elapsed * 12) * 0.2,
          12,
          delta
        );
      } else {
        torso.rotation.z = THREE.MathUtils.damp(torso.rotation.z, 0, 10, delta);
        scarf.rotation.x = THREE.MathUtils.damp(scarf.rotation.x, 0.1, 10, delta);
      }

      // Landmark proximity check
      evaluateProximity(elapsed);

      // Frame-rate independent smooth 3rd-person orbit camera
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
        playerPos.current.y + 1.65 + Math.sin(cameraOrbitPitch.current) * effectiveDistance,
        playerPos.current.z + Math.cos(cameraOrbitYaw.current) * horizDist
      );
      _desiredTargetPos.set(
        playerPos.current.x,
        playerPos.current.y + 1.15,
        playerPos.current.z
      );

      const camSmooth = 1 - Math.exp(-8 * delta);
      cameraActual.current.lerp(_desiredCamPos, camSmooth);
      cameraTarget.current.lerp(_desiredTargetPos, 1 - Math.exp(-10 * delta));

      camera.position.copy(cameraActual.current);
      camera.lookAt(cameraTarget.current);

      // Ambient world animations (waterfall shimmer, campfire flicker, fireflies, beacon)
      const fPos = fallGeo.attributes.position;
      for (let i = 0; i < fPos.count; i++) {
        const y = fPos.getY(i);
        fPos.setZ(i, Math.sin(y * 1.8 - elapsed * 7) * 0.08);
      }
      fPos.needsUpdate = true;

      fireLight.intensity = 2.1 + Math.sin(elapsed * 14) * 0.45;
      flame.rotation.y += 2.4 * delta;

      const ffPos = fireflyGeo.attributes.position;
      for (let i = 0; i < fireflyCount; i++) {
        ffPos.setY(i, fireflyBaseY[i] + Math.sin(elapsed * 1.6 + i) * 0.45);
      }
      ffPos.needsUpdate = true;

      beacon.rotation.y += 1.2 * delta;

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
  }, [joystickRef]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing"
    />
  );
};
