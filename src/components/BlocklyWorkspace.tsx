import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import * as Blockly from 'blockly'
import { defineRobotBlocks } from '../blockly/blocks'
import { defineGenerators } from '../blockly/generators'
import { javascriptGenerator } from 'blockly/javascript'
import { pythonGenerator } from 'blockly/python'
import 'blockly/blocks'

type CodeTabs = 'javascript'|'python'|'cpp'

export interface BlocklyWorkspaceHandle {
  runSimulation: () => void
}

const BlocklyWorkspace = forwardRef<BlocklyWorkspaceHandle, { onRun?: (cmds:any[])=>void, onCodeChange?: (code:string, tab: CodeTabs)=>void }>(({ onRun, onCodeChange }, ref) => {
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [tab, setTab] = useState<CodeTabs>('javascript')
  const [code, setCode] = useState('')

  const resizeWorkspace = () => {
    if (!workspaceRef.current) return
    workspaceRef.current.resize()
    Blockly.svgResize(workspaceRef.current)
  }

  useEffect(() => {
    defineRobotBlocks()
    defineGenerators()
    if (!containerRef.current) return
    workspaceRef.current = Blockly.inject(containerRef.current, {
      scrollbars: true,
      trashcan: false,
      collapse: true
    })

    workspaceRef.current.addChangeListener(() => updateCode())
    resizeWorkspace()
    const handleResize = () => resizeWorkspace()
    window.addEventListener('resize', handleResize)

    const frame = window.requestAnimationFrame(() => resizeWorkspace())

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', handleResize)
      workspaceRef.current?.dispose()
    }
  }, [])

  useEffect(() => {
    updateCode()
  }, [tab])

  useImperativeHandle(ref, () => ({
    runSimulation: runInSimulator
  }), [onRun])

  function updateCode() {
    if (!workspaceRef.current) return
    if (tab === 'javascript') {
      const js = javascriptGenerator.workspaceToCode(workspaceRef.current)
      setCode(js)
      onCodeChange?.(js, 'javascript')
    } else if (tab === 'python') {
      const py = pythonGenerator.workspaceToCode(workspaceRef.current)
      setCode(py)
      onCodeChange?.(py, 'python')
    } else {
      const placeholder = '// C++ generator not available in this demo'
      setCode(placeholder)
      onCodeChange?.(placeholder, 'cpp')
    }
  }

  function runInSimulator() {
    if (!workspaceRef.current) return
    // translate blocks to simple command list for simulator
    const blocks = workspaceRef.current.getTopBlocks(true)
    const cmds: any[] = []
    function walk(block: Blockly.BlockSvg | null) {
      if (!block) return
      const t = block.type
      if (t === 'robot_move') cmds.push({type:'move', distance: Number(block.getFieldValue('DIST'))})
      if (t === 'robot_turn') cmds.push({type:'turn', angle: Number(block.getFieldValue('ANGLE')) * (block.getFieldValue('DIR')==='LEFT'?-1:1)})
      if (t === 'robot_wait') cmds.push({type:'wait', time: Number(block.getFieldValue('TIME'))})
      if (t === 'robot_repeat') {
        const times = Number(block.getFieldValue('TIMES'))
        const stack = block.getInputTargetBlock('DO')
        for (let i=0;i<times;i++) { walk(stack); }
      }
      walk(block.getNextBlock())
    }
    blocks.forEach(b=>walk(b))
    if (onRun) onRun(cmds)
  }

  function addBlockToWorkspace(type: string) {
    if (!workspaceRef.current) return

    const block = workspaceRef.current.newBlock(type)
    const blockCount = workspaceRef.current.getAllBlocks(false).length
    const x = 20 + (blockCount % 4) * 24
    const y = 20 + Math.floor(blockCount / 4) * 80

    block.initSvg()
    block.render()
    block.moveBy(x, y)

    if (type === 'robot_move') {
      block.setFieldValue(20, 'DIST')
    }
    if (type === 'robot_turn') {
      block.setFieldValue(90, 'ANGLE')
      block.setFieldValue('LEFT', 'DIR')
    }
    if (type === 'robot_wait') {
      block.setFieldValue(500, 'TIME')
    }
    if (type === 'robot_repeat') {
      block.setFieldValue(2, 'TIMES')
    }

    resizeWorkspace()
    return block
  }

  return (
    <div style={{display:'flex',height:'100%', overflow:'hidden'}}>
      <div style={{width:320, borderRight:'1px solid #ddd', display:'flex', flexDirection:'column', background:'white', padding:10, boxSizing:'border-box', gap:8}}>
        <h4 style={{margin:'0 0 8px 0'}}>Blocks Toolbox</h4>
        <div style={{padding:8, background:'#6c757d', color:'white', borderRadius:4, textAlign:'center', fontSize:'12px'}}>📋 Load Demo Blocks</div>
        <div style={{display:'flex', flexDirection:'column', gap:6, marginTop:4}}>
          <button type="button" onClick={() => addBlockToWorkspace('robot_move')} style={{padding:8, textAlign:'left', border:'1px solid #ddd', background:'#fff', cursor:'pointer', borderRadius:4}}>Move Forward</button>
          <button type="button" onClick={() => addBlockToWorkspace('robot_turn')} style={{padding:8, textAlign:'left', border:'1px solid #ddd', background:'#fff', cursor:'pointer', borderRadius:4}}>Turn</button>
          <button type="button" onClick={() => addBlockToWorkspace('robot_wait')} style={{padding:8, textAlign:'left', border:'1px solid #ddd', background:'#fff', cursor:'pointer', borderRadius:4}}>Wait</button>
          <button type="button" onClick={() => addBlockToWorkspace('robot_repeat')} style={{padding:8, textAlign:'left', border:'1px solid #ddd', background:'#fff', cursor:'pointer', borderRadius:4}}>Repeat</button>
        </div>
      </div>
      <div style={{flex:1, display:'flex', flexDirection:'column', background:'#fafafa', minWidth:0, overflow:'hidden', position:'relative'}}>
        <div ref={containerRef} style={{flex:1, width:'100%', minHeight:0, position:'relative', background:'#fff', border:'1px solid #eee', minHeight:420}} />
      </div>
    </div>
  )
})

export default BlocklyWorkspace
