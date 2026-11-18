import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  WalkableIslandCanvas,
  TeleportCommand,
  CameraActionCommand,
} from './components/canvas/WalkableIslandCanvas';
import { WorldHUD } from './components/world/WorldHUD';
import { WorldDiscoveryModal } from './components/world/WorldDiscoveryModal';
import { ProjectModal } from './components/ProjectModal';
import { DownloadZipModal } from './components/DownloadZipModal';
import { TouchControls, JoystickVector } from './components/world/TouchControls';
import { CuteLoadingScreen } from './components/world/CuteLoadingScreen';
import {
  CuteErrorScreen,
  SanctuaryErrorBoundary,
  SanctuaryErrorKind,
} from './components/world/CuteErrorScreen';
import { TouchGuideModal } from './components/world/TouchGuideModal';
import { DayNightOverlay } from './components/world/DayNightOverlay';
import { WorldInteractable } from './data/worldData';
import { Project } from './data/portfolioData';
import { walkAudio } from './utils/walkAudio';
import {
  CycleMode,
  PRESET_HOURS,
  getLocalHourDecimal,
  sampleAtmosphere,
} from './utils/dayNightCycle';

function detectTouchCapable(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(pointer: coarse)').matches ||
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0
  );
}

export default function App() {
  const [nearbyPoi, setNearbyPoi] = useState<WorldInteractable | null>(null);
  const [activeInspectPoi, setActiveInspectPoi] = useState<WorldInteractable | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDownloadZipOpen, setIsDownloadZipOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(walkAudio.isMuted);

  // Touch joystick visibility (auto-enabled on touch devices, toggleable on desktop)
  const [showTouchControls, setShowTouchControls] = useState<boolean>(detectTouchCapable);

  // Cute Loading & Error Screen states
  const [loadProgress, setLoadProgress] = useState(5);
  const [loadStatus, setLoadStatus] = useState('Waking the fireflies...');
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [showLoaderOverlay, setShowLoaderOverlay] = useState(true);
  const [sceneError, setSceneError] = useState<{
    kind: SanctuaryErrorKind;
    detail?: string;
  } | null>(null);
  const [sceneMountKey, setSceneMountKey] = useState(0);

  // Day/Night Cycle synced to user's local time by default
  const [cycleMode, setCycleMode] = useState<CycleMode>('auto');
  const [localHour, setLocalHour] = useState<number>(() => getLocalHourDecimal());
  const [customHour, setCustomHour] = useState<number>(() => getLocalHourDecimal());
  const [isSkyPanelOpen, setIsSkyPanelOpen] = useState(false);

  const effectiveHour =
    cycleMode === 'auto'
      ? localHour
      : cycleMode === 'custom'
      ? customHour
      : PRESET_HOURS[cycleMode];
  const atmosphere = sampleAtmosphere(effectiveHour);

  // Commands & Refs shared with Three.js scene
  const [teleportCommand, setTeleportCommand] = useState<TeleportCommand | null>(null);
  const [cameraAction, setCameraAction] = useState<CameraActionCommand | null>(null);
  const joystickRef = useRef<JoystickVector>({ x: 0, y: 0 });
  const atmosphereRef = useRef(atmosphere);
  atmosphereRef.current = atmosphere;
  const commandNonceRef = useRef(0);

  // Refresh local clock every 15s when synced to local time
  useEffect(() => {
    if (cycleMode !== 'auto') return;
    setLocalHour(getLocalHourDecimal());
    const timer = window.setInterval(() => {
      setLocalHour(getLocalHourDecimal());
    }, 15000);
    return () => window.clearInterval(timer);
  }, [cycleMode]);

  // Keep touch-device detection updated if user resizes or detaches tablet keyboard
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) setShowTouchControls(true);
    };
    mq.addEventListener('change', handleMediaChange);
    return () => mq.removeEventListener('change', handleMediaChange);
  }, []);

  // Start calm ambient wind on first pointer/keyboard interaction
  useEffect(() => {
    const handleFirstUserInteraction = () => {
      walkAudio.startAmbience();
      window.removeEventListener('pointerdown', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
    };
    window.addEventListener('pointerdown', handleFirstUserInteraction);
    window.addEventListener('keydown', handleFirstUserInteraction);
    return () => {
      window.removeEventListener('pointerdown', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
    };
  }, []);

  // Fade out cute loading screen smoothly after scene compiles
  useEffect(() => {
    if (!isSceneReady) return;
    const timer = window.setTimeout(() => {
      setShowLoaderOverlay(false);
    }, 480);
    return () => window.clearTimeout(timer);
  }, [isSceneReady]);

  const handleToggleMute = () => {
    walkAudio.isMuted = !walkAudio.isMuted;
    setIsMuted(walkAudio.isMuted);
    if (!walkAudio.isMuted) {
      walkAudio.startAmbience();
      walkAudio.playDiscoveryChime(659.25);
    } else {
      walkAudio.stopAmbience();
    }
  };

  const handleFastTravel = useCallback((poiId: string) => {
    commandNonceRef.current += 1;
    setTeleportCommand({ poiId, nonce: commandNonceRef.current });
  }, []);

  const handleAdjustZoom = useCallback((delta: number) => {
    commandNonceRef.current += 1;
    setCameraAction({ type: 'zoom', delta, nonce: commandNonceRef.current });
  }, []);

  const handleResetCamera = useCallback(() => {
    commandNonceRef.current += 1;
    setCameraAction({ type: 'reset', nonce: commandNonceRef.current });
  }, []);

  const handleLoadProgress = useCallback((progress: number, statusText: string) => {
    setLoadProgress(progress);
    setLoadStatus(statusText);
  }, []);

  const handleSceneReady = useCallback(() => {
    setIsSceneReady(true);
  }, []);

  const handleSceneError = useCallback((kind: SanctuaryErrorKind, detail?: string) => {
    setSceneError({ kind, detail });
    setShowLoaderOverlay(false);
  }, []);

  const handleRetrySanctuary = useCallback(() => {
    setSceneError(null);
    setIsSceneReady(false);
    setShowLoaderOverlay(true);
    setLoadProgress(8);
    setLoadStatus('Rebuilding the floating sanctuary...');
    setSceneMountKey((k) => k + 1);
  }, []);

  const isAnyModalOpen = Boolean(
    activeInspectPoi || selectedProject || isDownloadZipOpen || isGuideOpen
  );

  return (
    <SanctuaryErrorBoundary onOpen2DExplorer={() => setIsGuideOpen(true)}>
      <div className="relative w-full h-[100dvh] overflow-hidden bg-[#09120e] text-[#f4efe6] select-none">
        {/* 3D Walkable Three.js Nature World */}
        <div className="absolute inset-0 z-0">
          <WalkableIslandCanvas
            key={sceneMountKey}
            onNearbyInteractable={setNearbyPoi}
            onOpenInteractable={(poi) => setActiveInspectPoi(poi)}
            isAnyModalOpen={isAnyModalOpen}
            teleportCommand={teleportCommand}
            cameraAction={cameraAction}
            joystickRef={joystickRef}
            atmosphereRef={atmosphereRef}
            onLoadProgress={handleLoadProgress}
            onSceneReady={handleSceneReady}
            onSceneError={handleSceneError}
          />
        </div>

        {/* Dynamic Day/Night Atmosphere Tint & Time Scrubber Overlay */}
        <DayNightOverlay
          atmosphere={atmosphere}
          mode={cycleMode}
          isPanelOpen={isSkyPanelOpen && !isAnyModalOpen && !sceneError && isSceneReady}
          onClosePanel={() => setIsSkyPanelOpen(false)}
          onSelectMode={(nextMode) => {
            setCycleMode(nextMode);
            if (nextMode === 'auto') {
              setLocalHour(getLocalHourDecimal());
            } else if (nextMode !== 'custom') {
              setCustomHour(PRESET_HOURS[nextMode]);
            }
          }}
          onScrubHour={(hour) => {
            setCycleMode('custom');
            setCustomHour(hour);
          }}
        />

        {/* Subtle Atmospheric Vignette */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-radial from-transparent via-transparent to-[#09120e]/45 pointer-events-none z-10"
        />

        {/* Responsive Heads-Up Display */}
        <WorldHUD
          nearbyPoi={nearbyPoi}
          onOpenPoi={(poi) => setActiveInspectPoi(poi)}
          onFastTravel={handleFastTravel}
          onOpenDownloadZip={() => setIsDownloadZipOpen(true)}
          onOpenGuide={() => setIsGuideOpen(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          showTouchControls={showTouchControls}
          onToggleTouchControls={() => setShowTouchControls((v) => !v)}
          atmosphere={atmosphere}
          isSkyPanelOpen={isSkyPanelOpen}
          onToggleSkyPanel={() => setIsSkyPanelOpen((v) => !v)}
        />

        {/* Mobile / Touch Virtual Analog Joystick & Camera Zoom Controls */}
        <TouchControls
          visible={showTouchControls && !isAnyModalOpen && !sceneError && isSceneReady}
          joystickRef={joystickRef}
          nearbyPoi={nearbyPoi}
          onInspectNearby={(poi) => {
            walkAudio.playDiscoveryChime(783.99);
            setActiveInspectPoi(poi);
          }}
          onAdjustZoom={handleAdjustZoom}
          onResetCamera={handleResetCamera}
        />

        {/* Cute Loading Screen */}
        {showLoaderOverlay && !sceneError && (
          <CuteLoadingScreen
            progress={loadProgress}
            statusText={loadStatus}
            isVisible={!isSceneReady}
          />
        )}

        {/* Cute Error / WebGL Recovery Screen */}
        {sceneError && (
          <CuteErrorScreen
            kind={sceneError.kind}
            message={sceneError.detail}
            onRetry={handleRetrySanctuary}
            onOpen2DExplorer={() => setIsGuideOpen(true)}
          />
        )}

        {/* Interactive Landmark Dossier Modal */}
        <WorldDiscoveryModal
          poi={activeInspectPoi}
          onClose={() => setActiveInspectPoi(null)}
          onOpenProjectDetail={(p) => setSelectedProject(p)}
        />

        {/* Deep Project Blueprint Modal */}
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />

        {/* Project ZIP Download Modal */}
        <DownloadZipModal
          isOpen={isDownloadZipOpen}
          onClose={() => setIsDownloadZipOpen(false)}
        />

        {/* 2D Sanctuary Directory & Touch/Responsive Three.js Guide */}
        <TouchGuideModal
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
          onOpenPoi={(poi) => setActiveInspectPoi(poi)}
        />
      </div>
    </SanctuaryErrorBoundary>
  );
}
