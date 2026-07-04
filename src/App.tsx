import React, { useState, useRef } from 'react';
import BlocklyWorkspace from './components/BlocklyWorkspace';
import Simulator from './components/Simulator';
import CodeViewer from './components/CodeViewer';
import './App.css';

function App() {
  const [commands, setCommands] = useState<string[]>([]);
  const isFirstRun = useRef<boolean>(true);

  // Helper function to expand loops
  const expandCommands = (code: string): string[] => {
    const lines = code.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const result: string[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const forMatch = line.match(/for\s*\(.*;\s*i\s*<\s*(\d+)\s*;.*\)\s*{/);
      if (forMatch) {
        const repeatCount = parseInt(forMatch[1], 10);
        let braceCount = 1;
        let j = i + 1;
        let loopBodyLines: string[] = [];

        while (j < lines.length && braceCount > 0) {
          const currentLine = lines[j];
          const openBraces = (currentLine.match(/{/g) || []).length;
          const closeBraces = (currentLine.match(/}/g) || []).length;
          braceCount += openBraces - closeBraces;

          if (braceCount > 0) {
            const cleanLine = currentLine.replace(/^[^{]*{/, '').trim();
            if (cleanLine && !cleanLine.includes('for') && !cleanLine.includes('}')) {
              loopBodyLines.push(cleanLine);
            }
          }
          j++;
        }

        for (let rep = 0; rep < repeatCount; rep++) {
          for (const bodyLine of loopBodyLines) {
            const clean = bodyLine.replace(/[{}]/g, '').trim();
            if (clean) {
              result.push(clean);
            }
          }
        }
        i = j;
      } else {
        if (!line.includes('for') && !line.includes('{') && !line.includes('}') && !line.includes('i++')) {
          result.push(line);
        }
        i++;
      }
    }

    return result;
  };

  const handleRunCode = (code: string) => {
    console.log('Received code from Blockly:', code);
    const expandedCommands = expandCommands(code);
    console.log('Expanded commands:', expandedCommands);

    if (expandedCommands.length === 0) {
      setCommands(['moveForward(1)']);
      return;
    }

    if (commands.length > 0 && !isFirstRun.current) {
      setCommands([...commands, ...expandedCommands]);
      console.log('Appending new commands to existing ones');
    } else {
      setCommands(expandedCommands);
      isFirstRun.current = false;
    }
  };

  const handleResetSimulation = () => {
    setCommands([]);
    isFirstRun.current = true;
    console.log('Simulation reset.');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🤖 Robot Blockly</h1>
        <p className="app-subtitle">Drag blocks → Run simulation → View code</p>
      </header>
      <main className="app-main">
        {/* Column 1: Blockly Workspace */}
        <div className="workspace-column">
          <BlocklyWorkspace onRunCode={handleRunCode} />
        </div>

        {/* Column 2: Simulator */}
        <div className="simulator-column">
          <Simulator commands={commands} onReset={handleResetSimulation} />
        </div>

        {/* Column 3: Code Viewer */}
        <div className="code-column">
          <CodeViewer commands={commands} />
        </div>
      </main>
    </div>
  );
}

export default App;