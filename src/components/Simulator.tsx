import React, { useRef, useEffect, useState } from 'react';

interface SimulatorProps {
  commands: string[];
}

const Simulator: React.FC<SimulatorProps> = ({ commands }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [robotState, setRobotState] = useState({ x: 250, y: 250, angle: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [commandIndex, setCommandIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Waiting for commands...');

  const draw = (ctx: CanvasRenderingContext2D, state: { x: number; y: number; angle: number }) => {
    const { x, y, angle } = state;
    ctx.clearRect(0, 0, 500, 500);

    // Grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i < 500; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 500);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(500, i);
      ctx.stroke();
    }

    // Robot body
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    // Circle body
    ctx.fillStyle = '#1976D2';
    ctx.strokeStyle = '#0D47A1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Direction indicator
    ctx.fillStyle = '#FFC107';
    ctx.beginPath();
    ctx.moveTo(25, 0);
    ctx.lineTo(10, -10);
    ctx.lineTo(10, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();

    // Label
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.fillText('🤖', x - 15, y - 30);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    draw(ctx, robotState);
  }, [robotState]);

  // Reset and run when commands change
  useEffect(() => {
    if (commands.length === 0) {
      setStatusMessage('No commands to execute');
      setIsRunning(false);
      return;
    }

    if (isRunning) return;

    setStatusMessage(`Executing ${commands.length} commands...`);
    setIsRunning(true);
    setCommandIndex(0);
    setRobotState({ x: 250, y: 250, angle: 0 });
  }, [commands]);

  // Execute commands one by one
  useEffect(() => {
    if (!isRunning || commandIndex >= commands.length) {
      if (commandIndex >= commands.length && commands.length > 0) {
        setIsRunning(false);
        setStatusMessage('✅ All commands executed!');
      }
      return;
    }

    const timer = setTimeout(() => {
      const command = commands[commandIndex];
      console.log(`Executing ${commandIndex + 1}/${commands.length}: ${command}`);
      
      setRobotState(prev => {
        const newState = { ...prev };
        const stepSize = 40;
        
        if (command.includes('moveForward')) {
          const match = command.match(/moveForward\((\d+)\)/);
          if (match) {
            const steps = parseInt(match[1], 10);
            newState.x += Math.cos(newState.angle) * stepSize * steps;
            newState.y += Math.sin(newState.angle) * stepSize * steps;
            newState.x = Math.max(20, Math.min(480, newState.x));
            newState.y = Math.max(20, Math.min(480, newState.y));
            setStatusMessage(`Moving forward ${steps} steps...`);
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
        } else {
          setStatusMessage(`Unknown command: ${command}`);
        }
        
        return newState;
      });
      
      setCommandIndex(prev => prev + 1);
    }, 500);

    return () => clearTimeout(timer);
  }, [commandIndex, commands, isRunning]);

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '15px',
      background: '#fafafa'
    }}>
      <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
        🤖 Robot Simulator
        <span style={{ 
          fontSize: '12px', 
          color: '#666', 
          fontWeight: 'normal',
          background: '#eee',
          padding: '2px 10px',
          borderRadius: '12px'
        }}>
          {commands.length} commands
        </span>
      </h3>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <canvas 
          ref={canvasRef} 
          width={500} 
          height={500} 
          style={{ 
            border: '1px solid #ccc', 
            borderRadius: '4px',
            background: 'white',
            maxWidth: '100%'
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
        textAlign: 'center'
      }}>
        {statusMessage}
      </div>
    </div>
  );
};

export default Simulator;