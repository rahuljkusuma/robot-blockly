// VITE_REFRESH: update generator definitions to avoid stale code
import * as Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'
import { pythonGenerator } from 'blockly/python'

export function defineGenerators() {
  if ((window as any).__robotBlocklyGeneratorsRegistered) {
    return
  }

  // JavaScript generators
  javascriptGenerator.forBlock['robot_move'] = function(block: any) {
    const dist = Number(block.getFieldValue('DIST')) || 0
    return `robot.move(${dist});\n`
  }

  javascriptGenerator.forBlock['robot_turn'] = function(block: any) {
    const dir = block.getFieldValue('DIR')
    const angle = Number(block.getFieldValue('ANGLE')) || 0
    const signed = dir === 'LEFT' ? -angle : angle
    return `robot.turn(${signed});\n`
  }

  javascriptGenerator.forBlock['robot_wait'] = function(block: any) {
    const t = Number(block.getFieldValue('TIME')) || 0
    return `await robot.wait(${t});\n`
  }

  javascriptGenerator.forBlock['robot_repeat'] = function(block: any) {
    const times = Number(block.getFieldValue('TIMES')) || 0
    const branch = javascriptGenerator.statementToCode(block, 'DO')
    return `for(let i=0;i<${times};i++){\n${branch}}\n`
  }

  // Python generators
  pythonGenerator.forBlock['robot_move'] = function(block: any) {
    const dist = Number(block.getFieldValue('DIST')) || 0
    return `robot.move(${dist})\n`
  }

  pythonGenerator.forBlock['robot_turn'] = function(block: any) {
    const dir = block.getFieldValue('DIR')
    const angle = Number(block.getFieldValue('ANGLE')) || 0
    const signed = dir === 'LEFT' ? -angle : angle
    return `robot.turn(${signed})\n`
  }

  pythonGenerator.forBlock['robot_wait'] = function(block: any) {
    const t = Number(block.getFieldValue('TIME')) || 0
    return `robot.wait(${t})\n`
  }

  pythonGenerator.forBlock['robot_repeat'] = function(block: any) {
    const times = Number(block.getFieldValue('TIMES')) || 0
    const branch = pythonGenerator.statementToCode(block, 'DO')
    return `for _ in range(${times}):\n${Blockly.utils.string.indent(branch, Blockly.Python.INDENT)}\n`
  }

  ;(window as any).__robotBlocklyGeneratorsRegistered = true
}
