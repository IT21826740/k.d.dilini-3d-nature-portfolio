import React, { useState, useEffect } from 'react';
import { WalkableIslandCanvas } from './components/canvas/WalkableIslandCanvas';
import { WorldHUD } from './components/world/WorldHUD';
import { WorldDiscoveryModal } from './components/world/WorldDiscoveryModal';
import { ProjectModal } from './components/ProjectModal';
import { DownloadZipModal } from './components/DownloadZipModal';
import { WorldInteractable } from './data/worldData';
import { Project } from './data/portfolioData';
import { walkAudio } from './utils/walkAudio';

export default function App() {
  const [nearbyPoi, setNearbyPoi] = useState<WorldInteractable | null>(null);
  const [activeInspectPoi, setActiveInspectPoi] = useState<WorldInteractable | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDownloadZipOpen, setIsDownloadZipOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(walkAudio.isMuted);
  const [teleportTargetId, setTeleportTargetId] = useState<string | null>(null);

  // Start calm ambient wind on initial user interaction
  useEffect(() => {
    const handleFirstUserInteraction = () => {
      walkAudio.startAmbience();
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
    };

    window.addEventListener('click', handleFirstUserInteraction);
    window.addEventListener('keydown', handleFirstUserInteraction);

    return () => {
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
    };
  }, []);

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

  const handleFastTravel = (poiId: string) => {
    setTeleportTargetId(poiId);
    // Reset after trigger so it can be re-triggered
    setTimeout(() => {
      setTeleportTargetId(null);
    }, 100);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#09120e] text-[#f4efe6] select-none">
      
      {/* 3D Walkable Three.js Nature World (Full Viewport) */}
      <div className="absolute inset-0 z-0">
        <WalkableIslandCanvas
          onNearbyInteractable={(poi) => setNearbyPoi(poi)}
          onOpenInteractable={(poi) => setActiveInspectPoi(poi)}
          activeInspectPoi={activeInspectPoi}
          triggerTeleportId={teleportTargetId}
        />
      </div>

      {/* Atmospheric Mist & Vignette Ring */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#09120e]/20 to-[#09120e]/80 pointer-events-none z-10" />

      {/* Heads-Up Display: Navigation, Proximity Alerts, Controls, Fast-Travel */}
      <WorldHUD
        nearbyPoi={nearbyPoi}
        onOpenPoi={(poi) => setActiveInspectPoi(poi)}
        onFastTravel={handleFastTravel}
        onOpenDownloadZip={() => setIsDownloadZipOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Interactive Landmark Dossier Modal (Profile, Projects list, Skills, Certs, Contact) */}
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

      {/* Vercel & GitHub Project ZIP Download Modal */}
      <DownloadZipModal
        isOpen={isDownloadZipOpen}
        onClose={() => setIsDownloadZipOpen(false)}
      />

    </div>
  );
}
