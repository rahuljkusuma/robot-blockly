import React from 'react'
import './App.css'
import BlocklyWorkspace from './components/BlocklyWorkspace'
import Simulator from './components/Simulator'
import ErrorBoundary from './components/ErrorBoundary'
import type { SimulatorHandle } from './components/Simulator'
import type { BlocklyWorkspaceHandle } from './components/BlocklyWorkspace'

export default function App() {
  const simRef = React.useRef<SimulatorHandle | null>(null)
  const workspaceRef = React.useRef<BlocklyWorkspaceHandle | null>(null)
  const [codeText, setCodeText] = React.useState('')
  const [codeTab, setCodeTab] = React.useState<'javascript'|'python'|'cpp'>('javascript')

  return (
    <div style={{height:'100vh', display:'flex', flexDirection:'column', overflow:'hidden'}}>
      <header style={{padding:12, borderBottom:'1px solid #ddd'}}>
        <h2>Robot Blockly — Custom Blocks + Simulator</h2>
      </header>
      <main style={{flex:1, display:'flex', minWidth:0, overflow:'hidden'}}>
        <div style={{flex:1, minWidth:0}}>
          <ErrorBoundary>
            <BlocklyWorkspace ref={workspaceRef} onRun={(cmds)=>simRef.current?.runCommands(cmds)} onCodeChange={(c, t)=>{ setCodeText(c); setCodeTab(t) }} />
          </ErrorBoundary>
        </div>
        <aside style={{width:360, flex:'0 0 360px', minWidth:320, padding:12, borderLeft:'1px solid #ddd', display:'flex', flexDirection:'column', boxSizing:'border-box', overflow:'hidden'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
            <button onClick={() => workspaceRef.current?.runSimulation()} style={{width:'100%', padding:10, background:'#28a745', color:'white', border:'none', cursor:'pointer', borderRadius:4, fontWeight:'bold'}}>▶ Run Simulation</button>
          </div>
          <Simulator ref={simRef} />
          <div style={{marginTop:12}}>
            <div style={{display:'flex', gap:8, marginBottom:8}}>
              <button onClick={()=>setCodeTab('javascript')} style={{flex:1, padding:6, background: codeTab==='javascript'?'#007bff':'#eee', color: codeTab==='javascript'?'white':'black', border:'none', borderRadius:4}}>JS</button>
              <button onClick={()=>setCodeTab('python')} style={{flex:1, padding:6, background: codeTab==='python'?'#007bff':'#eee', color: codeTab==='python'?'white':'black', border:'none', borderRadius:4}}>Python</button>
              <button onClick={()=>setCodeTab('cpp')} style={{flex:1, padding:6, background: codeTab==='cpp'?'#007bff':'#eee', color: codeTab==='cpp'?'white':'black', border:'none', borderRadius:4}}>C++</button>
            </div>
            <pre style={{height:220, overflow:'auto', background:'#1e1e1e', color:'#d4d4d4', padding:12, borderRadius:4, margin:0, fontSize:11, lineHeight:1.4, fontFamily:'monospace'}}>{codeText || '// No code generated yet'}</pre>
          </div>
        </aside>
      </main>
    </div>
  )
}
