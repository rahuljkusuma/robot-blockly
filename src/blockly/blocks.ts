import * as Blockly from 'blockly'

export function defineRobotBlocks() {
  if ((window as any).__robotBlocklyBlocksRegistered) {
    return
  }
  Blockly.defineBlocksWithJsonArray([
    {
      "type": "robot_move",
      "message0": "move forward %1 cm",
      "args0": [
        {
          "type": "field_number",
          "name": "DIST",
          "value": 10,
          "min": 0
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 160,
      "tooltip": "Move the robot forward",
      "helpUrl": ""
    },
    {
      "type": "robot_turn",
      "message0": "turn %1 %2 degrees",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "DIR",
          "options": [["left","LEFT"],["right","RIGHT"]]
        },
        {
          "type": "field_number",
          "name": "ANGLE",
          "value": 90,
          "min": 0,
          "max": 360
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 230,
      "tooltip": "Turn the robot",
      "helpUrl": ""
    },
    {
      "type": "robot_wait",
      "message0": "wait %1 ms",
      "args0": [
        {
          "type": "field_number",
          "name": "TIME",
          "value": 500,
          "min": 0
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 120,
      "tooltip": "Pause",
      "helpUrl": ""
    },
    {
      "type": "robot_repeat",
      "message0": "repeat %1 times %2 do %3",
      "args0": [
        {
          "type": "field_number",
          "name": "TIMES",
          "value": 2,
          "min": 1
        },
        {
          "type": "input_dummy"
        },
        {
          "type": "input_statement",
          "name": "DO"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 260,
      "tooltip": "Repeat a block sequence",
      "helpUrl": ""
    }
  ])
  ;(window as any).__robotBlocklyBlocksRegistered = true
}
