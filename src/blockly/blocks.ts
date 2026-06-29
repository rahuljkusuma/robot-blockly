import * as Blockly from 'blockly';

export const defineRobotBlocks = () => {
  // Clear any existing block definitions to prevent warnings
  const blockDefinitions = Blockly.Blocks as any;
  ['move_forward', 'turn_right', 'turn_left', 'repeat_loop', 'beep'].forEach(blockType => {
    if (blockDefinitions[blockType]) {
      delete blockDefinitions[blockType];
    }
  });

  Blockly.defineBlocksWithJsonArray([
    {
      type: 'move_forward',
      message0: 'Move forward %1 steps',
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
      message0: 'Turn right %1 degrees',
      args0: [
        {
          type: 'field_number',  // Changed from 'field_angle'
          name: 'DEGREES',
          value: 90,              // Default value
          min: 1,                 // Minimum degrees
          max: 360,               // Maximum degrees
          precision: 1,           // Allow whole numbers
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 230,
      tooltip: 'Turn the robot right by a specified number of degrees.',
      helpUrl: '',
    },
    {
      type: 'turn_left',
      message0: 'Turn left %1 degrees',
      args0: [
        {
          type: 'field_number',  // Changed from 'field_angle'
          name: 'DEGREES',
          value: 90,              // Default value
          min: 1,                 // Minimum degrees
          max: 360,               // Maximum degrees
          precision: 1,           // Allow whole numbers
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 230,
      tooltip: 'Turn the robot left by a specified number of degrees.',
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
          precision: 10,
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 330,
      tooltip: 'Make the robot beep for a duration in milliseconds.',
      helpUrl: '',
    },
  ]);
};