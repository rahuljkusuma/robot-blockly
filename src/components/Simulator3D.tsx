import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Box, Sphere, Cylinder, Text } from '@react-three/drei';
import * as THREE from 'three';

interface Simulator3DProps {
  commands: string[];
  onReset: () => void;
}

// --- Robot Component ---
const Robot3D: React.FC<{ position: [number, number, number]; rotation: [number, number, number] }> = ({ 
  position, 
  rotation 
}) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Body */}
      <Box args={[0.8, 0.6, 0.8]} position={[0, 0.3, 0]}>
        <meshStandardMaterial color="#1976D2" metalness={0.3} roughness={0.7} />
      </Box>
      
      {/* Head */}
      <Sphere args={[0.3, 16, 16]} position={[0, 0.8, 0]}>
        <meshStandardMaterial color="#42a5f5" metalness={0.2} roughness={0.6} />
      </Sphere>
      
      {/* Eyes */}
      <Sphere args={[0.08, 8, 8]} position={[0.15, 0.85, 0.3]}>
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </Sphere>
      <Sphere args={[0.08, 8, 8]} position={[-0.15, 0.85, 0.3]}>
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </Sphere>
      <Sphere args={[0.04, 8, 8]} position={[0.18, 0.85, 0.35]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>
      <Sphere args={[0.04, 8, 8]} position={[-0.12, 0.85, 0.35]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>
      
      {/* Antenna */}
      <Cylinder args={[0.02, 0.02, 0.2]} position={[0, 1.0, 0]} rotation={[0.1, 0, 0]}>
        <meshStandardMaterial color="#ff9800" emissive="#ff9800" emissiveIntensity={0.3} />
      </Cylinder>
      <Sphere args={[0.05, 8, 8]} position={[0, 1.1, 0.05]}>
        <meshStandardMaterial color="#ff5722" emissive="#ff5722" emissiveIntensity={0.5} />
      </Sphere>
      
      {/* Wheels */}
      <Cylinder args={[0.15, 0.15, 0.05]} position={[0.4, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#333" roughness={0.9} />
      </Cylinder>
      <Cylinder args={[0.15, 0.15, 0.05]} position={[-0.4, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#333" roughness={0.9} />
      </Cylinder>
      <Cylinder args={[0.15, 0.15, 0.05]} position={[0, 0.05, 0.4]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#333" roughness={0.9} />
      </Cylinder>
      <Cylinder args={[0.15, 0.15, 0.05]} position={[0, 0.05, -0.4]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#333" roughness={0.9} />
      </Cylinder>
    </group>
  );
};

// --- Main Simulator Component ---
const Simulator3D: React.FC<Simulator3DProps> = ({ commands, onReset }) => {
  const [robotPos, setRobotPos] = useState<[number, number, number]>([0, 0, 0]);
  const [robotRot, setRobotRot] = useState<[number, number, number]>([0, 0, 0]);
  const [isRunning, setIsRunning] = useState(false);
  const [commandIndex, setCommandIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Waiting for commands...');
  const [isWaiting, setIsWaiting] = useState(false);
  const [path, setPath] = useState<[number, number, number][]>([]);
  const controlsRef = useRef<any>(null);

  // Reset robot
  const handleReset = () => {
    setIsRunning(false);
    setCommandIndex(0);
    setIsWaiting(false);
    setRobotPos([0, 0, 0]);
    setRobotRot([0, 0, 0]);
    setPath([]);
    setStatusMessage('🔄 Reset to origin');
    onReset();
  };

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
            newPos[0] += stepSize * steps * Math.cos(robotRot[1]);
            newPos[2] += stepSize * steps * Math.sin(robotRot[1]);
            setStatusMessage(`Moving forward ${steps} steps...`);
            moved = true;
          }
        } else if (command.includes('moveBackward')) {
          const match = command.match(/moveBackward\((\d+)\)/);
          if (match) {
            const steps = parseInt(match[1], 10);
            newPos[0] -= stepSize * steps * Math.cos(robotRot[1]);
            newPos[2] -= stepSize * steps * Math.sin(robotRot[1]);
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
            setRobotRot((prevRot) => {
              const newRot: [number, number, number] = [...prevRot];
              newRot[1] += degrees * (Math.PI / 180);
              return newRot;
            });
            setStatusMessage(`Turning right ${degrees} degrees...`);
            moved = true;
          }
        } else if (command.includes('turnLeft')) {
          const match = command.match(/turnLeft\((\d+)\)/);
          if (match) {
            const degrees = parseInt(match[1], 10);
            setRobotRot((prevRot) => {
              const newRot: [number, number, number] = [...prevRot];
              newRot[1] -= degrees * (Math.PI / 180);
              return newRot;
            });
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

        // Add to path if moved
        if (moved) {
          setPath((prev) => [...prev, [...newPos] as [number, number, number]]);
        }
        return newPos;
      });

      setCommandIndex((prev) => prev + 1);
    }, 500);

    return () => clearTimeout(timer);
  }, [commandIndex, commands, isRunning, isWaiting, robotRot]);

  // --- 3D Scene ---
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
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <Canvas
          camera={{ position: [5, 4, 5], fov: 45 }}
          style={{ background: '#1a1a2e' }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.3} />
          <pointLight position={[0, 5, 0]} intensity={0.5} />

          {/* Grid */}
          <Grid
            args={[10, 10]}
            position={[0, -0.1, 0]}
            cellColor="#444466"
            sectionColor="#555577"
            cellSize={0.2}
            sectionSize={1}
          />

          {/* Axes Labels */}
          <Text position={[5.5, -0.1, 0]} color="#ff4444" fontSize={0.5}>X</Text>
          <Text position={[0, -0.1, 5.5]} color="#4444ff" fontSize={0.5}>Z</Text>
          <Text position={[0, 5.5, 0]} color="#44ff44" fontSize={0.5}>Y</Text>

          {/* Path Trail */}
          {path.length > 1 && (
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={path.length}
                  array={new Float32Array(path.flat())}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#ffaa00" transparent opacity={0.6} />
            </line>
          )}

          {/* Path Points */}
          {path.map((pos, idx) => (
            <Sphere key={idx} args={[0.04, 8, 8]} position={pos}>
              <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={0.5} />
            </Sphere>
          ))}

          {/* Robot */}
          <Robot3D position={robotPos} rotation={robotRot} />

          {/* Orbit Controls */}
          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            target={[0, 0.5, 0]}
            minDistance={2}
            maxDistance={15}
          />
        </Canvas>
      </div>

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