import React, { useState, useRef } from 'react';
import BlocklyWorkspace from './components/BlocklyWorkspace';
import Simulator from './components/Simulator';
import './App.css';

function App() {
  const [commands, setCommands] = useState<string[]>([]);
  const isFirstRun = useRef<boolean>(true);

  // --- Helper function to expand loops in the generated code ---
  const expandCommands = (code: string): string[] => {
    const lines = code.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const result: string[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Check if this is a for loop: "for (let i = 0; i < 5; i++) {"
      const forMatch = line.match(/for\s*\(.*;\s*i\s*<\s*(\d+)\s*;.*\)\s*{/);
      if (forMatch) {
        const repeatCount = parseInt(forMatch[1], 10);
        console.log(`Found loop: repeat ${repeatCount} times`);

        // Find the matching closing brace
        let braceCount = 1;
        let j = i + 1;
        let loopBodyLines: string[] = [];

        while (j < lines.length && braceCount > 0) {
          const currentLine = lines[j];
          // Count braces in this line
          const openBraces = (currentLine.match(/{/g) || []).length;
          const closeBraces = (currentLine.match(/}/g) || []).length;
          braceCount += openBraces - closeBraces;

          if (braceCount > 0) {
            // Only add lines that are inside the loop body
            const cleanLine = currentLine.replace(/^[^{]*{/, '').trim();
            if (cleanLine && !cleanLine.includes('for') && !cleanLine.includes('}')) {
              loopBodyLines.push(cleanLine);
            }
          }
          j++;
        }

        // Expand the loop body N times
        for (let rep = 0; rep < repeatCount; rep++) {
          for (const bodyLine of loopBodyLines) {
            // Clean up any remaining braces
            const clean = bodyLine.replace(/[{}]/g, '').trim();
            if (clean) {
              result.push(clean);
            }
          }
        }

        i = j; // Skip past the loop
      } else {
        // Regular command - add it as-is
        // Skip lines that are just braces or for loop declarations
        if (!line.includes('for') && !line.includes('{') && !line.includes('}') && !line.includes('i++')) {
          result.push(line);
        }
        i++;
      }
    }

    return result;
  };

  // --- This function is called when you click "Run" in the Blockly workspace ---
  const handleRunCode = (code: string) => {
    console.log('Received code from Blockly:', code);

    // Expand the code into individual commands (handling loops)
    const expandedCommands = expandCommands(code);

    console.log('Expanded commands:', expandedCommands);

    if (expandedCommands.length === 0) {
      setCommands(['moveForward(1)']);
      return;
    }

    // If there are existing commands, append new ones (continue from current position)
    if (commands.length > 0 && !isFirstRun.current) {
      setCommands([...commands, ...expandedCommands]);
      console.log('Appending new commands to existing ones');
    } else {
      // First run or after reset - replace all commands
      setCommands(expandedCommands);
      isFirstRun.current = false;
    }
  };

  // --- Reset function ---
  const handleResetSimulation = () => {
    setCommands([]);
    isFirstRun.current = true;
    console.log('Simulation reset.');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🤖 Robot Blockly</h1>
        <p>Drag blocks from the toolbox to program your robot!</p>
        <p style={{ fontSize: '14px', color: '#666' }}>
          💡 Add blocks and click <strong>Run Simulation</strong> - the robot will continue from where it left off!
          <br />
          ✅ Loops are now supported - your robot will repeat commands!
        </p>
      </header>
      <main className="app-main">
        <div className="workspace-section">
          <BlocklyWorkspace onRunCode={handleRunCode} />
        </div>
        <div className="simulator-section">
          <Simulator commands={commands} onReset={handleResetSimulation} />
        </div>
      </main>
    </div>
  );
}

export default App;