import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface Simulator3DProps {
  commands: string[];
  onReset: () => void;
}

const Simulator3D: React.FC<Simulator3DProps> = ({ commands, onReset }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const robotGroupRef = useRef<THREE.Group | null>(null);
  const pathPointsRef = useRef<THREE.Points | null>(null);
  const pathPositionsRef = useRef<number[]>([]);
  
  const [robotPos, setRobotPos] = useState<[number, number, number]>([0, 0, 0]);
  // Rotation is now stored as angle in radians around Y axis (yaw)
  const [robotYaw, setRobotYaw] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [commandIndex, setCommandIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Waiting for commands...');
  const [isWaiting, setIsWaiting] = useState(false);

  // --- Create Robot Model ---
  const createRobot = (): THREE.Group => {
    const group = new THREE.Group();

    // Body
    const bodyGeo = new THREE.BoxGeometry(0.8, 0.6, 0.8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1976D2, metalness: 0.3, roughness: 0.7 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, 0.3, 0);
    body.castShadow = true;
    group.add(body);

    // Head - positioned to look towards +Z (forward)
    const headGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x42a5f5, metalness: 0.2, roughness: 0.6 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 0.8, 0.3); // Moved to front
    group.add(head);

    // Eyes - positioned on the front of the head (towards +Z)
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5 });
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    
    const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const pupilGeo = new THREE.SphereGeometry(0.04, 8, 8);
    
    const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
    eye1.position.set(0.15, 0.85, 0.55);
    group.add(eye1);
    
    const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
    eye2.position.set(-0.15, 0.85, 0.55);
    group.add(eye2);
    
    const pupil1 = new THREE.Mesh(pupilGeo, pupilMat);
    pupil1.position.set(0.18, 0.85, 0.6);
    group.add(pupil1);
    
    const pupil2 = new THREE.Mesh(pupilGeo, pupilMat);
    pupil2.position.set(-0.12, 0.85, 0.6);
    group.add(pupil2);

    // Antenna
    const antennaMat = new THREE.MeshStandardMaterial({ color: 0xff9800, emissive: 0xff9800, emissiveIntensity: 0.3 });
    const antennaGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.2);
    const antenna = new THREE.Mesh(antennaGeo, antennaMat);
    antenna.position.set(0, 1.0, 0.15);
    antenna.rotation.x = 0.1;
    group.add(antenna);
    
    const tipMat = new THREE.MeshStandardMaterial({ color: 0xff5722, emissive: 0xff5722, emissiveIntensity: 0.5 });
    const tipGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.position.set(0, 1.1, 0.2);
    group.add(tip);

    // Wheels
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 });
    const wheelGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.05);
    
    const positions = [
      [0.4, 0.05, 0, 0, 0, Math.PI / 2],
      [-0.4, 0.05, 0, 0, 0, Math.PI / 2],
      [0, 0.05, 0.4, 0, 0, 0],
      [0, 0.05, -0.4, 0, 0, 0],
    ];
    
    positions.forEach(([x, y, z, rx, ry, rz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(x, y, z);
      wheel.rotation.set(rx, ry, rz);
      group.add(wheel);
    });

    // Direction indicator (a small arrow showing forward direction)
    const arrowMat = new THREE.MeshStandardMaterial({ color: 0xff4444, emissive: 0xff4444, emissiveIntensity: 0.2 });
    const arrowGeo = new THREE.ConeGeometry(0.1, 0.2, 8);
    const arrow = new THREE.Mesh(arrowGeo, arrowMat);
    arrow.position.set(0, 0.1, 0.6);
    arrow.rotation.x = Math.PI / 2;
    group.add(arrow);

    return group;
  };

  // --- Initialize Three.js Scene ---
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 100);
    camera.position.set(4, 3, 5);
    camera.lookAt(0, 0.5, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.target.set(0, 0.5, 0);
    controls.minDistance = 2;
    controls.maxDistance = 15;
    controlsRef.current = controls;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(8, 12, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
    fillLight.position.set(-5, 2, -5);
    scene.add(fillLight);

    const pointLight = new THREE.PointLight(0xffaa00, 0.5, 10);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    // --- Ground ---
    const groundGeo = new THREE.PlaneGeometry(12, 12);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x222244, 
      roughness: 0.8, 
      metalness: 0.2,
      transparent: true,
      opacity: 0.5,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);

    // --- Grid ---
    const gridHelper = new THREE.GridHelper(10, 20, 0x666688, 0x444466);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // --- Axes with labels (using simple shapes) ---
    // X axis
    const xMat = new THREE.MeshStandardMaterial({ color: 0xff4444, emissive: 0xff4444, emissiveIntensity: 0.2 });
    const xCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8), xMat);
    xCyl.position.set(5.0, -0.05, 0);
    xCyl.rotation.z = Math.PI / 2;
    scene.add(xCyl);
    
    const xCone = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.15, 8), xMat);
    xCone.position.set(5.3, -0.05, 0);
    xCone.rotation.z = -Math.PI / 2;
    scene.add(xCone);

    // Z axis
    const zMat = new THREE.MeshStandardMaterial({ color: 0x4488ff, emissive: 0x4488ff, emissiveIntensity: 0.2 });
    const zCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8), zMat);
    zCyl.position.set(0, -0.05, 5.0);
    zCyl.rotation.x = Math.PI / 2;
    scene.add(zCyl);
    
    const zCone = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.15, 8), zMat);
    zCone.position.set(0, -0.05, 5.3);
    zCone.rotation.x = Math.PI / 2;
    scene.add(zCone);

    // Y axis
    const yMat = new THREE.MeshStandardMaterial({ color: 0x44ff44, emissive: 0x44ff44, emissiveIntensity: 0.2 });
    const yCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8), yMat);
    yCyl.position.set(0, 5.0, 0);
    scene.add(yCyl);
    
    const yCone = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.15, 8), yMat);
    yCone.position.set(0, 5.3, 0);
    scene.add(yCone);

    // --- Robot ---
    const robot = createRobot();
    robot.position.set(0, 0, 0);
    scene.add(robot);
    robotGroupRef.current = robot;

    // --- Path Points ---
    const pathGeo = new THREE.BufferGeometry();
    const pathPositions = new Float32Array(0);
    pathGeo.setAttribute('position', new THREE.BufferAttribute(pathPositions, 3));
    const pathMat = new THREE.PointsMaterial({
      color: 0xffaa00,
      size: 0.1,
      transparent: true,
      opacity: 0.8,
    });
    const pathPoints = new THREE.Points(pathGeo, pathMat);
    scene.add(pathPoints);
    pathPointsRef.current = pathPoints;

    // --- Animation Loop ---
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // --- Resize Handler ---
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        try {
          containerRef.current.removeChild(renderer.domElement);
        } catch (e) {
          // Ignore
        }
      }
      renderer.dispose();
    };
  }, []);

  // --- Update Robot Position ---
  useEffect(() => {
    if (!robotGroupRef.current) return;
    robotGroupRef.current.position.set(robotPos[0], robotPos[1], robotPos[2]);
    // Apply rotation around Y axis (yaw) - this is the fix for the double turn
    robotGroupRef.current.rotation.set(0, robotYaw, 0);
  }, [robotPos, robotYaw]);

  // --- Update Path ---
  useEffect(() => {
    if (!pathPointsRef.current) return;
    const positions = pathPositionsRef.current;
    const geometry = pathPointsRef.current.geometry;
    const attribute = geometry.attributes.position;
    
    if (attribute) {
      const newArray = new Float32Array(positions);
      attribute.set(newArray);
      attribute.needsUpdate = true;
      geometry.setDrawRange(0, positions.length / 3);
    }
  }, [pathPositionsRef.current]);

  // --- Execute Commands ---
  useEffect(() => {
    if (commands.length === 0) {
      setIsRunning(false);
      setCommandIndex(0);
      setIsWaiting(false);
      setStatusMessage('No commands to execute');
      return;
    }

    if (!isRunning && commandIndex < commands.length && !isWaiting) {
      setIsRunning(true);
      setStatusMessage(`Executing commands ${commandIndex + 1} to ${commands.length}...`);
    }
  }, [commands, commandIndex, isRunning, isWaiting]);

  useEffect(() => {
    if (isWaiting) return;
    if (!isRunning || commandIndex >= commands.length) {
      if (commandIndex >= commands.length && commands.length > 0) {
        setIsRunning(false);
        setStatusMessage('✅ All commands executed!');
      }
      return;
    }

    const command = commands[commandIndex];
    console.log(`Executing ${commandIndex + 1}/${commands.length}: ${command}`);

    // --- Wait Command ---
    if (command.includes('wait')) {
      const match = command.match(/wait\(([\d.]+)\)/);
      if (match) {
        const seconds = parseFloat(match[1]);
        setStatusMessage(`⏳ Waiting ${seconds} seconds...`);
        setIsWaiting(true);
        setTimeout(() => {
          setIsWaiting(false);
          setCommandIndex((prev) => prev + 1);
          setStatusMessage(`✅ Wait complete (${seconds}s)`);
        }, seconds * 1000);
        return;
      }
    }

    // --- Movement Commands ---
    const stepSize = 0.8;
    const timer = setTimeout(() => {
      setRobotPos((prev) => {
        const newPos: [number, number, number] = [...prev];
        let moved = false;

        if (command.includes('moveForward')) {
          const match = command.match(/moveForward\((\d+)\)/);
          if (match) {
            const steps = parseInt(match[1], 10);
            // Forward is +Z direction (since robot faces +Z)
            newPos[0] += stepSize * steps * Math.sin(robotYaw);
            newPos[2] += stepSize * steps * Math.cos(robotYaw);
            setStatusMessage(`Moving forward ${steps} steps...`);
            moved = true;
          }
        } else if (command.includes('moveBackward')) {
          const match = command.match(/moveBackward\((\d+)\)/);
          if (match) {
            const steps = parseInt(match[1], 10);
            // Backward is -Z direction
            newPos[0] -= stepSize * steps * Math.sin(robotYaw);
            newPos[2] -= stepSize * steps * Math.cos(robotYaw);
            setStatusMessage(`Moving backward ${steps} steps...`);
            moved = true;
          }
        } else if (command.includes('moveUp')) {
          const match = command.match(/moveUp\((\d+)\)/);
          if (match) {
            const steps = parseInt(match[1], 10);
            newPos[1] += stepSize * steps;
            setStatusMessage(`Moving up ${steps} steps...`);
            moved = true;
          }
        } else if (command.includes('moveDown')) {
          const match = command.match(/moveDown\((\d+)\)/);
          if (match) {
            const steps = parseInt(match[1], 10);
            newPos[1] -= stepSize * steps;
            setStatusMessage(`Moving down ${steps} steps...`);
            moved = true;
          }
        } else if (command.includes('turnRight')) {
          const match = command.match(/turnRight\((\d+)\)/);
          if (match) {
            const degrees = parseInt(match[1], 10);
            // FIX: Apply the angle directly - no doubling!
            // Also convert degrees to radians properly
            const radians = degrees * (Math.PI / 180);
            setRobotYaw((prevYaw) => prevYaw - radians); // Right turn = negative yaw in Three.js
            setStatusMessage(`Turning right ${degrees} degrees...`);
            moved = true;
          }
        } else if (command.includes('turnLeft')) {
          const match = command.match(/turnLeft\((\d+)\)/);
          if (match) {
            const degrees = parseInt(match[1], 10);
            // FIX: Apply the angle directly - no doubling!
            const radians = degrees * (Math.PI / 180);
            setRobotYaw((prevYaw) => prevYaw + radians); // Left turn = positive yaw in Three.js
            setStatusMessage(`Turning left ${degrees} degrees...`);
            moved = true;
          }
        } else if (command.includes('beep')) {
          const match = command.match(/beep\((\d+)\)/);
          if (match) {
            const duration = parseInt(match[1], 10);
            setStatusMessage(`🔊 Beeping for ${duration}ms...`);
            moved = true;
          }
        }

        // Add to path if moved (only add position, not for turns)
        if (moved && !command.includes('turn')) {
          pathPositionsRef.current.push(newPos[0], newPos[1], newPos[2]);
        }
        return newPos;
      });

      setCommandIndex((prev) => prev + 1);
    }, 500);

    return () => clearTimeout(timer);
  }, [commandIndex, commands, isRunning, isWaiting, robotYaw]);

  // --- Reset ---
  const handleReset = () => {
    setIsRunning(false);
    setCommandIndex(0);
    setIsWaiting(false);
    setRobotPos([0, 0, 0]);
    setRobotYaw(0);
    pathPositionsRef.current = [];
    setStatusMessage('🔄 Reset to origin');
    onReset();
  };

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      overflow: 'hidden',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#1a1a2e',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 16px',
        background: '#16213e',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>
            🌟 3D Robot Simulator
          </span>
          <span style={{
            fontSize: '11px',
            color: '#aaa',
            background: '#2d2d44',
            padding: '2px 10px',
            borderRadius: '12px',
          }}>
            {commands.length} commands
          </span>
        </div>
        <div>
          <button
            onClick={handleReset}
            style={{
              padding: '4px 14px',
              background: '#ff9800',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '12px',
            }}
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div ref={containerRef} style={{ flex: 1, minHeight: 0, position: 'relative' }} />

      {/* Status Bar */}
      <div style={{
        padding: '6px 16px',
        background: '#16213e',
        borderTop: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
        fontSize: '12px',
        color: '#aaa',
      }}>
        <span>🖱️ Drag to orbit • Scroll to zoom</span>
        <span style={{ color: '#fff' }}>{statusMessage}</span>
        <span>📍 ({robotPos[0].toFixed(1)}, {robotPos[1].toFixed(1)}, {robotPos[2].toFixed(1)})</span>
      </div>
    </div>
  );
};

export default Simulator3D;