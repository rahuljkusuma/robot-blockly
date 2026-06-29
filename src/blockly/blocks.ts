import Blockly from 'blockly';

// Define custom robot blocks
export const defineRobotBlocks = () => {
  Blockly.defineBlocksWithJsonArray([
    {
      type: 'move_forward',
      message0: 'Move forward %1',
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
      tooltip: 'Move the robot forward a number of steps.',
      helpUrl: '',
    },
    {
      type: 'turn_right',
      message0: 'Turn right %1',
      args0: [
        {
          type: 'field_angle',
          name: 'DEGREES',
          angle: 90,
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 230,
      tooltip: 'Turn the robot right by a certain angle.',
      helpUrl: '',
    },
    {
      type: 'turn_left',
      message0: 'Turn left %1',
      args0: [
        {
          type: 'field_angle',
          name: 'DEGREES',
          angle: 90,
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 230,
      tooltip: 'Turn the robot left by a certain angle.',
      helpUrl: '',
    },
    {
      type: 'repeat_loop',
      message0: 'Repeat %1 times %2',
      args0: [
        {
          type: 'field_number',
          name: 'TIMES',
          value: 5,
          min: 1,
          max: 100,
        },
        {
          type: 'input_statement',
          name: 'DO',
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 120,
      tooltip: 'Repeat a set of commands a number of times.',
      helpUrl: '',
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
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 330,
      tooltip: 'Make the robot beep for a duration.',
      helpUrl: '',
    },
  ]);
};