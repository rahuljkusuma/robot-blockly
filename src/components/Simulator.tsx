import React, { useRef, useEffect, useState } from 'react';

interface SimulatorProps {
  commands: string[];
  onReset: () => void;
}

const Simulator: React.FC<SimulatorProps> = ({ commands, onReset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [robotState, setRobotState] = useState({ x: 400, y: 400, angle: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [commandIndex, setCommandIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Waiting for commands...');
  const lastProcessedIndex = useRef<number>(0);
  
  // Canvas size - now much larger!
  const CANVAS_SIZE = 1000; // Increased from 500 to 700

  // Drawing function
  const draw = (ctx: CanvasRenderingContext2D, state: { x: number; y: number; angle: number }) => {
    const { x, y, angle } = state;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Grid - more spacing for larger canvas
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    const gridSpacing = 50;
    for (let i = 0; i < CANVAS_SIZE; i += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
      ctx.stroke();
    }

    // Robot (scaled for larger canvas)
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Body - larger
    const robotRadius = 25; // Increased from 20
    ctx.fillStyle = '#1976D2';
    ctx.strokeStyle = '#0D47A1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, robotRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Direction indicator - larger
    ctx.fillStyle = '#FFC107';
    ctx.beginPath();
    ctx.moveTo(robotRadius + 8, 0);
    ctx.lineTo(robotRadius - 8, -12);
    ctx.lineTo(robotRadius - 8, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // Label
    ctx.fillStyle = '#333';
    ctx.font = '18px Arial';
    ctx.fillText('🤖', x - 20, y - 40);

    // Coordinates display
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.fillText(`(${Math.round(x)}, ${Math.round(y)})`, 10, 20);
    ctx.fillText(`Angle: ${Math.round(angle * 180 / Math.PI)}°`, 10, 40);
  };

  // Redraw whenever robot state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    draw(ctx, robotState);
  }, [robotState]);

  // Reset robot position when canvas size changes
  useEffect(() => {
    setRobotState({ x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2, angle: 0 });
  }, [CANVAS_SIZE]);

  // --- Run Simulation Logic ---
  useEffect(() => {
    if (commands.length === 0) {
      setIsRunning(false);
      setCommandIndex(0);
      lastProcessedIndex.current = 0;
      setStatusMessage('No commands to execute');
      return;
    }

    if (!isRunning && commandIndex < commands.length) {
      setIsRunning(true);
      setStatusMessage(`Executing commands ${commandIndex + 1} to ${commands.length}...`);
    }
  }, [commands, commandIndex, isRunning]);

  // Execute commands one by one
  useEffect(() => {
    if (!isRunning || commandIndex >= commands.length) {
      if (commandIndex >= commands.length && commands.length > 0) {
        setIsRunning(false);
        setStatusMessage('✅ All commands executed!');
        lastProcessedIndex.current = commandIndex;
      }
      return;
    }

    const timer = setTimeout(() => {
      const command = commands[commandIndex];
      console.log(`Executing ${commandIndex + 1}/${commands.length}: ${command}`);

      setRobotState((prev) => {
        const newState = { ...prev };
        const stepSize = 50; // Increased from 40 for larger canvas

        if (command.includes('moveForward')) {
          const match = command.match(/moveForward\((\d+)\)/);
          if (match) {
            const steps = parseInt(match[1], 10);
            newState.x += Math.cos(newState.angle) * stepSize * steps;
            newState.y += Math.sin(newState.angle) * stepSize * steps;
            // Keep robot in bounds (with margin)
            const margin = 30;
            newState.x = Math.max(margin, Math.min(CANVAS_SIZE - margin, newState.x));
            newState.y = Math.max(margin, Math.min(CANVAS_SIZE - margin, newState.y));
            setStatusMessage(`Moving forward ${steps} steps...`);
          }
        } else if (command.includes('moveBackward')) {
          const match = command.match(/moveBackward\((\d+)\)/);
          if (match) {
            const steps = parseInt(match[1], 10);
            newState.x -= Math.cos(newState.angle) * stepSize * steps;
            newState.y -= Math.sin(newState.angle) * stepSize * steps;
            const margin = 30;
            newState.x = Math.max(margin, Math.min(CANVAS_SIZE - margin, newState.x));
            newState.y = Math.max(margin, Math.min(CANVAS_SIZE - margin, newState.y));
            setStatusMessage(`Moving backward ${steps} steps...`);
          }
        } else if (command.includes('turnRight')) {
          const match = command.match(/turnRight\((\d+)\)/);
          if (match) {
            const degrees = parseInt(match[1], 10);
            newState.angle += degrees * (Math.PI / 180);
            setStatusMessage(`Turning right ${degrees} degrees...`);
          }
        } else if (command.includes('turnLeft')) {
          const match = command.match(/turnLeft\((\d+)\)/);
          if (match) {
            const degrees = parseInt(match[1], 10);
            newState.angle -= degrees * (Math.PI / 180);
            setStatusMessage(`Turning left ${degrees} degrees...`);
          }
        } else if (command.includes('wait')) {
          const match = command.match(/wait\(([\d.]+)\)/);
          if (match) {
            const seconds = parseFloat(match[1]);
            setStatusMessage(`Waiting ${seconds} seconds...`);
          }
        } else if (command.includes('beep')) {
          const match = command.match(/beep\((\d+)\)/);
          if (match) {
            const duration = parseInt(match[1], 10);
            setStatusMessage(`🔊 Beeping for ${duration}ms...`);
            // Visual feedback for beep
            const canvas = canvasRef.current;
            if (canvas) {
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
                ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
                setTimeout(() => {
                  if (ctx) {
                    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
                    draw(ctx, robotState);
                  }
                }, 200);
              }
            }
          }
        } else {
          setStatusMessage(`Unknown command: ${command}`);
        }
        return newState;
      });

      setCommandIndex((prev) => prev + 1);
    }, 500);

    return () => clearTimeout(timer);
  }, [commandIndex, commands, isRunning]);

  // --- Reset Function ---
  const handleReset = () => {
    setIsRunning(false);
    setCommandIndex(0);
    lastProcessedIndex.current = 0;
    setRobotState({ x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2, angle: 0 });
    setStatusMessage('🔄 Reset to origin');
    onReset();
  };

  return (
    <div 
      ref={containerRef}
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        background: '#fafafa',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '600px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexShrink: 0 }}>
        <h3 style={{ margin: 0 }}>🤖 Robot Simulator</h3>
        <div>
          <button
            onClick={handleReset}
            style={{
              padding: '6px 15px',
              background: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginRight: '10px'
            }}
          >
            🔄 Reset
          </button>
          <span style={{ fontSize: '12px', color: '#666', background: '#eee', padding: '2px 10px', borderRadius: '12px' }}>
            {commands.length} commands
          </span>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        flex: 1,
        minHeight: 0,
      }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          style={{
            border: '2px solid #ccc',
            borderRadius: '8px',
            background: 'white',
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            aspectRatio: '1 / 1',
          }}
        />
      </div>

      <div style={{
        marginTop: '10px',
        padding: '8px 12px',
        background: '#fff',
        borderRadius: '4px',
        border: '1px solid #eee',
        fontSize: '14px',
        color: '#555',
        textAlign: 'center',
        minHeight: '24px',
        flexShrink: 0,
      }}>
        {statusMessage}
      </div>
    </div>
  );
};

export default Simulator;