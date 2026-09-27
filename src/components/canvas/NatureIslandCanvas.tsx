import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { natureAudio } from '../../utils/natureAudio';

export interface LandmarkTarget {
  id: string;
  name: string;
  category: string;
  description: string;
  cameraPos: [number, number, number];
  targetPos: [number, number, number];
  color: string;
}

export const NATURE_LANDMARKS: LandmarkTarget[] = [
  {
    id: 'overview',
    name: 'Floating Sanctuary',
    category: 'Entire Realm',
    description: 'Serene overview of the floating island ecosystem hovering high in the clouds.',
    cameraPos: [0, 14, 30],
    targetPos: [0, 2, 0],
    color: '#86efac'
  },
  {
    id: 'ancient-tree',
    name: 'Ancient Architecture Tree',
    category: 'Backend Core',
    description: 'The towering sacred oak representing Java 17 and Spring Boot foundations.',
    cameraPos: [-4, 8, 12],
    targetPos: [-3.5, 4.5, -2],
    color: '#fbbf24'
  },
  {
    id: 'waterfall',
    name: 'Cascade of Streaming APIs',
    category: 'Data & Event Flow',
    description: 'A crystalline mountain spring plunging into the mist, mirroring RabbitMQ and REST data streams.',
    cameraPos: [10, 6, 14],
    targetPos: [7.5, 1, -2],
    color: '#38bdf8'
  },
  {
    id: 'stone-circle',
    name: 'Stone Ring of Knowledge',
    category: 'Skills & Tools',
    description: 'Ancient monolithic stone tablets engraved with database vaults and container runes.',
    cameraPos: [5, 5, 8],
    targetPos: [3, 1.5, 3.5],
    color: '#a78bfa'
  },
  {
    id: 'campfire',
    name: 'Campfire of Innovation',
    category: 'Edge AI & IoT',
    description: 'A warm crackling fire where AI-powered smart glasses and AuraLink sensor nodes were forged.',
    cameraPos: [-7, 4, 10],
    targetPos: [-5, 1.2, 3],
    color: '#f87171'
  },
  {
    id: 'shrine',
    name: 'Shrine of Milestones',
    category: 'Credentials & Honors',
    description: 'A tranquil stone gazebo safeguarding 13 verified university and industry certifications.',
    cameraPos: [0, 7, 10],
    targetPos: [0, 3, -5.5],
    color: '#facc15'
  }
];

interface NatureIslandCanvasProps {
  activeLandmark: string;
  onSelectLandmark: (id: string) => void;
  className?: string;
}

export const NatureIslandCanvas: React.FC<NatureIslandCanvasProps> = ({
  activeLandmark,
  onSelectLandmark,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [isRotating, setIsRotating] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>('day');

  // Keep ref of active landmark so animate loop can interpolate camera smoothly
  const targetCameraPos = useRef(new THREE.Vector3(0, 14, 30));
  const targetLookAt = useRef(new THREE.Vector3(0, 2, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 2, 0));

  // Update target positions when landmark changes
  useEffect(() => {
    const lm = NATURE_LANDMARKS.find((l) => l.id === activeLandmark) || NATURE_LANDMARKS[0];
    targetCameraPos.current.set(...lm.cameraPos);
    targetLookAt.current.set(...lm.targetPos);
  }, [activeLandmark]);

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

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x1a2e26, 0.012);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 800);
    camera.position.set(0, 14, 30);

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
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // ==========================================
    // 1. LIGHTING
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0xfff7e6, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    sunLight.position.set(22, 35, 18);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.camera.left = -20;
    sunLight.shadow.camera.right = 20;
    sunLight.shadow.camera.top = 20;
    sunLight.shadow.camera.bottom = -20;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const skyFill = new THREE.HemisphereLight(0x73c2fb, 0x2e4a3d, 0.8);
    scene.add(skyFill);

    // Island Master Group
    const islandGroup = new THREE.Group();
    scene.add(islandGroup);

    // ==========================================
    // 2. FLOATING ISLAND GEOMETRY (Low-poly nature sculpted)
    // ==========================================

    // Upper Lush Grass Top Plate
    const topRadius = 13.5;
    const topGeo = new THREE.CylinderGeometry(topRadius, topRadius * 0.95, 2.4, 32, 4);
    // Deform vertices for natural terrain rolling slopes
    const topPos = topGeo.attributes.position;
    for (let i = 0; i < topPos.count; i++) {
      const y = topPos.getY(i);
      if (y > 0.5) {
        const x = topPos.getX(i);
        const z = topPos.getZ(i);
        const dist = Math.sqrt(x * x + z * z);
        // Gentle undulating knolls
        const bump = Math.sin(x * 0.35) * Math.cos(z * 0.35) * 0.8;
        topPos.setY(i, y + bump + (dist > 10 ? -0.4 : 0));
      }
    }
    topGeo.computeVertexNormals();

    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x4f8a55,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true
    });
    const grassTop = new THREE.Mesh(topGeo, grassMat);
    grassTop.position.y = 0;
    grassTop.receiveShadow = true;
    grassTop.castShadow = true;
    islandGroup.add(grassTop);

    // Bottom Inverted Rock Cone (Cliff underbelly with crags)
    const cliffGeo = new THREE.ConeGeometry(topRadius * 0.96, 15, 20, 6, false);
    cliffGeo.rotateX(Math.PI);
    const cliffPos = cliffGeo.attributes.position;
    for (let i = 0; i < cliffPos.count; i++) {
      const x = cliffPos.getX(i);
      const y = cliffPos.getY(i);
      const z = cliffPos.getZ(i);
      // Add jagged rocky noise
      const noise = (Math.sin(x * 0.8) + Math.cos(z * 0.8) + Math.sin(y * 0.5)) * 0.6;
      cliffPos.setX(i, x + noise * (1 - y / -15));
      cliffPos.setZ(i, z + noise * (1 - y / -15));
    }
    cliffGeo.computeVertexNormals();

    const cliffMat = new THREE.MeshStandardMaterial({
      color: 0x433d37,
      roughness: 0.95,
      metalness: 0.1,
      flatShading: true
    });
    const cliff = new THREE.Mesh(cliffGeo, cliffMat);
    cliff.position.y = -8;
    cliff.receiveShadow = true;
    cliff.castShadow = true;
    islandGroup.add(cliff);

    // Secondary Smaller Satellite Floating Islets
    const makeSmallIslet = (x: number, y: number, z: number, scale: number) => {
      const isletGroup = new THREE.Group();
      isletGroup.position.set(x, y, z);
      isletGroup.scale.set(scale, scale, scale);

      const sTop = new THREE.Mesh(
        new THREE.CylinderGeometry(3, 2.5, 1.2, 12),
        grassMat
      );
      sTop.receiveShadow = true;
      isletGroup.add(sTop);

      const sBottom = new THREE.Mesh(
        new THREE.ConeGeometry(2.5, 5, 10),
        cliffMat
      );
      sBottom.rotateX(Math.PI);
      sBottom.position.y = -2.8;
      isletGroup.add(sBottom);

      // Cute mini bush on satellite
      const sBush = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.1, 1),
        new THREE.MeshStandardMaterial({ color: 0x5da864, flatShading: true, roughness: 0.9 })
      );
      sBush.position.set(0.5, 1.2, 0.2);
      isletGroup.add(sBush);

      islandGroup.add(isletGroup);
      return isletGroup;
    };

    const satellite1 = makeSmallIslet(18, -2, -6, 0.7);
    const satellite2 = makeSmallIslet(-17, -4, 8, 0.55);
    const satellite3 = makeSmallIslet(-15, 2, -14, 0.45);

    // ==========================================
    // 3. THE ANCIENT ARCHITECTURE TREE (Java/Spring Pillar)
    // ==========================================
    const treeGroup = new THREE.Group();
    treeGroup.position.set(-3.5, 1.1, -2);
    islandGroup.add(treeGroup);

    // Thick twisted trunk
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x513824, roughness: 0.9, flatShading: true });
    const trunkGeo = new THREE.CylinderGeometry(0.8, 1.6, 6, 8);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 3;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Massive flowering/leaf canopy layers
    const foliageMat = new THREE.MeshStandardMaterial({
      color: 0x64b56c,
      roughness: 0.8,
      flatShading: true
    });
    const pinkFoliageMat = new THREE.MeshStandardMaterial({
      color: 0xf4a6c0, // Sakura pink blossoms
      roughness: 0.8,
      flatShading: true
    });

    const createFoliageLayer = (y: number, r: number, mat: THREE.Material, rot = 0) => {
      const fol = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), mat);
      fol.position.y = y;
      fol.rotation.y = rot;
      fol.castShadow = true;
      fol.receiveShadow = true;
      treeGroup.add(fol);
      return fol;
    };

    createFoliageLayer(5.5, 3.4, foliageMat, 0.2);
    createFoliageLayer(7.8, 2.7, foliageMat, 0.8);
    createFoliageLayer(9.6, 2.0, pinkFoliageMat, 1.4);
    createFoliageLayer(6.8, 2.2, pinkFoliageMat, -0.6);

    // Decorative Forest Trees & Low-Poly Pines
    const pineMat = new THREE.MeshStandardMaterial({ color: 0x2e6b4d, roughness: 0.9, flatShading: true });
    const createPineTree = (x: number, z: number, scale = 1) => {
      const pine = new THREE.Group();
      pine.position.set(x, 1, z);
      pine.scale.set(scale, scale, scale);

      const pTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 1.8, 6), trunkMat);
      pTrunk.position.y = 0.9;
      pTrunk.castShadow = true;
      pine.add(pTrunk);

      const c1 = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.2, 6), pineMat);
      c1.position.y = 2.2;
      c1.castShadow = true;
      pine.add(c1);

      const c2 = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.8, 6), pineMat);
      c2.position.y = 3.2;
      c2.castShadow = true;
      pine.add(c2);

      const c3 = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.4, 6), pineMat);
      c3.position.y = 4.0;
      c3.castShadow = true;
      pine.add(c3);

      islandGroup.add(pine);
    };

    createPineTree(-7, -4, 1.1);
    createPineTree(-8.5, 0, 0.9);
    createPineTree(-6, -7, 0.85);
    createPineTree(1, -7.5, 1.2);
    createPineTree(4, -6.5, 0.95);
    createPineTree(7.5, -4, 0.8);

    // ==========================================
    // 4. ANIMATED CASCADE WATERFALL & MIST STREAM
    // ==========================================
    const waterfallGroup = new THREE.Group();
    waterfallGroup.position.set(8.5, 0.8, -1.5);
    islandGroup.add(waterfallGroup);

    // Stream source pond
    const pondGeo = new THREE.CylinderGeometry(2.5, 2.2, 0.4, 16);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      emissive: 0x0369a1,
      roughness: 0.1,
      transmission: 0.6,
      transparent: true,
      opacity: 0.85,
      flatShading: false
    });
    const pond = new THREE.Mesh(pondGeo, waterMat);
    pond.position.set(-1.2, 0.1, 0);
    waterfallGroup.add(pond);

    // Falling water ribbons
    const fallGeo = new THREE.PlaneGeometry(1.8, 16, 8, 20);
    fallGeo.rotateY(Math.PI / 2);
    const fallMat = new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      emissive: 0x0284c7,
      transparent: true,
      opacity: 0.8,
      roughness: 0.2,
      side: THREE.DoubleSide
    });
    const fallMesh = new THREE.Mesh(fallGeo, fallMat);
    fallMesh.position.set(0.6, -7.5, 0);
    waterfallGroup.add(fallMesh);

    // Waterfall Splash Particle Mist System
    const mistCount = 200;
    const mistGeo = new THREE.BufferGeometry();
    const mistPositions = new Float32Array(mistCount * 3);
    const mistVelocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < mistCount; i++) {
      const i3 = i * 3;
      mistPositions[i3] = 9.2 + (Math.random() - 0.5) * 2;
      mistPositions[i3 + 1] = -14 + Math.random() * 4;
      mistPositions[i3 + 2] = -1.5 + (Math.random() - 0.5) * 2;

      mistVelocities.push({
        x: (Math.random() - 0.5) * 0.05,
        y: -0.05 - Math.random() * 0.1,
        z: (Math.random() - 0.5) * 0.05
      });
    }
    mistGeo.setAttribute('position', new THREE.BufferAttribute(mistPositions, 3));
    const mistMat = new THREE.PointsMaterial({
      color: 0xe0f2fe,
      size: 0.45,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const mistParticles = new THREE.Points(mistGeo, mistMat);
    scene.add(mistParticles);

    // ==========================================
    // 5. STONE CIRCLE OF KNOWLEDGE (Monoliths)
    // ==========================================
    const stoneGroup = new THREE.Group();
    stoneGroup.position.set(3, 1, 3.5);
    islandGroup.add(stoneGroup);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.9, flatShading: true });
    const runicMat = new THREE.MeshStandardMaterial({
      color: 0xa78bfa,
      emissive: 0x6d28d9,
      roughness: 0.3,
      metalness: 0.6
    });

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const r = 2.4;
      const monolith = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 2.2 + (i % 2) * 0.6, 0.4),
        i % 2 === 0 ? runicMat : stoneMat
      );
      monolith.position.set(Math.cos(angle) * r, 1.2, Math.sin(angle) * r);
      monolith.rotation.y = -angle;
      monolith.castShadow = true;
      stoneGroup.add(monolith);
    }
    // Center altar stone
    const altar = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.6, 8), stoneMat);
    altar.position.y = 0.3;
    stoneGroup.add(altar);

    // ==========================================
    // 6. CAMPFIRE OF INNOVATION (Warm Ember Glow)
    // ==========================================
    const campGroup = new THREE.Group();
    campGroup.position.set(-5, 1, 3);
    islandGroup.add(campGroup);

    // Fire pit stones
    const pitRing = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.15, 8, 12), stoneMat);
    pitRing.rotation.x = Math.PI / 2;
    campGroup.add(pitRing);

    // Wooden logs
    for (let i = 0; i < 4; i++) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 6), trunkMat);
      log.rotation.z = Math.PI / 4;
      log.rotation.y = (i * Math.PI) / 2;
      log.position.y = 0.15;
      campGroup.add(log);
    }

    // Fire point light
    const fireLight = new THREE.PointLight(0xff7733, 2.5, 12);
    fireLight.position.set(0, 0.8, 0);
    campGroup.add(fireLight);

    // Low-poly flame crystal
    const flameGeo = new THREE.OctahedronGeometry(0.35, 0);
    const flameMat = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      emissive: 0xff4400,
      roughness: 0.1
    });
    const flameMesh = new THREE.Mesh(flameGeo, flameMat);
    flameMesh.position.y = 0.45;
    campGroup.add(flameMesh);

    // ==========================================
    // 7. SHINE OF MILESTONES (Gazebo)
    // ==========================================
    const shrineGroup = new THREE.Group();
    shrineGroup.position.set(0, 1.2, -5.5);
    islandGroup.add(shrineGroup);

    // Marble/wood platform
    const platform = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, 0.5, 8), stoneMat);
    shrineGroup.add(platform);

    // 4 Pillars
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 2.8, 8), trunkMat);
      pillar.position.set(Math.cos(angle) * 1.5, 1.4, Math.sin(angle) * 1.5);
      shrineGroup.add(pillar);
    }

    // Pagoda/Shrine Roof
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(2.5, 1.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.8, flatShading: true })
    );
    roof.position.y = 3.2;
    shrineGroup.add(roof);

    // Glowing relic crystal inside shrine
    const relic = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.4, 0),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xd97706, roughness: 0.2 })
    );
    relic.position.y = 1.3;
    shrineGroup.add(relic);

    // ==========================================
    // 8. BUTTERFLIES & FLOATING FIREFLIES
    // ==========================================
    const butterflies: { mesh: THREE.Group; wingL: THREE.Mesh; wingR: THREE.Mesh; angle: number; r: number; speed: number; yBase: number }[] = [];

    const butterflyColors = [0x56e2c6, 0xf472b6, 0xfacc15, 0xa78bfa];
    for (let i = 0; i < 6; i++) {
      const bGroup = new THREE.Group();
      const col = butterflyColors[i % butterflyColors.length];
      const wingMat = new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide });

      const wingL = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.3), wingMat);
      wingL.position.x = -0.12;
      wingL.rotation.y = 0.3;
      bGroup.add(wingL);

      const wingR = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.3), wingMat);
      wingR.position.x = 0.12;
      wingR.rotation.y = -0.3;
      bGroup.add(wingR);

      scene.add(bGroup);
      butterflies.push({
        mesh: bGroup,
        wingL,
        wingR,
        angle: (i * Math.PI) / 3,
        r: 4 + Math.random() * 6,
        speed: 0.8 + Math.random() * 0.5,
        yBase: 2 + Math.random() * 3
      });
    }

    // Fireflies / Spores particle system (150 soft glowing specks)
    const fireflyCount = 180;
    const fireflyGeo = new THREE.BufferGeometry();
    const fireflyPos = new Float32Array(fireflyCount * 3);

    for (let i = 0; i < fireflyCount; i++) {
      const i3 = i * 3;
      fireflyPos[i3] = (Math.random() - 0.5) * 26;
      fireflyPos[i3 + 1] = Math.random() * 10;
      fireflyPos[i3 + 2] = (Math.random() - 0.5) * 26;
    }
    fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPos, 3));

    const fireflyMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.35,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const fireflies = new THREE.Points(fireflyGeo, fireflyMat);
    scene.add(fireflies);

    // ==========================================
    // 9. SURROUNDING NATURE CLOUDS
    // ==========================================
    const cloudGroup = new THREE.Group();
    scene.add(cloudGroup);

    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.95,
      transparent: true,
      opacity: 0.8,
      flatShading: true
    });

    const createCloudCluster = (x: number, y: number, z: number, scale = 1) => {
      const cluster = new THREE.Group();
      cluster.position.set(x, y, z);
      cluster.scale.set(scale, scale, scale);

      for (let i = 0; i < 5; i++) {
        const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(2 + Math.random() * 1.5, 1), cloudMat);
        puff.position.set((i - 2) * 1.8, (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 1.5);
        cluster.add(puff);
      }
      cloudGroup.add(cluster);
      return cluster;
    };

    createCloudCluster(-28, -6, -20, 1.4);
    createCloudCluster(26, -8, -15, 1.2);
    createCloudCluster(18, -10, 20, 1.5);
    createCloudCluster(-22, -12, 16, 1.3);

    // ==========================================
    // 10. INTERACTIVE MOUSE PARALLAX & CONTROLS
    // ==========================================
    let mouseX = 0;
    let mouseY = 0;
    let targetParallaxX = 0;
    let targetParallaxY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      targetParallaxX = x * 2.5;
      targetParallaxY = y * 1.8;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth camera interpolation towards active landmark target
      camera.position.lerp(
        new THREE.Vector3(
          targetCameraPos.current.x + mouseX,
          targetCameraPos.current.y + mouseY,
          targetCameraPos.current.z
        ),
        0.04
      );

      // Smooth lookAt interpolation
      currentLookAt.current.lerp(targetLookAt.current, 0.05);
      camera.lookAt(currentLookAt.current);

      // Parallax easing
      mouseX += (targetParallaxX - mouseX) * 0.05;
      mouseY += (targetParallaxY - mouseY) * 0.05;

      // Gentle floating island bobbing motion
      if (isRotating) {
        islandGroup.position.y = Math.sin(elapsed * 0.8) * 0.35;
        islandGroup.rotation.y += 0.08 * delta;

        // Satellite islands gentle orbit
        satellite1.position.y = -2 + Math.sin(elapsed * 1.1 + 1) * 0.4;
        satellite2.position.y = -4 + Math.sin(elapsed * 0.9 + 2) * 0.5;
        satellite3.position.y = 2 + Math.sin(elapsed * 1.3 + 3) * 0.3;
      }

      // Animated Waterfall surface ripple
      const fPos = fallGeo.attributes.position;
      for (let i = 0; i < fPos.count; i++) {
        const y = fPos.getY(i);
        const wave = Math.sin(y * 2 - elapsed * 8) * 0.08;
        fPos.setZ(i, wave);
      }
      fallGeo.computeVertexNormals();
      fallGeo.attributes.position.needsUpdate = true;

      // Waterfall mist particle update
      const mPos = mistGeo.attributes.position;
      for (let i = 0; i < mistCount; i++) {
        const i3 = i * 3;
        mPos.setY(i3 + 1, mPos.getY(i3 + 1) + mistVelocities[i].y);
        mPos.setX(i3, mPos.getX(i3) + mistVelocities[i].x);

        // Reset particles that fall too low
        if (mPos.getY(i3 + 1) < -18) {
          mPos.setY(i3 + 1, -12);
          mPos.setX(i3, 9.2 + (Math.random() - 0.5) * 2);
          mPos.setZ(i3 + 2, -1.5 + (Math.random() - 0.5) * 2);
        }
      }
      mPos.needsUpdate = true;

      // Fluttering butterflies
      butterflies.forEach((b) => {
        b.angle += b.speed * delta;
        b.mesh.position.x = Math.cos(b.angle) * b.r;
        b.mesh.position.z = Math.sin(b.angle) * b.r;
        b.mesh.position.y = b.yBase + Math.sin(elapsed * 3 + b.angle) * 0.6;
        b.mesh.rotation.y = -b.angle + Math.PI / 2;

        const wingFlap = Math.sin(elapsed * 18);
        b.wingL.rotation.y = 0.4 + wingFlap * 0.6;
        b.wingR.rotation.y = -0.4 - wingFlap * 0.6;
      });

      // Fireflies floating drift
      const ffPos = fireflyGeo.attributes.position;
      for (let i = 0; i < fireflyCount; i++) {
        const i3 = i * 3;
        const currentY = ffPos.getY(i3 + 1);
        ffPos.setY(i3 + 1, currentY + Math.sin(elapsed * 2 + i) * 0.015);
      }
      ffPos.needsUpdate = true;

      // Flickering campfire
      fireLight.intensity = 2.2 + Math.sin(elapsed * 12) * 0.4 + Math.cos(elapsed * 8) * 0.3;
      flameMesh.rotation.y += 2 * delta;
      flameMesh.scale.set(1 + Math.sin(elapsed * 10) * 0.15, 1 + Math.cos(elapsed * 9) * 0.2, 1);

      // Rotating shrine relic
      relic.rotation.y += 1.2 * delta;
      relic.position.y = 1.3 + Math.sin(elapsed * 2) * 0.12;

      // Slowly drifting surrounding clouds
      cloudGroup.rotation.y = elapsed * 0.015;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      renderer.dispose();
      topGeo.dispose();
      cliffGeo.dispose();
      grassMat.dispose();
      cliffMat.dispose();
      mistGeo.dispose();
      mistMat.dispose();
      fireflyGeo.dispose();
      fireflyMat.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isRotating]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none" />

      {/* Fallback Container if WebGL is unavailable */}
      {!webglSupported && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e1d16] via-[#142820] to-[#0b120f] flex items-center justify-center p-6 text-center z-0">
          <div className="max-w-md p-6 rounded-2xl border border-emerald-500/30 bg-[#12221b]/90 backdrop-blur-md">
            <span className="text-3xl mb-2 block">🌿</span>
            <h3 className="font-serif text-lg text-emerald-200">Nature Sanctuary (2D Mode)</h3>
            <p className="text-xs text-emerald-100/70 mt-2">
              Hardware graphics acceleration paused. Calm woodland atmosphere active.
            </p>
          </div>
        </div>
      )}

      {/* Interactive Cinematic Landmark Navigator (Jordan Breton Inspired Navigation Bar) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-4xl px-3 py-2 rounded-2xl bg-[#0e1914]/85 border border-emerald-500/30 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pointer-events-auto">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {NATURE_LANDMARKS.map((lm) => {
            const isActive = activeLandmark === lm.id;
            return (
              <button
                key={lm.id}
                onClick={() => {
                  natureAudio.playBell(528, 0.8);
                  onSelectLandmark(lm.id);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-serif transition-all duration-300 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/15 text-emerald-200 border border-emerald-400/60 shadow-md shadow-emerald-900/30 font-semibold'
                    : 'text-emerald-100/65 hover:text-emerald-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: lm.color }}
                />
                <span>{lm.name}</span>
              </button>
            );
          })}
        </div>

        {/* Orbit Pause & Sound Controls */}
        <div className="flex items-center gap-2 pl-3 border-l border-emerald-500/20 shrink-0">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 transition-colors"
            title={isRotating ? 'Pause Island Float' : 'Resume Island Float'}
          >
            {isRotating ? 'Float: ON' : 'Float: PAUSE'}
          </button>
        </div>
      </div>
    </div>
  );
};
