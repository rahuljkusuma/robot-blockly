import React, { useState } from 'react';

interface CodeViewerProps {
  commands: string[];
}

const CodeViewer: React.FC<CodeViewerProps> = ({ commands }) => {
  const [activeLanguage, setActiveLanguage] = useState<'javascript' | 'python' | 'cpp'>('javascript');

  // --- Generate JavaScript Code ---
  const generateJavaScriptCode = (): string => {
    const functionDefs = `
// Robot Control Functions
function moveForward(steps) {
    console.log(\`Moving forward \${steps} steps\`);
}

function moveBackward(steps) {
    console.log(\`Moving backward \${steps} steps\`);
}

function turnRight(degrees) {
    console.log(\`Turning right \${degrees} degrees\`);
}

function turnLeft(degrees) {
    console.log(\`Turning left \${degrees} degrees\`);
}

function wait(seconds) {
    console.log(\`Waiting \${seconds} seconds\`);
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

function beep(duration) {
    console.log(\`Beeping for \${duration}ms\`);
}
`;

    const commandCode = commands.length > 0 
      ? commands.join('\n    ')
      : '// No commands to execute';

    return `// 🤖 Robot Control Program
${functionDefs}

// MAIN PROGRAM
async function main() {
    console.log('🚀 Starting robot program...');
    ${commandCode}
    console.log('✅ Program completed!');
}

main().catch(console.error);`;
  };

  // --- Generate Python Code ---
  const generatePythonCode = (): string => {
    return `# 🤖 Robot Control Program - Python
import time
import math

class Robot:
    def __init__(self):
        self.x = 0
        self.y = 0
        self.angle = 0
        print("🤖 Robot initialized")
    
    def move_forward(self, steps):
        print(f"Moving forward {steps} steps")
        self.x += math.cos(self.angle) * steps * 50
        self.y += math.sin(self.angle) * steps * 50
    
    def move_backward(self, steps):
        print(f"Moving backward {steps} steps")
        self.x -= math.cos(self.angle) * steps * 50
        self.y -= math.sin(self.angle) * steps * 50
    
    def turn_right(self, degrees):
        print(f"Turning right {degrees} degrees")
        self.angle += math.radians(degrees)
    
    def turn_left(self, degrees):
        print(f"Turning left {degrees} degrees")
        self.angle -= math.radians(degrees)
    
    def wait(self, seconds):
        print(f"Waiting {seconds} seconds...")
        time.sleep(seconds)
    
    def beep(self, duration):
        print(f"Beeping for {duration}ms")

# MAIN PROGRAM
def main():
    print("🚀 Starting robot program...")
    robot = Robot()
${commands.length > 0 ? commands.map(cmd => `    ${cmd}`).join('\n') : '    # No commands to execute'}
    print("✅ Program completed!")

if __name__ == "__main__":
    main()`;
  };

  // --- Generate C++ Code ---
  const generateCppCode = (): string => {
    return `// 🤖 Robot Control Program - C++
#include <iostream>
#include <cmath>
#include <thread>
#include <chrono>

using namespace std;

class Robot {
private:
    double x = 0, y = 0, angle = 0;

public:
    void moveForward(int steps) {
        cout << "Moving forward " << steps << " steps" << endl;
        x += cos(angle) * steps * 50;
        y += sin(angle) * steps * 50;
    }
    void moveBackward(int steps) {
        cout << "Moving backward " << steps << " steps" << endl;
        x -= cos(angle) * steps * 50;
        y -= sin(angle) * steps * 50;
    }
    void turnRight(int degrees) {
        cout << "Turning right " << degrees << " degrees" << endl;
        angle += degrees * M_PI / 180.0;
    }
    void turnLeft(int degrees) {
        cout << "Turning left " << degrees << " degrees" << endl;
        angle -= degrees * M_PI / 180.0;
    }
    void wait(double seconds) {
        cout << "Waiting " << seconds << " seconds..." << endl;
        this_thread::sleep_for(chrono::milliseconds((int)(seconds * 1000)));
    }
    void beep(int duration) {
        cout << "Beeping for " << duration << "ms" << endl;
    }
};

int main() {
    cout << "🚀 Starting robot program..." << endl;
    Robot robot;
${commands.length > 0 ? commands.map(cmd => {
  let cppCmd = cmd
    .replace(/moveForward\((\d+)\)/, '    robot.moveForward($1);')
    .replace(/moveBackward\((\d+)\)/, '    robot.moveBackward($1);')
    .replace(/turnRight\((\d+)\)/, '    robot.turnRight($1);')
    .replace(/turnLeft\((\d+)\)/, '    robot.turnLeft($1);')
    .replace(/wait\(([\d.]+)\)/, '    robot.wait($1);')
    .replace(/beep\((\d+)\)/, '    robot.beep($1);');
  return cppCmd;
}).join('\n') : '    // No commands to execute'}
    cout << "✅ Program completed!" << endl;
    return 0;
}`;
  };

  const getCode = (): string => {
    switch (activeLanguage) {
      case 'javascript': return generateJavaScriptCode();
      case 'python': return generatePythonCode();
      case 'cpp': return generateCppCode();
      default: return '';
    }
  };

  const getLanguageLabel = (lang: string): string => {
    const labels: Record<string, string> = {
      javascript: 'JavaScript',
      python: 'Python',
      cpp: 'C++'
    };
    return labels[lang] || lang;
  };

  const getLanguageColor = (lang: string): string => {
    const colors: Record<string, string> = {
      javascript: '#f7df1e',
      python: '#3776ab',
      cpp: '#00599c'
    };
    return colors[lang] || '#666';
  };

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      overflow: 'hidden',
      background: '#1e1e1e',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header - Compact */}
      <div style={{
        padding: '6px 12px',
        background: '#2d2d2d',
        borderBottom: '1px solid #444',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
        minHeight: '36px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '13px' }}>
            📄 Code Viewer
          </span>
          <span style={{
            fontSize: '11px',
            color: '#aaa',
            background: '#3d3d3d',
            padding: '1px 8px',
            borderRadius: '10px',
          }}>
            {commands.length} cmd{commands.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '3px' }}>
          {(['javascript', 'python', 'cpp'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLanguage(lang)}
              style={{
                padding: '2px 10px',
                background: activeLanguage === lang ? '#3d3d3d' : 'transparent',
                color: activeLanguage === lang ? '#fff' : '#aaa',
                border: activeLanguage === lang ? `2px solid ${getLanguageColor(lang)}` : '2px solid transparent',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: activeLanguage === lang ? 'bold' : 'normal',
                transition: 'all 0.2s',
              }}
            >
              {getLanguageLabel(lang)}
            </button>
          ))}
        </div>
      </div>

      {/* Code Content - Scrollable */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '10px 14px',
      }}>
        <pre style={{
          margin: 0,
          fontFamily: '"Consolas", "Monaco", "Courier New", monospace',
          fontSize: '12px',
          lineHeight: '1.5',
          color: '#d4d4d4',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          <code>{getCode()}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeViewer;