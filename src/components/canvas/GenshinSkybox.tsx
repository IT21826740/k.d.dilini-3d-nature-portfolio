import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface GenshinSkyboxProps {
  activeElement?: string;
  className?: string;
}

export const GenshinSkybox: React.FC<GenshinSkyboxProps> = ({
  activeElement = 'all',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [isRotating, setIsRotating] = useState(true);
  const [viewMode, setViewMode] = useState<'celestial' | 'resonance' | 'constellation'>('celestial');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setWebglSupported(false);
      return;
    }

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x090c15, 0.0018);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 32);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 1. Ambient & Directional Three-Point Lighting
    const ambientLight = new THREE.AmbientLight(0xfff4d6, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xf5d372, 2.5);
    keyLight.position.set(20, 30, 25);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x56e2c6, 3, 60);
    fillLight.position.set(-25, -15, 10);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xba7ff7, 3, 50);
    rimLight.position.set(0, 20, -15);
    scene.add(rimLight);

    // 2. Central Celestial Vision / Primogem Polyhedron
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Outer crystalline octahedron / icosahedron
    const gemGeo = new THREE.OctahedronGeometry(4.2, 0);
    const gemMat = new THREE.MeshPhysicalMaterial({
      color: 0xf6d57a,
      emissive: 0x422900,
      roughness: 0.1,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: false,
      transparent: true,
      opacity: 0.88,
    });
    const gemMesh = new THREE.Mesh(gemGeo, gemMat);
    coreGroup.add(gemMesh);

    // Inner wireframe lattice
    const innerGeo = new THREE.IcosahedronGeometry(2.8, 1);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x56e2c6,
      emissive: 0x124840,
      wireframe: true,
      roughness: 0.3,
      metalness: 0.9,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerMesh);

    // Golden Halo Ring 1
    const ring1Geo = new THREE.TorusGeometry(6.4, 0.08, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xe6b85c,
      emissive: 0x553d0d,
      roughness: 0.2,
      metalness: 0.95,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ringMat);
    ring1.rotation.x = Math.PI / 3;
    coreGroup.add(ring1);

    // Golden Halo Ring 2
    const ring2Geo = new THREE.TorusGeometry(7.6, 0.05, 16, 100);
    const ring2 = new THREE.Mesh(ring2Geo, ringMat);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.z = Math.PI / 6;
    coreGroup.add(ring2);

    // 3. Orbiting Elemental Orbs (representing Genshin elements)
    const elementalOrbs: { mesh: THREE.Mesh; angle: number; speed: number; radius: number; element: string }[] = [];
    const elementsData = [
      { name: 'geo', color: 0xe6b85c, radius: 9.5, speed: 0.6 },
      { name: 'anemo', color: 0x56e2c6, radius: 11.0, speed: -0.5 },
      { name: 'electro', color: 0xba7ff7, radius: 12.5, speed: 0.7 },
      { name: 'dendro', color: 0x7bdc4e, radius: 10.0, speed: -0.65 },
      { name: 'hydro', color: 0x46b1f8, radius: 13.5, speed: 0.45 },
      { name: 'pyro', color: 0xf36b48, radius: 11.8, speed: -0.55 },
    ];

    elementsData.forEach((el, idx) => {
      const orbGeo = new THREE.SphereGeometry(0.55, 24, 24);
      const orbMat = new THREE.MeshStandardMaterial({
        color: el.color,
        emissive: el.color,
        emissiveIntensity: 0.8,
        roughness: 0.2,
        metalness: 0.8,
      });
      const orbMesh = new THREE.Mesh(orbGeo, orbMat);
      
      // Light glow child
      const pLight = new THREE.PointLight(el.color, 1.2, 10);
      orbMesh.add(pLight);

      coreGroup.add(orbMesh);
      elementalOrbs.push({
        mesh: orbMesh,
        angle: (idx * Math.PI) / 3,
        speed: el.speed,
        radius: el.radius,
        element: el.name,
      });
    });

    // 4. Background Starfield (1,200 particle stars)
    const starCount = 1400;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color(0xf6d57a), // Gold
      new THREE.Color(0x56e2c6), // Anemo Cyan
      new THREE.Color(0xba7ff7), // Electro Violet
      new THREE.Color(0x9be8fb), // Cryo Light
      new THREE.Color(0xffffff), // Pure Celestial White
      new THREE.Color(0xecdab9), // Warm Starlight
    ];

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      // Spherical distribution around user
      const r = 40 + Math.random() * 120;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[i3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i3 + 2] = r * Math.cos(phi);

      const color = palette[Math.floor(Math.random() * palette.length)];
      starColors[i3] = color.r;
      starColors[i3 + 1] = color.g;
      starColors[i3 + 2] = color.b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    // Custom circle star texture for crisp rounded stars
    const makeStarTexture = () => {
      const cvs = document.createElement('canvas');
      cvs.width = 64;
      cvs.height = 64;
      const ctx = cvs.getContext('2d');
      if (ctx) {
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.3, 'rgba(240, 220, 160, 0.8)');
        grad.addColorStop(0.7, 'rgba(210, 180, 100, 0.2)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(32, 32, 30, 0, Math.PI * 2);
        ctx.fill();
      }
      return new THREE.CanvasTexture(cvs);
    };

    const starMaterial = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      map: makeStarTexture(),
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 5. Constellation Lines Generator
    const constellationGeo = new THREE.BufferGeometry();
    const linePositions: number[] = [];
    // Connect select star nodes to create a celestial constellation network
    const constellationNodes = 40;
    for (let i = 0; i < constellationNodes; i++) {
      const idxA = Math.floor(Math.random() * (starCount / 4));
      const idxB = (idxA + Math.floor(Math.random() * 8) + 1) % (starCount / 4);

      linePositions.push(
        starPositions[idxA * 3],
        starPositions[idxA * 3 + 1],
        starPositions[idxA * 3 + 2],
        starPositions[idxB * 3],
        starPositions[idxB * 3 + 1],
        starPositions[idxB * 3 + 2]
      );
    }
    constellationGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const constellationMat = new THREE.LineBasicMaterial({
      color: 0xe6b85c,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const constellationLines = new THREE.LineSegments(constellationGeo, constellationMat);
    scene.add(constellationLines);

    // Mouse Interaction Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 8;
      targetY = y * 6;
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

    // Context Lost / Restored Protection
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglSupported(false);
    };
    const handleContextRestored = () => {
      setWebglSupported(true);
    };
    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth camera parallax
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;
      camera.position.x = mouseX;
      camera.position.y = mouseY;
      camera.lookAt(0, 0, 0);

      // Core rotation
      if (isRotating) {
        coreGroup.rotation.y += 0.35 * delta;
        gemMesh.rotation.x = Math.sin(elapsed * 0.8) * 0.3;
        gemMesh.rotation.z = Math.cos(elapsed * 0.7) * 0.2;
        innerMesh.rotation.y -= 0.6 * delta;
        innerMesh.rotation.x += 0.4 * delta;

        ring1.rotation.z += 0.25 * delta;
        ring2.rotation.x += 0.18 * delta;

        // Subtle pulsing scale
        const pulse = 1 + Math.sin(elapsed * 1.5) * 0.04;
        gemMesh.scale.set(pulse, pulse, pulse);
      }

      // Update orbiting elemental orbs
      elementalOrbs.forEach((orb) => {
        orb.angle += orb.speed * delta;
        orb.mesh.position.x = Math.cos(orb.angle) * orb.radius;
        orb.mesh.position.z = Math.sin(orb.angle) * orb.radius;
        orb.mesh.position.y = Math.sin(elapsed * 2 + orb.angle) * 2.5;

        // Highlight matching element if filtered
        if (activeElement !== 'all' && orb.element === activeElement) {
          orb.mesh.scale.set(1.6, 1.6, 1.6);
        } else {
          orb.mesh.scale.set(1.0, 1.0, 1.0);
        }
      });

      // Slowly drift starfield
      starField.rotation.y = elapsed * 0.02;
      constellationLines.rotation.y = elapsed * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      cancelAnimationFrame(animationFrameId);

      // Dispose three.js resources
      renderer.dispose();
      gemGeo.dispose();
      gemMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ring1Geo.dispose();
      ring2Geo.dispose();
      ringMat.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      constellationGeo.dispose();
      constellationMat.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isRotating, activeElement]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none" />

      {/* Fallback Container if WebGL fails */}
      {!webglSupported && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#090c15] via-[#141b2a] to-[#0b0e17] flex items-center justify-center p-6 text-center z-0">
          <div className="max-w-md p-6 rounded-2xl border border-amber-500/30 bg-[#121826]/90 backdrop-blur-md">
            <span className="text-3xl mb-2 block">✦</span>
            <h3 className="font-serif text-lg text-amber-200">Celestial Celestial Spire (2D Mode)</h3>
            <p className="text-xs text-amber-100/70 mt-2">
              Hardware graphics acceleration paused. Seamless 2D celestial atmosphere active.
            </p>
          </div>
        </div>
      )}

      {/* Floating HUD Controls for 3D Viewport (Complies with 3D Spatial Guidelines) */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0d121e]/80 border border-amber-500/30 backdrop-blur-md text-xs text-amber-200/90 shadow-lg pointer-events-auto">
        <span className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Teyvat 3D Canvas
        </span>
        <span className="text-amber-500/40">|</span>
        <button
          onClick={() => setIsRotating(!isRotating)}
          className="hover:text-amber-300 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 rounded px-1"
          title={isRotating ? 'Pause Rotation' : 'Resume Rotation'}
        >
          {isRotating ? 'Pause' : 'Spin'}
        </button>
      </div>
    </div>
  );
};
