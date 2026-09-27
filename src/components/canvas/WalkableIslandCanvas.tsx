import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { WORLD_INTERACTABLES, WorldInteractable } from '../../data/worldData';
import { walkAudio } from '../../utils/walkAudio';

interface WalkableIslandCanvasProps {
  onNearbyInteractable: (poi: WorldInteractable | null) => void;
  onOpenInteractable: (poi: WorldInteractable) => void;
  activeInspectPoi: WorldInteractable | null;
  triggerTeleportId?: string | null;
}

export const WalkableIslandCanvas: React.FC<WalkableIslandCanvasProps> = ({
  onNearbyInteractable,
  onOpenInteractable,
  activeInspectPoi,
  triggerTeleportId
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [nearbyPoiState, setNearbyPoiState] = useState<WorldInteractable | null>(null);

  // Character State in world coordinates
  const playerPos = useRef(new THREE.Vector3(0, 1.2, 7)); // Start on front grassy path
  const playerAngle = useRef(0); // Facing north (towards center)
  const playerVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const isWalkingRef = useRef(false);
  const stepTimerRef = useRef(0);

  // Camera settings
  const cameraTarget = useRef(new THREE.Vector3(0, 2.5, 7));
  const cameraActual = useRef(new THREE.Vector3(0, 5.5, 14));

  // Key tracking
  const keysDown = useRef<{ [key: string]: boolean }>({});

  // Mouse drag camera orbit rotation
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const cameraOrbitYaw = useRef(0);
  const cameraOrbitPitch = useRef(0.28); // Angle looking slightly down at avatar

  // Teleport listener
  useEffect(() => {
    if (triggerTeleportId) {
      const found = WORLD_INTERACTABLES.find((p) => p.id === triggerTeleportId);
      if (found) {
        // Teleport player near the landmark
        const offsetAngle = Math.atan2(found.worldPos[2], found.worldPos[0]) + Math.PI;
        playerPos.current.set(
          found.worldPos[0] + Math.cos(offsetAngle) * 2.2,
          1.2,
          found.worldPos[2] + Math.sin(offsetAngle) * 2.2
        );
        playerAngle.current = Math.atan2(
          found.worldPos[0] - playerPos.current.x,
          found.worldPos[2] - playerPos.current.z
        );
        walkAudio.playDiscoveryChime(659.25);
      }
    }
  }, [triggerTeleportId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Test WebGL support
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    if (!gl) {
      setWebglSupported(false);
      return;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x13271f, 0.013);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 700);
    camera.position.set(0, 6, 14);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // ==========================================
    // 1. LIGHTING (Sunny nature atmosphere)
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0xfff5e0, 0.95);
    scene.add(ambientLight);

    const sun = new THREE.DirectionalLight(0xfffaec, 2.3);
    sun.position.set(24, 38, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 120;
    sun.shadow.camera.left = -22;
    sun.shadow.camera.right = 22;
    sun.shadow.camera.top = 22;
    sun.shadow.camera.bottom = -22;
    sun.shadow.bias = -0.0006;
    scene.add(sun);

    const hemiLight = new THREE.HemisphereLight(0x73c2fb, 0x224430, 0.85);
    scene.add(hemiLight);

    // ==========================================
    // 2. NATURE ISLAND TERRAIN
    // ==========================================
    const island = new THREE.Group();
    scene.add(island);

    // Top lush grassy plate
    const topRadius = 14.5;
    const grassGeo = new THREE.CylinderGeometry(topRadius, topRadius * 0.96, 2.5, 36, 4);
    const grassPos = grassGeo.attributes.position;
    for (let i = 0; i < grassPos.count; i++) {
      const y = grassPos.getY(i);
      if (y > 0.5) {
        const x = grassPos.getX(i);
        const z = grassPos.getZ(i);
        const dist = Math.sqrt(x * x + z * z);
        const wave = Math.sin(x * 0.35) * Math.cos(z * 0.35) * 0.7;
        grassPos.setY(i, y + wave + (dist > 11 ? -0.4 : 0));
      }
    }
    grassGeo.computeVertexNormals();

    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x4d8853,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true
    });
    const grassMesh = new THREE.Mesh(grassGeo, grassMat);
    grassMesh.receiveShadow = true;
    grassMesh.castShadow = true;
    island.add(grassMesh);

    // Stone pathway winding through the island
    const pathCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.26, 8.5),
      new THREE.Vector3(0, 1.26, 4),
      new THREE.Vector3(-2, 1.26, 1),
      new THREE.Vector3(-3.5, 1.26, -1.8), // Branch to Ancient Tree
      new THREE.Vector3(0, 1.26, -2),
      new THREE.Vector3(0, 1.26, -4.5), // Branch to Shrine
      new THREE.Vector3(3.2, 1.26, 0),
      new THREE.Vector3(5.5, 1.26, 0.5),
      new THREE.Vector3(7, 1.26, -0.8) // Branch to Waterfall
    ]);
    const pathGeo = new THREE.TubeGeometry(pathCurve, 40, 0.9, 8, false);
    const pathMat = new THREE.MeshStandardMaterial({
      color: 0xa8a29e,
      roughness: 0.95,
      flatShading: true
    });
    const pathMesh = new THREE.Mesh(pathGeo, pathMat);
    pathMesh.receiveShadow = true;
    island.add(pathMesh);

    // Bottom Inverted Cliff Underbelly
    const cliffGeo = new THREE.ConeGeometry(topRadius * 0.96, 16, 22, 6);
    cliffGeo.rotateX(Math.PI);
    const cliffMat = new THREE.MeshStandardMaterial({
      color: 0x3f3833,
      roughness: 0.95,
      flatShading: true
    });
    const cliffMesh = new THREE.Mesh(cliffGeo, cliffMat);
    cliffMesh.position.y = -8.5;
    cliffMesh.receiveShadow = true;
    cliffMesh.castShadow = true;
    island.add(cliffMesh);

    // ==========================================
    // 3. NATURE LANDMARKS (POI Geometries)
    // ==========================================

    // Landmark 1: Ancient Architecture Tree (Java / Spring)
    const treeGroup = new THREE.Group();
    treeGroup.position.set(-4.5, 1.2, -2);
    island.add(treeGroup);

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3321, roughness: 0.9, flatShading: true });
    const treeTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.7, 6.5, 8), trunkMat);
    treeTrunk.position.y = 3.2;
    treeTrunk.castShadow = true;
    treeGroup.add(treeTrunk);

    const greenFoliage = new THREE.MeshStandardMaterial({ color: 0x58a860, roughness: 0.8, flatShading: true });
    const pinkFoliage = new THREE.MeshStandardMaterial({ color: 0xf492b4, roughness: 0.8, flatShading: true });

    const f1 = new THREE.Mesh(new THREE.DodecahedronGeometry(3.5, 1), greenFoliage);
    f1.position.y = 6.2;
    f1.castShadow = true;
    treeGroup.add(f1);

    const f2 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.8, 1), pinkFoliage);
    f2.position.set(0.8, 8.2, 0.5);
    f2.castShadow = true;
    treeGroup.add(f2);

    const f3 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2, 1), pinkFoliage);
    f3.position.set(-1.2, 7.5, -0.6);
    f3.castShadow = true;
    treeGroup.add(f3);

    // Landmark 2: Waterfall (Data & APIs)
    const waterfallGroup = new THREE.Group();
    waterfallGroup.position.set(8.5, 0.9, -1);
    island.add(waterfallGroup);

    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      transmission: 0.6,
      transparent: true,
      opacity: 0.85,
      roughness: 0.1
    });
    const pond = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.1, 0.4, 16), waterMat);
    pond.position.set(-1.2, 0.1, 0);
    waterfallGroup.add(pond);

    const fallGeo = new THREE.PlaneGeometry(1.9, 16, 8, 20);
    fallGeo.rotateY(Math.PI / 2);
    const fallMesh = new THREE.Mesh(
      fallGeo,
      new THREE.MeshStandardMaterial({
        color: 0x7dd3fc,
        emissive: 0x0284c7,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      })
    );
    fallMesh.position.set(0.6, -7.5, 0);
    waterfallGroup.add(fallMesh);

    // Landmark 3: Monolith Stone Ring (Certificates)
    const stoneGroup = new THREE.Group();
    stoneGroup.position.set(3.5, 1.2, 4);
    island.add(stoneGroup);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x736d67, roughness: 0.9, flatShading: true });
    const runicMat = new THREE.MeshStandardMaterial({ color: 0xa78bfa, emissive: 0x6d28d9, roughness: 0.3 });

    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const monolith = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 2.4, 0.4),
        i % 2 === 0 ? runicMat : stoneMat
      );
      monolith.position.set(Math.cos(angle) * 2.2, 1.2, Math.sin(angle) * 2.2);
      monolith.rotation.y = -angle;
      monolith.castShadow = true;
      stoneGroup.add(monolith);
    }

    // Landmark 4: Campfire (IoT & Innovation)
    const campGroup = new THREE.Group();
    campGroup.position.set(-5, 1.2, 4);
    island.add(campGroup);
    const pitRing = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.15, 8, 12), stoneMat);
    pitRing.rotation.x = Math.PI / 2;
    campGroup.add(pitRing);

    for (let i = 0; i < 4; i++) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 6), trunkMat);
      log.rotation.z = Math.PI / 4;
      log.rotation.y = (i * Math.PI) / 2;
      log.position.y = 0.15;
      campGroup.add(log);
    }

    const fireLight = new THREE.PointLight(0xf97316, 2.5, 10);
    fireLight.position.set(0, 0.9, 0);
    campGroup.add(fireLight);

    const flame = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.35, 0),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xea580c, roughness: 0.1 })
    );
    flame.position.y = 0.45;
    campGroup.add(flame);

    // Landmark 5: Shrine Pavilion (Contact & Resume)
    const shrineGroup = new THREE.Group();
    shrineGroup.position.set(0, 1.2, -5.5);
    island.add(shrineGroup);

    const shrineBase = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, 0.5, 8), stoneMat);
    shrineGroup.add(shrineBase);

    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 2.8, 8), trunkMat);
      pillar.position.set(Math.cos(angle) * 1.5, 1.4, Math.sin(angle) * 1.5);
      shrineGroup.add(pillar);
    }
    const shrineRoof = new THREE.Mesh(
      new THREE.ConeGeometry(2.5, 1.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.8, flatShading: true })
    );
    shrineRoof.position.y = 3.2;
    shrineGroup.add(shrineRoof);

    // Landmark 6: Character Monument (Dilini Profile Start)
    const profileMonument = new THREE.Group();
    profileMonument.position.set(0, 1.2, 5);
    island.add(profileMonument);

    const archBase = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.4, 8), stoneMat);
    profileMonument.add(archBase);

    // Sculpted glowing golden beacon
    const beacon = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.55, 1),
      new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x059669, roughness: 0.2, metalness: 0.8 })
    );
    beacon.position.y = 1.4;
    profileMonument.add(beacon);

    // Pulsing Beacon Rings on all Interactables
    const poiMarkers: { group: THREE.Group; poi: WorldInteractable; ring: THREE.Mesh; light: THREE.PointLight }[] = [];

    WORLD_INTERACTABLES.forEach((poi) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(poi.worldPos[0], poi.worldPos[1] + 0.05, poi.worldPos[2]);
      island.add(pGroup);

      // Glowing circle on ground
      const ringGeo = new THREE.RingGeometry(poi.radius * 0.4, poi.radius * 0.48, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(poi.glowColor),
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      pGroup.add(ringMesh);

      // Floating diamond beacon marker
      const diamond = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.4, 0),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(poi.glowColor),
          emissive: new THREE.Color(poi.glowColor),
          emissiveIntensity: 0.6,
          roughness: 0.2
        })
      );
      diamond.position.y = 3.2;
      pGroup.add(diamond);

      const pLight = new THREE.PointLight(new THREE.Color(poi.glowColor), 1.5, 8);
      pLight.position.y = 3.2;
      pGroup.add(pLight);

      poiMarkers.push({ group: pGroup, poi, ring: ringMesh, light: pLight });
    });

    // ==========================================
    // 4. LOW-POLY PLAYER CHARACTER AVATAR
    // ==========================================
    const playerAvatar = new THREE.Group();
    playerAvatar.position.copy(playerPos.current);
    scene.add(playerAvatar);

    // Torso (Traveler Cloak)
    const cloakMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 }); // Forest Green
    const torso = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.1, 8), cloakMat);
    torso.position.y = 0.65;
    torso.castShadow = true;
    playerAvatar.add(torso);

    // Head
    const headMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.5 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), headMat);
    head.position.y = 1.35;
    head.castShadow = true;
    playerAvatar.add(head);

    // Hair / Explorer Cap
    const capMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.4, 8), capMat);
    cap.position.set(0, 1.55, -0.05);
    playerAvatar.add(cap);

    // Traveler Scarf / Cloak Tail
    const scarf = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.5, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.8 })
    );
    scarf.position.set(0, 0.9, -0.28);
    playerAvatar.add(scarf);

    // Soft player shadow
    const shadowMesh = new THREE.Mesh(
      new THREE.CircleGeometry(0.5, 16),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 })
    );
    shadowMesh.rotateX(-Math.PI / 2);
    shadowMesh.position.y = 0.02;
    playerAvatar.add(shadowMesh);

    // ==========================================
    // 5. SURROUNDING NATURE: TREES, FIREFLIES, CLOUDS
    // ==========================================
    const pineMat = new THREE.MeshStandardMaterial({ color: 0x22543d, roughness: 0.9, flatShading: true });
    const createPine = (x: number, z: number, s = 1) => {
      const p = new THREE.Group();
      p.position.set(x, 1, z);
      p.scale.set(s, s, s);

      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.3, 1.6, 6), trunkMat);
      t.position.y = 0.8;
      p.add(t);

      const c1 = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2.0, 6), pineMat);
      c1.position.y = 2.0;
      p.add(c1);

      const c2 = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.6, 6), pineMat);
      c2.position.y = 3.0;
      p.add(c2);

      island.add(p);
    };

    createPine(-7.5, -4, 1.1);
    createPine(-9, 1, 0.85);
    createPine(-6.5, -7, 0.9);
    createPine(1.5, -8, 1.2);
    createPine(5, -6.5, 0.95);

    // Floating fireflies
    const fireflyCount = 140;
    const fireflyGeo = new THREE.BufferGeometry();
    const fireflyPos = new Float32Array(fireflyCount * 3);
    for (let i = 0; i < fireflyCount; i++) {
      fireflyPos[i * 3] = (Math.random() - 0.5) * 26;
      fireflyPos[i * 3 + 1] = 1 + Math.random() * 8;
      fireflyPos[i * 3 + 2] = (Math.random() - 0.5) * 26;
    }
    fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPos, 3));
    const fireflyMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.38,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const fireflies = new THREE.Points(fireflyGeo, fireflyMat);
    scene.add(fireflies);

    // ==========================================
    // 6. INPUT HANDLING: KEYBOARD & MOUSE DRAG
    // ==========================================
    const handleKeyDown = (e: KeyboardEvent) => {
      keysDown.current[e.key.toLowerCase()] = true;
      keysDown.current[e.code.toLowerCase()] = true;

      // Handle interaction key 'E' or Space
      if (e.key.toLowerCase() === 'e' || e.code === 'Space') {
        if (nearbyPoiState) {
          walkAudio.playDiscoveryChime(783.99);
          onOpenInteractable(nearbyPoiState);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.current[e.key.toLowerCase()] = false;
      keysDown.current[e.code.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Mouse drag for camera orbit rotation
    const handleMouseDown = (e: MouseEvent) => {
      // Only drag if not clicking buttons/UI
      if ((e.target as HTMLElement).tagName !== 'BUTTON' && (e.target as HTMLElement).tagName !== 'A') {
        isDragging.current = true;
        previousMousePosition.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      cameraOrbitYaw.current -= deltaX * 0.005;
      cameraOrbitPitch.current = Math.max(0.1, Math.min(0.65, cameraOrbitPitch.current + deltaY * 0.003));

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ==========================================
    // 7. ANIMATION & PHYSICS LOOP
    // ==========================================
    let animationFrameId: number;
    const clock = new THREE.Clock();
    let lastFoundNearby: WorldInteractable | null = null;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Read movement inputs (WASD or Arrow keys)
      let moveForward = 0;
      let moveSideway = 0;

      if (keysDown.current['w'] || keysDown.current['arrowup']) moveForward += 1;
      if (keysDown.current['s'] || keysDown.current['arrowdown']) moveForward -= 1;
      if (keysDown.current['a'] || keysDown.current['arrowleft']) moveSideway -= 1;
      if (keysDown.current['d'] || keysDown.current['arrowright']) moveSideway += 1;

      const isMoving = moveForward !== 0 || moveSideway !== 0;
      isWalkingRef.current = isMoving;

      if (isMoving) {
        // Calculate movement direction relative to camera orbit yaw
        const inputAngle = Math.atan2(moveSideway, moveForward);
        const moveAngle = cameraOrbitYaw.current + inputAngle;

        const walkSpeed = 6.2;
        playerVelocity.current.x = Math.sin(moveAngle) * walkSpeed;
        playerVelocity.current.z = Math.cos(moveAngle) * walkSpeed;

        // Turn character towards direction of motion
        playerAngle.current = moveAngle;

        // Footstep audio pacing
        stepTimerRef.current += delta;
        if (stepTimerRef.current > 0.32) {
          walkAudio.playFootstep();
          stepTimerRef.current = 0;
        }
      } else {
        playerVelocity.current.set(0, 0, 0);
      }

      // Update player position with island boundary restraint
      playerPos.current.x += playerVelocity.current.x * delta;
      playerPos.current.z += playerVelocity.current.z * delta;

      // Restrain player to island radius (prevent falling off)
      const distanceFromCenter = Math.sqrt(
        playerPos.current.x * playerPos.current.x + playerPos.current.z * playerPos.current.z
      );
      const maxIslandRadius = topRadius - 1.2;
      if (distanceFromCenter > maxIslandRadius) {
        playerPos.current.x = (playerPos.current.x / distanceFromCenter) * maxIslandRadius;
        playerPos.current.z = (playerPos.current.z / distanceFromCenter) * maxIslandRadius;
      }

      // Compute terrain elevation under player
      const terrainHeight =
        1.2 +
        Math.sin(playerPos.current.x * 0.35) * Math.cos(playerPos.current.z * 0.35) * 0.6;
      playerPos.current.y = terrainHeight;

      // Update avatar 3D transform
      playerAvatar.position.copy(playerPos.current);
      playerAvatar.rotation.y = playerAngle.current;

      // Avatar walking bob animation
      if (isMoving) {
        playerAvatar.position.y += Math.abs(Math.sin(elapsed * 12)) * 0.12;
        torso.rotation.z = Math.sin(elapsed * 12) * 0.08;
        scarf.rotation.x = 0.3 + Math.sin(elapsed * 12) * 0.2;
      } else {
        torso.rotation.z = 0;
        scarf.rotation.x = 0.1;
      }

      // Proximity check to Landmarks
      let closestPoi: WorldInteractable | null = null;
      let minDistance = Infinity;

      WORLD_INTERACTABLES.forEach((poi) => {
        const dx = playerPos.current.x - poi.worldPos[0];
        const dz = playerPos.current.z - poi.worldPos[2];
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < poi.radius && dist < minDistance) {
          closestPoi = poi;
          minDistance = dist;
        }
      });

      if (closestPoi !== lastFoundNearby) {
        lastFoundNearby = closestPoi;
        setNearbyPoiState(closestPoi);
        onNearbyInteractable(closestPoi);
        if (closestPoi) {
          walkAudio.playDiscoveryChime(528);
        }
      }

      // Pulse POI marker rings & float diamond beacons
      poiMarkers.forEach(({ ring, light, poi }) => {
        const isNear = closestPoi?.id === poi.id;
        const scale = isNear ? 1 + Math.sin(elapsed * 4) * 0.15 : 1 + Math.sin(elapsed * 2) * 0.05;
        ring.scale.set(scale, scale, scale);
        light.intensity = isNear ? 2.5 : 1.2;
      });

      // Update 3rd-Person Follow Camera
      // Camera sits behind player at orbital angle
      const cameraDistance = 7.5;
      const camX = playerPos.current.x - Math.sin(cameraOrbitYaw.current) * cameraDistance * Math.cos(cameraOrbitPitch.current);
      const camZ = playerPos.current.z - Math.cos(cameraOrbitYaw.current) * cameraDistance * Math.cos(cameraOrbitPitch.current);
      const camY = playerPos.current.y + 1.8 + Math.sin(cameraOrbitPitch.current) * cameraDistance;

      cameraActual.current.lerp(new THREE.Vector3(camX, camY, camZ), 0.08);
      cameraTarget.current.lerp(
        new THREE.Vector3(playerPos.current.x, playerPos.current.y + 1.2, playerPos.current.z),
        0.1
      );

      camera.position.copy(cameraActual.current);
      camera.lookAt(cameraTarget.current);

      // Animate waterfall surface wave
      const fPos = fallGeo.attributes.position;
      for (let i = 0; i < fPos.count; i++) {
        const y = fPos.getY(i);
        fPos.setZ(i, Math.sin(y * 2 - elapsed * 8) * 0.08);
      }
      fallGeo.computeVertexNormals();
      fallGeo.attributes.position.needsUpdate = true;

      // Animate campfire flickering
      fireLight.intensity = 2.2 + Math.sin(elapsed * 14) * 0.5;
      flame.rotation.y += 2.5 * delta;

      // Gentle firefly floating
      const ffPos = fireflyGeo.attributes.position;
      for (let i = 0; i < fireflyCount; i++) {
        const i3 = i * 3;
        ffPos.setY(i3 + 1, ffPos.getY(i3 + 1) + Math.sin(elapsed * 2 + i) * 0.015);
      }
      ffPos.needsUpdate = true;

      beacon.rotation.y += 1.2 * delta;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      renderer.dispose();
      grassGeo.dispose();
      cliffGeo.dispose();
      grassMat.dispose();
      cliffMat.dispose();
      fireflyGeo.dispose();
      fireflyMat.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing" />

      {/* Fallback Container */}
      {!webglSupported && (
        <div className="absolute inset-0 bg-[#0e1d16] flex items-center justify-center p-6 text-center z-0">
          <div className="max-w-md p-6 rounded-2xl border border-emerald-500/30 bg-[#12221b] text-emerald-200">
            <h3 className="font-serif text-lg">WebGL Disabled</h3>
            <p className="text-xs text-emerald-100/70 mt-1">Please enable hardware graphics acceleration in your browser to walk through this 3D sanctuary.</p>
          </div>
        </div>
      )}
    </div>
  );
};
