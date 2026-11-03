"use client";

import React, { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { KARNATAKA_LANDMARKS, type VerifiedLandmark } from "./terrain-data";

interface TerrainCanvasProps {
  reliefScale: number;
  selectedLandmark: VerifiedLandmark | null;
  onSelectLandmark: (landmark: VerifiedLandmark) => void;
  biomeFilter: string;
  onWebGlError?: () => void;
}

export function TerrainCanvas({
  reliefScale,
  selectedLandmark,
  onSelectLandmark,
  biomeFilter,
  onWebGlError,
}: TerrainCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const terrainMeshRef = useRef<THREE.Mesh | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const needRenderRef = useRef<boolean>(true);

  // Mouse orbit state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0.55, y: -0.35 });

  const requestRender = useCallback(() => {
    needRenderRef.current = true;
  }, []);

  // Project geographic coordinates (lat, lng, elevation) to 3D world space
  const projectToWorld = useCallback((lat: number, lng: number, elevationM: number) => {
    // Karnataka bounds: lat 11.5 - 18.5, lng 74.0 - 78.5
    const normX = (lng - 74.0) / 4.5; // 0 to 1
    const normY = (lat - 11.5) / 7.0; // 0 to 1

    const worldX = (normX - 0.5) * 12.0;
    const worldY = (normY - 0.5) * 18.0;
    const worldZ = (elevationM / 2000) * 1.8 * reliefScale;

    return new THREE.Vector3(worldX, worldY, worldZ);
  }, [reliefScale]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Initialize Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0A1A14");
    scene.fog = new THREE.FogExp2("#0A1A14", 0.035);
    sceneRef.current = scene;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 520;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, -18, 14);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 2. Initialize WebGLRenderer with Context Loss Safeguards
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance",
        alpha: false,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      renderer.domElement.addEventListener("webglcontextlost", (e) => {
        e.preventDefault();
        console.warn("[TerrainCanvas] WebGL context lost");
        if (onWebGlError) onWebGlError();
      });

      renderer.domElement.addEventListener("webglcontextrestored", () => {
        console.info("[TerrainCanvas] WebGL context restored");
        requestRender();
      });
    } catch {
      if (onWebGlError) onWebGlError();
      return;
    }

    // 3. Environmental Lighting
    const ambientLight = new THREE.AmbientLight("#FFFFFF", 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight("#FDE68A", 2.2); // Warm dawn sunlight
    sunLight.position.set(15, -12, 18);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight("#34D399", 0.8); // Sahyadri emerald bounce
    fillLight.position.set(-15, 10, 8);
    scene.add(fillLight);

    // 4. Generate Procedural Karnataka Relief Mesh
    const gridCols = 54;
    const gridRows = 72;
    const terrainGeo = new THREE.PlaneGeometry(12, 18, gridCols - 1, gridRows - 1);

    const posAttr = terrainGeo.attributes.position;
    const colors = new Float32Array(posAttr.count * 3);

    const cOcean = new THREE.Color("#0F3D30");
    const cCoastal = new THREE.Color("#165B4C");
    const cGhats = new THREE.Color("#10B981");
    const cPlains = new THREE.Color("#B45309");
    const cPeak = new THREE.Color("#F59E0B");

    for (let i = 0; i < posAttr.count; i++) {
      const u = (posAttr.getX(i) + 6) / 12; // 0 (west) to 1 (east)
      const v = (posAttr.getY(i) + 9) / 18; // 0 (south) to 1 (north)

      // Geomorphic model of Karnataka elevation
      let elev = 0;

      // 1. Coastal shelf: Low elevation on far west (u < 0.22)
      if (u < 0.22) {
        elev = Math.sin(u * Math.PI * 2) * 0.1;
      }
      // 2. Western Ghats ridge: Steep rise between u in [0.22, 0.45]
      else if (u >= 0.22 && u < 0.45) {
        const ghatNorm = (u - 0.22) / 0.23;
        // High mountain crest with peaks at Mullayanagiri / Kudremukha (around v=0.35)
        const peakBoost = Math.sin(v * Math.PI) * 0.8;
        elev = Math.sin(ghatNorm * Math.PI) * (1.6 + peakBoost) + 0.5;
      }
      // 3. South Deccan plateau (Bayalu Seeme) and North Plains
      else {
        const plateauBase = (1 - v) * 0.8 + v * 0.45; // Higher in south (Mysuru/Bengaluru), sloping north
        const undulatingHills = Math.sin(u * 12) * Math.cos(v * 14) * 0.25;
        elev = plateauBase + undulatingHills;
      }

      posAttr.setZ(i, Math.max(0, elev) * reliefScale);

      // Vertex color gradient by elevation
      const normElev = Math.min(elev / 2.2, 1.0);
      const color = new THREE.Color();
      if (u < 0.22) {
        color.copy(cOcean);
      } else if (normElev < 0.35) {
        color.lerpColors(cCoastal, cGhats, normElev / 0.35);
      } else if (normElev < 0.65) {
        color.lerpColors(cGhats, cPlains, (normElev - 0.35) / 0.3);
      } else {
        color.lerpColors(cPlains, cPeak, (normElev - 0.65) / 0.35);
      }

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    terrainGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.75,
      metalness: 0.15,
      flatShading: true,
    });

    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    scene.add(terrainMesh);
    terrainMeshRef.current = terrainMesh;

    // 5. Landmark 3D Hotspot Markers
    const markersGroup = new THREE.Group();
    scene.add(markersGroup);
    markersGroupRef.current = markersGroup;

    // 6. Demand-Driven Render Loop
    const renderScene = () => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        // Apply rotation
        terrainMesh.rotation.z = rotationRef.current.y;
        terrainMesh.rotation.x = rotationRef.current.x;
        markersGroup.rotation.z = rotationRef.current.y;
        markersGroup.rotation.x = rotationRef.current.x;

        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      needRenderRef.current = false;
    };

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      if (needRenderRef.current) {
        renderScene();
      }
    };
    animate();

    // 7. Responsive Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
      requestRender();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (rendererRef.current?.domElement) {
        rendererRef.current.dispose();
        if (container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement);
        }
      }
      terrainGeo.dispose();
      terrainMat.dispose();
    };
  }, [reliefScale, onWebGlError, requestRender]);

  // Update Markers when landmarks / filters change
  useEffect(() => {
    const group = markersGroupRef.current;
    if (!group) return;

    // Clear previous markers
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    }

    const filtered = KARNATAKA_LANDMARKS.filter(
      (l) => biomeFilter === "all" || l.biome === biomeFilter
    );

    for (const landmark of filtered) {
      const pos = projectToWorld(landmark.lat, landmark.lng, landmark.elevationMeters);
      const isSelected = selectedLandmark?.id === landmark.id;

      // Vertical Stilt Marker Pole
      const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8);
      const poleMat = new THREE.MeshBasicMaterial({
        color: isSelected ? "#F59E0B" : "#10B981",
      });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(pos.x, pos.y, pos.z + 0.6);
      pole.rotation.x = Math.PI / 2;

      // Hotspot Sphere Head
      const sphereGeo = new THREE.SphereGeometry(isSelected ? 0.32 : 0.22, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: isSelected ? "#FBBF24" : "#34D399",
        emissive: isSelected ? "#F59E0B" : "#059669",
        emissiveIntensity: 0.6,
        roughness: 0.2,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(pos.x, pos.y, pos.z + 1.2);
      sphere.userData = { landmark };

      group.add(pole);
      group.add(sphere);
    }

    requestRender();
  }, [biomeFilter, selectedLandmark, reliefScale, projectToWorld, requestRender]);

  // Mouse drag handlers for Orbit
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    rotationRef.current.y += deltaX * 0.008;
    rotationRef.current.x = Math.max(
      0.15,
      Math.min(1.2, rotationRef.current.x + deltaY * 0.008)
    );

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    requestRender();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Canvas Click Handler (Raycasting to select landmark)
  const handleCanvasClick = (e: React.MouseEvent) => {
    const container = mountRef.current;
    if (!container || !cameraRef.current || !markersGroupRef.current) return;

    const rect = container.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const intersects = raycaster.intersectObjects(markersGroupRef.current.children, true);
    for (const hit of intersects) {
      if (hit.object.userData && hit.object.userData.landmark) {
        onSelectLandmark(hit.object.userData.landmark as VerifiedLandmark);
        break;
      }
    }
  };

  return (
    <div
      ref={mountRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
      className="relative w-full h-[520px] rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing border border-emerald-900/40 select-none"
    />
  );
}
