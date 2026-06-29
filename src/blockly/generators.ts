import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Remove this line if it causes errors:
// import { pythonGenerator } from 'blockly/python';

// Instead, create a simple Python generator manually:
export const pythonGenerator = new Blockly.Generator('Python');

// Add your Python generator functions here
pythonGenerator.addStatement('move_forward', function (block) {
  const steps = block.getFieldValue('STEPS');
  return `move_forward(${steps})\n`;
});
pythonGenerator.addStatement('turn_right', function (block) {
  const degrees = block.getFieldValue('DEGREES');
  return `turn_right(${degrees})\n`;
});
pythonGenerator.addStatement('turn_left', function (block) {
  const degrees = block.getFieldValue('DEGREES');
  return `turn_left(${degrees})\n`;
});
pythonGenerator.addStatement('repeat_loop', function (block) {
  const times = block.getFieldValue('TIMES');
  const branch = pythonGenerator.statementToCode(block, 'DO');
  return `for i in range(${times}):\n${branch}`;
});
pythonGenerator.addStatement('beep', function (block) {
  const duration = block.getFieldValue('DURATION');
  return `beep(${duration})\n`;
});

// C++ Generator
export const cppGenerator = new Blockly.Generator('C++');
// ... (rest of your C++ generator code)

// JavaScript Generator
javascriptGenerator.forBlock['turn_right'] = function(block: any) {
  const degrees = block.getFieldValue('DEGREES');
  return `turnRight(${degrees});\n`;
};

javascriptGenerator.forBlock['turn_left'] = function(block: any) {
  const degrees = block.getFieldValue('DEGREES');
  return `turnLeft(${degrees});\n`;
};

// Python Generator (if you have it)
pythonGenerator.forBlock['turn_right'] = function(block: any) {
  const degrees = block.getFieldValue('DEGREES');
  return `turn_right(${degrees})\n`;
};

pythonGenerator.forBlock['turn_left'] = function(block: any) {
  const degrees = block.getFieldValue('DEGREES');
  return `turn_left(${degrees})\n`;
};

// C++ Generator (if you have it)
cppGenerator.forBlock['turn_right'] = function(block: any) {
  const degrees = block.getFieldValue('DEGREES');
  return `turnRight(${degrees});\n`;
};

cppGenerator.forBlock['turn_left'] = function(block: any) {
  const degrees = block.getFieldValue('DEGREES');
  return `turnLeft(${degrees});\n`;
};