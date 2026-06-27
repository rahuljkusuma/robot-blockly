import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'

type Cmd = { type: string; distance?: number; angle?: number; time?: number }

export interface SimulatorHandle {
  runCommands: (cmds: Cmd[]) => void
  reset: () => void
}

const Simulator = forwardRef<SimulatorHandle>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const robot = useRef({ x: 150, y: 150, a: 0 })
  const anim = useRef<number | null>(null)

  useImperativeHandle(ref, () => ({
    runCommands(cmds: Cmd[]) {
      runSequence(cmds)
    },
    reset() {
      robot.current = { x: 150, y: 150, a: 0 }
      draw()
    }
  }))

  useEffect(() => {
    draw()
    return () => { if (anim.current) cancelAnimationFrame(anim.current) }
  }, [])

  function draw() {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')!
    ctx.clearRect(0,0,c.width,c.height)
    // draw robot
    ctx.save()
    ctx.translate(robot.current.x, robot.current.y)
    ctx.rotate(robot.current.a)
    ctx.fillStyle = 'orange'
    ctx.fillRect(-10,-8,20,16)
    ctx.fillStyle = 'black'
    ctx.fillRect(6,-4,6,8)
    ctx.restore()
  }

  function runSequence(cmds: Cmd[]) {
    let i = 0
    let subIndex = 0

    function next() {
      if (i >= cmds.length) return
      const cmd = cmds[i]
      if (cmd.type === 'move') {
        animateMove(cmd.distance || 0, () => { i++; next() })
      } else if (cmd.type === 'turn') {
        animateTurn((cmd.angle || 0) * (Math.PI/180), () => { i++; next() })
      } else if (cmd.type === 'wait') {
        setTimeout(() => { i++; next() }, cmd.time || 0)
      } else {
        i++; next()
      }
    }
    next()
  }

  function animateMove(dist: number, cb: () => void) {
    const steps = Math.max(8, Math.abs(dist) / 2)
    let step = 0
    const dx = Math.cos(robot.current.a) * (dist / steps)
    const dy = Math.sin(robot.current.a) * (dist / steps)
    function frame() {
      robot.current.x += dx
      robot.current.y += dy
      draw()
      step++
      if (step < steps) anim.current = requestAnimationFrame(frame)
      else cb()
    }
    frame()
  }

  function animateTurn(angle: number, cb: () => void) {
    const steps = 12
    let step = 0
    const da = angle / steps
    function frame() {
      robot.current.a += da
      draw()
      step++
      if (step < steps) anim.current = requestAnimationFrame(frame)
      else cb()
    }
    frame()
  }

  return (
    <div style={{border:'1px solid #ccc', padding:8, display:'flex', flexDirection:'column', gap:8}}>
      <canvas ref={canvasRef} width={300} height={300} style={{background:'#f7f7f7'}} />
      <button onClick={() => { robot.current = { x: 150, y: 150, a: 0 }; draw() }} style={{padding:8, background:'#dc3545', color:'white', border:'none', cursor:'pointer', borderRadius:4}}>Reset Robot</button>
    </div>
  )
})

export default Simulator
