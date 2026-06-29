import React, { useState } from 'react';
import BlocklyWorkspace from './components/BlocklyWorkspace';
import Simulator from './components/Simulator';
import './App.css';

function App() {
  const [commands, setCommands] = useState<string[]>([]);

  // This function is called when you click "Run" in the Blockly workspace
  const handleRunCode = (code: string) => {
    console.log('Received code from Blockly:', code);

    // Parse the generated JavaScript code into individual commands
    const commandLines = code
      .split('\n')
      .map(line => line.trim())
      .filter(line =>
        line.length > 0 &&
        !line.startsWith('//') &&
        !line.startsWith('function') &&
        !line.includes('{') &&
        !line.includes('}') &&
        !line.includes('console.log')
      );

    console.log('Parsed commands for simulator:', commandLines);

    if (commandLines.length === 0) {
      // Add a default command if none found, so the user gets feedback
      setCommands(['moveForward(1)']);
    } else {
      setCommands(commandLines);
    }
  };

  // This function is called when the "Reset" button is clicked in the simulator
  const handleResetSimulation = () => {
    setCommands([]); // Clear the commands, which stops the simulation
    console.log('Simulation reset.');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🤖 Robot Blockly</h1>
        <p>Drag blocks from the toolbox to program your robot!</p>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Use the toolbox on the left to add blocks, then click <strong>Run</strong> in the workspace.
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