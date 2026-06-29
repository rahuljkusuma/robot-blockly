import React, { useRef, useEffect, useState } from 'react';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

interface BlocklyWorkspaceProps {
  onRunCode: (code: string) => void;
}

const BlocklyWorkspace: React.FC<BlocklyWorkspaceProps> = ({ onRunCode }) => {
  const workspaceDiv = useRef<HTMLDivElement>(null);
  const [workspace, setWorkspace] = useState<Blockly.WorkspaceSvg | null>(null);
  const [code, setCode] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!workspaceDiv.current) return;

      try {
        // Clear existing block definitions
        const blockDefinitions = Blockly.Blocks as any;
        ['move_forward', 'move_backward', 'turn_right', 'turn_left', 'repeat_loop', 'wait', 'beep'].forEach(blockType => {
          if (blockDefinitions[blockType]) {
            delete blockDefinitions[blockType];
          }
        });

        // Define all custom blocks
        Blockly.defineBlocksWithJsonArray([
          // --- Movement Blocks ---
          {
            type: 'move_forward',
            message0: 'Move forward %1 steps',
            args0: [
              {
                type: 'field_number',
                name: 'STEPS',
                value: 1,
                min: 1,
                max: 10,
              },
            ],
            previousStatement: null,
            nextStatement: null,
            colour: 160,
            tooltip: 'Move the robot forward',
          },
          {
            type: 'move_backward',
            message0: 'Move backward %1 steps',
            args0: [
              {
                type: 'field_number',
                name: 'STEPS',
                value: 1,
                min: 1,
                max: 10,
              },
            ],
            previousStatement: null,
            nextStatement: null,
            colour: 160,
            tooltip: 'Move the robot backward',
          },
          // --- Turn Blocks ---
          {
            type: 'turn_right',
            message0: 'Turn right %1 degrees',
            args0: [
              {
                type: 'field_number',
                name: 'DEGREES',
                value: 90,
                min: 1,
                max: 360,
                precision: 1,
              },
            ],
            previousStatement: null,
            nextStatement: null,
            colour: 230,
            tooltip: 'Turn the robot right',
          },
          {
            type: 'turn_left',
            message0: 'Turn left %1 degrees',
            args0: [
              {
                type: 'field_number',
                name: 'DEGREES',
                value: 90,
                min: 1,
                max: 360,
                precision: 1,
              },
            ],
            previousStatement: null,
            nextStatement: null,
            colour: 230,
            tooltip: 'Turn the robot left',
          },
          // --- Control Blocks ---
          {
            type: 'repeat_loop',
            message0: 'Repeat %1 times',
            args0: [
              {
                type: 'field_number',
                name: 'TIMES',
                value: 5,
                min: 1,
                max: 100,
              },
            ],
            message1: 'do %1',
            args1: [
              {
                type: 'input_statement',
                name: 'DO',
              },
            ],
            previousStatement: null,
            nextStatement: null,
            colour: 120,
            tooltip: 'Repeat a set of commands',
          },
          // --- Utility Blocks ---
          {
            type: 'wait',
            message0: 'Wait %1 seconds',
            args0: [
              {
                type: 'field_number',
                name: 'SECONDS',
                value: 1,
                min: 0.1,
                max: 10,
                precision: 0.1,
              },
            ],
            previousStatement: null,
            nextStatement: null,
            colour: 330,
            tooltip: 'Pause the robot for a few seconds',
          },
          {
            type: 'beep',
            message0: 'Beep for %1 ms',
            args0: [
              {
                type: 'field_number',
                name: 'DURATION',
                value: 100,
                min: 50,
                max: 1000,
                precision: 10,
              },
            ],
            previousStatement: null,
            nextStatement: null,
            colour: 330,
            tooltip: 'Make the robot beep',
          },
        ]);

        // --- Register JavaScript Generators ---
        // Movement
        javascriptGenerator.forBlock['move_forward'] = function(block: any) {
          const steps = block.getFieldValue('STEPS');
          return `moveForward(${steps});\n`;
        };

        javascriptGenerator.forBlock['move_backward'] = function(block: any) {
          const steps = block.getFieldValue('STEPS');
          return `moveBackward(${steps});\n`;
        };

        // Turns
        javascriptGenerator.forBlock['turn_right'] = function(block: any) {
          const degrees = block.getFieldValue('DEGREES');
          return `turnRight(${degrees});\n`;
        };

        javascriptGenerator.forBlock['turn_left'] = function(block: any) {
          const degrees = block.getFieldValue('DEGREES');
          return `turnLeft(${degrees});\n`;
        };

        // Control
        javascriptGenerator.forBlock['repeat_loop'] = function(block: any) {
          const times = block.getFieldValue('TIMES');
          const branch = javascriptGenerator.statementToCode(block, 'DO');
          return `for (let i = 0; i < ${times}; i++) {\n${branch}}\n`;
        };

        // Utility
        javascriptGenerator.forBlock['wait'] = function(block: any) {
          const seconds = block.getFieldValue('SECONDS');
          return `wait(${seconds});\n`;
        };

        javascriptGenerator.forBlock['beep'] = function(block: any) {
          const duration = block.getFieldValue('DURATION');
          return `beep(${duration});\n`;
        };

        // --- Toolbox with all blocks ---
        const toolbox = `
          <xml xmlns="https://developers.google.com/blockly/xml">
            <category name="Movement" colour="160">
              <block type="move_forward"></block>
              <block type="move_backward"></block>
              <block type="turn_right"></block>
              <block type="turn_left"></block>
            </category>
            <category name="Control" colour="120">
              <block type="repeat_loop"></block>
            </category>
            <category name="Utilities" colour="330">
              <block type="wait"></block>
              <block type="beep"></block>
            </category>
          </xml>
        `;

        const container = workspaceDiv.current;
        if (container.clientHeight === 0) {
          container.style.height = '500px';
        }

        console.log('Injecting Blockly with all blocks...');
        
        const newWorkspace = Blockly.inject(container, {
          toolbox: toolbox,
          trashcan: true,
          renderer: 'zelos',
          zoom: {
            controls: true,
            wheel: true,
            startScale: 0.9,
            maxScale: 1.5,
            minScale: 0.5,
            scaleSpeed: 1.1,
          },
          grid: {
            spacing: 20,
            length: 3,
            colour: '#ccc',
            snap: true,
          },
          move: {
            scrollbars: true,
            drag: true,
            wheel: true,
          },
        });

        console.log('Blockly injected successfully!');
        setWorkspace(newWorkspace);

        const handleChange = () => {
          try {
            const generatedCode = javascriptGenerator.workspaceToCode(newWorkspace);
            setCode(generatedCode);
          } catch (e) {
            console.error('Code generation error:', e);
          }
        };

        newWorkspace.addChangeListener(handleChange);
        setTimeout(handleChange, 100);

        return () => {
          newWorkspace.dispose();
        };
      } catch (error) {
        console.error('Error initializing Blockly:', error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleRun = () => {
    if (workspace) {
      try {
        const generatedCode = javascriptGenerator.workspaceToCode(workspace);
        onRunCode(generatedCode);
        console.log('Running code:', generatedCode);
      } catch (e) {
        console.error('Error running code:', e);
      }
    }
  };

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      overflow: 'hidden',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#fff'
    }}>
      <div style={{ 
        padding: '10px 15px', 
        background: '#f5f5f5', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #ddd',
        flexShrink: 0,
        zIndex: 10
      }}>
        <button 
          onClick={handleRun}
          style={{
            padding: '8px 20px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          ▶ Run Simulation
        </button>
        <span style={{ fontSize: '14px', color: '#666' }}>
          Blocks: {workspace ? workspace.getTopBlocks(false).length : 0}
        </span>
      </div>
      <div 
        ref={workspaceDiv} 
        style={{ 
          width: '100%', 
          height: '500px',
          minHeight: '500px',
          flex: '1',
          position: 'relative'
        }} 
      />
      <div style={{ 
        padding: '10px 15px', 
        background: '#1e1e1e', 
        color: '#d4d4d4',
        maxHeight: '150px',
        overflow: 'auto',
        fontFamily: 'monospace',
        fontSize: '13px',
        flexShrink: 0,
        borderTop: '1px solid #333'
      }}>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {code || '// Generated JavaScript code will appear here'}
        </pre>
      </div>
    </div>
  );
};

export default BlocklyWorkspace;