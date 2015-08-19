/**
  * Copyright (C) 2014 Roberto Previtera
  *
  * This program is free software: you can redistribute it and/or modify
  * it under the terms of the GNU General Public License as published by
  * the Free Software Foundation, either version 3 of the License.
  *
  * This program is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  * GNU General Public License for more details.
  *
  * You should have received a copy of the GNU General Public License
  * along with this program.  If not, see <http://www.gnu.org/licenses/>.
  */

'use strict';

Blockly.HSV_SATURATION=.99;
Blockly.HSV_VALUE=.99;

// Extensions to Blockly's language and JavaScript generator.

Blockly.Blocks['coderbot_repeat'] = {
  /**
   * Block for repeat n times (internal number).
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.CONTROLS_REPEAT_HELPURL);
    this.setColour(120);
    var di = this.appendDummyInput();
    if(CODERBOT_PROG_LEVEL.indexOf("basic")>=0) {
    	di.appendField(new Blockly.FieldImage('/images/blocks/loop_repeat.png', 32, 32, '*'));
    } else {
        di.appendField(Blockly.Msg.CONTROLS_REPEAT_TITLE_REPEAT)
    }		
    di.appendField(new Blockly.FieldTextInput('10',
            Blockly.FieldTextInput.nonnegativeIntegerValidator), 'TIMES');
    if(CODERBOT_PROG_LEVEL.indexOf("basic")<0) {
        di.appendField(Blockly.Msg.CONTROLS_REPEAT_TITLE_TIMES);
    }
    var si = this.appendStatementInput('DO');
    if(CODERBOT_PROG_LEVEL.indexOf("basic")<0) {
    	si.appendField(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
    }
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.CONTROLS_REPEAT_TOOLTIP);
  }
};

Blockly.JavaScript['coderbot_repeat'] = function(block) {
  // Repeat n times (internal number).
  var repeats = Number(block.getFieldValue('TIMES'));
  var branch = Blockly.JavaScript.statementToCode(block, 'DO');
  branch = Blockly.JavaScript.addLoopTrap(branch, block.id);
  var loopVar = Blockly.JavaScript.variableDB_.getDistinctName(
      'count', Blockly.Variables.NAME_TYPE);
  var code = 'for (var ' + loopVar + ' = 0; ' +
      loopVar + ' < ' + repeats + '; ' +
      loopVar + '++) {\n' +
      branch + '}\n';
  return code;
};

Blockly.Python['coderbot_repeat'] = function(block) {
  // Repeat n times (internal number).
  var repeats = parseInt(block.getFieldValue('TIMES'), 10);
  var branch = Blockly.Python.statementToCode(block, 'DO');
  branch = Blockly.Python.addLoopTrap(branch, block.id) ||
      Blockly.Python.LOOP_PASS;
  var loopVar = Blockly.Python.variableDB_.getDistinctName(
      'count', Blockly.Variables.NAME_TYPE);
  var code = 'for ' + loopVar + ' in range(' + repeats + '):\n' + branch;
  return code;
};

Blockly.Python['text_print'] = function(block) {
  // Print statement.
  var argument0 = Blockly.Python.valueToCode(block, 'TEXT',
      Blockly.Python.ORDER_NONE) || '\'\'';
  return 'get_cam().set_text(' + argument0 + ')\n';
};


Blockly.Blocks['coderbot_moveForward'] = {
  // Block for moving forward.
  init: function() {
    this.setHelpUrl('http://code.google.com/p/blockly/wiki/Move');
    this.setColour(40);
    var di = this.appendDummyInput()
    if(CODERBOT_PROG_LEVEL.indexOf("basic")>=0) {
        di.appendField(new Blockly.FieldImage('/images/blocks/move_forward.png', 32, 32, '*'));
    } else {
        di.appendField(Blockly.Msg.CODERBOT_MOVE_FORWARD)
    }
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('CoderBot_moveForwardTooltip');
  }
};


Blockly.JavaScript['coderbot_moveForward'] = function(block) {
  // Generate JavaScript for moving forward.
  return 'get_bot().forward(' + CODERBOT_MOV_FW_DEF_SPEED + ', ' + CODERBOT_MOV_FW_DEF_ELAPSE + ');\n';
};

Blockly.Python['coderbot_moveForward'] = function(block) {
  // Generate Python for moving forward.
  if(CODERBOT_PROG_MOVE_MOTION) {
    return 'get_motion().move(dist=' + CODERBOT_MOV_FW_DEF_ELAPSE + ')\n';

  } else {
    return 'get_bot().forward(speed=' + CODERBOT_MOV_FW_DEF_SPEED + ', elapse=' + CODERBOT_MOV_FW_DEF_ELAPSE + ')\n';
  }
};

Blockly.Blocks['coderbot_moveBackward'] = {
  // Block for moving forward.
  init: function() {
    this.setHelpUrl('http://code.google.com/p/blockly/wiki/Move');
    this.setColour(40);
    var di = this.appendDummyInput()
    if(CODERBOT_PROG_LEVEL.indexOf("basic")>=0) {
        di.appendField(new Blockly.FieldImage('/images/blocks/move_backward.png', 32, 32, '*'));
    } else {
        di.appendField(Blockly.Msg.CODERBOT_MOVE_BACKWARD)
    }
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('CoderBot_moveBackwardTooltip');
  }
};

Blockly.JavaScript['coderbot_moveBackward'] = function(block) {
  // Generate JavaScript for moving forward.
  return 'get_bot().backward(' + CODERBOT_MOV_FW_DEF_SPEED + ', ' + CODERBOT_MOV_FW_DEF_ELAPSE + ');\n';
};

Blockly.Python['coderbot_moveBackward'] = function(block) {
  // Generate Python for moving forward.
  if(CODERBOT_PROG_MOVE_MOTION) {    
    return 'get_motion().move(dist=' + (-CODERBOT_MOV_FW_DEF_ELAPSE) + ')\n';
    
  } else {
    return 'get_bot().backward(speed=' + CODERBOT_MOV_FW_DEF_SPEED + ', elapse=' + CODERBOT_MOV_FW_DEF_ELAPSE + ')\n';
  }
};

Blockly.Blocks['coderbot_turnLeft'] = {
  // Block for turning left.
  init: function() {
    this.setHelpUrl('http://code.google.com/p/blockly/wiki/Turn');
    this.setColour(40);
    var di = this.appendDummyInput()
    if(CODERBOT_PROG_LEVEL.indexOf("basic")>=0) {
        di.appendField(new Blockly.FieldImage('/images/blocks/move_left.png', 32, 32, '*'));
    } else {
        di.appendField(Blockly.Msg.CODERBOT_MOVE_LEFT);
    }
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(('CoderBot_turnTooltip'));
  }
};

Blockly.JavaScript['coderbot_turnLeft'] = function(block) {
  // Generate JavaScript for turning left.
  return 'get_bot().left(' + CODERBOT_MOV_TR_DEF_SPEED + ', ' + CODERBOT_MOV_TR_DEF_ELAPSE + ');\n';
};

Blockly.Python['coderbot_turnLeft'] = function(block) {
  // Generate Python for turning left.
  if(CODERBOT_PROG_MOVE_MOTION) {
    return 'get_motion().turn(angle=' + (-CODERBOT_MOV_TR_DEF_ELAPSE) + ')\n';

  } else {
    return 'get_bot().left(speed=' + CODERBOT_MOV_TR_DEF_SPEED + ', elapse=' + CODERBOT_MOV_TR_DEF_ELAPSE + ')\n';
  }
};

Blockly.Blocks['coderbot_turnRight'] = {
  // Block for turning right.
  init: function() {
    this.setHelpUrl('http://code.google.com/p/blockly/wiki/Turn');
    this.setColour(40);
    var di = this.appendDummyInput()
    if(CODERBOT_PROG_LEVEL.indexOf("basic")>=0) {
        di.appendField(new Blockly.FieldImage('/images/blocks/move_right.png', 32, 32, '*'));
    } else {
        di.appendField(Blockly.Msg.CODERBOT_MOVE_RIGHT)
    }
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(('CoderBot_turnTooltip'));
  }
};

Blockly.JavaScript['coderbot_turnRight'] = function(block) {
  // Generate JavaScript for turning left or right.
  return 'get_bot().right(' + CODERBOT_MOV_TR_DEF_SPEED + ', ' + CODERBOT_MOV_TR_DEF_ELAPSE + ');\n';
};

Blockly.Python['coderbot_turnRight'] = function(block) {
  // Generate Python for turning left or right.
  if(CODERBOT_PROG_MOVE_MOTION) {
    return 'get_motion().turn(angle=' + CODERBOT_MOV_TR_DEF_ELAPSE + ')\n';

  } else {
    return 'get_bot().right(speed=' + CODERBOT_MOV_TR_DEF_SPEED + ', elapse=' + CODERBOT_MOV_TR_DEF_ELAPSE + ')\n';
  } 
};

Blockly.Blocks['coderbot_say'] = {
  // Block for text to speech.
  init: function() {
    this.setHelpUrl('http://code.google.com/p/blockly/wiki/Say');
    this.setColour(290);
    var vi = this.appendValueInput('TEXT');
    vi.setCheck(["String", "Number", "Date"]);
    if(CODERBOT_PROG_LEVEL.indexOf("basic")>=0) {
        vi.appendField(new Blockly.FieldImage('/images/blocks/say.png', 32, 32, '*'));
    } else {
    	vi.appendField(Blockly.Msg.CODERBOT_SAY);
    }
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(('CoderBot_sayTooltip'));
  }
};

Blockly.JavaScript['coderbot_say'] = function(block) {
  // Generate JavaScript for turning left or right.
  var text = Blockly.JavaScript.valueToCode(block, 'TEXT',
      Blockly.JavaScript.ORDER_NONE) || '\'\'';
  return 'get_bot().say(' + text + ');\n';
};

Blockly.Python['coderbot_say'] = function(block) {
  // Generate Python for turning left or right.
  var text = Blockly.Python.valueToCode(block, 'TEXT',
      Blockly.Python.ORDER_NONE) || '\'\'';
  return 'get_bot().say(' + text + ')\n';
};

Blockly.Blocks['coderbot_sleep'] = {
  // Block for text to sleep.
  init: function() {
    this.setHelpUrl('http://code.google.com/p/blockly/wiki/Sleep');
    this.setColour(290);
    this.appendValueInput('ELAPSE')
        .setCheck(["Number"])
        .appendField(Blockly.Msg.CODERBOT_SLEEP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(('CoderBot_sleepTooltip'));
  }
};

Blockly.JavaScript['coderbot_sleep'] = function(block) {
  // Generate JavaScript for sleeping.
  var elapse = Blockly.JavaScript.valueToCode(block, 'ELAPSE',
      Blockly.JavaScript.ORDER_NONE) || '\'\'';
  return 'get_cam().sleep(' + elapse + ');\n';
};

Blockly.Python['coderbot_sleep'] = function(block) {
  // Generate Python for sleeping.
  var elapse = Blockly.Python.valueToCode(block, 'ELAPSE',
      Blockly.Python.ORDER_NONE) || '\'\'';
  return 'get_cam().sleep(' + elapse + ')\n';
};

Blockly.Blocks['coderbot_adv_move'] = {
  // Block for moving forward.
  init: function() {
    var ACTIONS =
        [[Blockly.Msg.CODERBOT_MOVE_ADV_TIP_FORWARD, 'FORWARD'],
        [Blockly.Msg.CODERBOT_MOVE_ADV_TIP_BACKWARD, 'BACKWARD'],
        [Blockly.Msg.CODERBOT_MOVE_ADV_TIP_LEFT, 'LEFT'],
        [Blockly.Msg.CODERBOT_MOVE_ADV_TIP_RIGHT, 'RIGHT']]
    this.setHelpUrl('http://code.google.com/p/blockly/wiki/Move');
    this.setColour(40);
    this.interpolateMsg(Blockly.Msg.CODERBOT_MOVE_ADV_MOVE,
                        ['TEXT', null, Blockly.ALIGN_RIGHT],
                        Blockly.ALIGN_RIGHT);
    
    this.appendDummyInput("ACTION")
       .appendField(new Blockly.FieldDropdown(ACTIONS), 'ACTION');
    this.appendValueInput('SPEED')
        .setCheck('Number')
        .appendField(Blockly.Msg.CODERBOT_MOVE_ADV_SPEED);
    this.appendValueInput('ELAPSE')
        .setCheck('Number')
        .appendField(Blockly.Msg.CODERBOT_MOVE_ADV_ELAPSE);
    this.setInputsInline(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var mode = thisBlock.getFieldValue('ACTION');
      var TOOLTIPS = {
        FORWARD: Blockly.Msg.CODERBOT_MOVE_ADV_TIP_FORWARD,
        BACKWARD: Blockly.Msg.CODERBOT_MOVE_ADV_TIP_BACKWARD,
        LEFT: Blockly.Msg.CODERBOT_MOVE_ADV_TIP_LEFT,
        RIGHT: Blockly.Msg.CODERBOT_MOVE_ADV_TIP_RIGHT,
      };
      return TOOLTIPS[mode] + Blockly.Msg.CODERBOT_MOVE_ADV_TIP_TAIL;
    });
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['coderbot_adv_move'] = function(block) {
  // Generate JavaScript for moving forward.
  return 'get_bot().forward();\n';
};

Blockly.Python['coderbot_adv_move'] = function(block) {
  // Generate Python for moving forward.
  var OPERATORS = {
    FORWARD: ['forward'],
    BACKWARD: ['backward'],
    LEFT: ['left'],
    RIGHT: ['right']
  };
  var tuple = OPERATORS[block.getFieldValue('ACTION')];
  var action = tuple[0];
  var speed = Blockly.Python.valueToCode(block, 'SPEED', Blockly.Python.ORDER_NONE);
  var elapse = Blockly.Python.valueToCode(block, 'ELAPSE', Blockly.Python.ORDER_NONE);
  var code = "get_bot()." + action + "(speed=" + speed + ", elapse="+elapse+")\n";
  return code;
};

Blockly.Blocks['coderbot_motion_move'] = {
  // Block for moving forward.
  init: function() {
    this.setHelpUrl('http://code.google.com/p/blockly/wiki/Move');
    this.setColour(40);
    this.interpolateMsg(Blockly.Msg.CODERBOT_MOVE_MOTION_MOVE,
                        ['TEXT', null, Blockly.ALIGN_RIGHT],
                        Blockly.ALIGN_RIGHT);

    this.appendValueInput('DIST')
        .setCheck('Number')
        .appendField(Blockly.Msg.CODERBOT_MOVE_MOTION_DIST);
    this.setInputsInline(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return Blockly.Msg.CODERBOT_MOVE_MOTION_MOVE_TIP;
    });
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['coderbot_motion_move'] = function(block) {
  // Generate JavaScript for moving forward.
  return 'get_bot().forward();\n';
};

Blockly.Python['coderbot_motion_move'] = function(block) {
  // Generate Python for moving forward.
  var dist = Blockly.Python.valueToCode(block, 'DIST', Blockly.Python.ORDER_NONE);
  var code = "get_motion().move(dist=" + dist + ")\n";
  return code;
};

Blockly.Blocks['coderbot_motion_turn'] = {
  // Block for moving forward.
  init: function() {
    this.setHelpUrl('http://code.google.com/p/blockly/wiki/Move');
    this.setColour(40);
    this.interpolateMsg(Blockly.Msg.CODERBOT_MOVE_MOTION_TURN,
                        ['TEXT', null, Blockly.ALIGN_RIGHT],
                        Blockly.ALIGN_RIGHT);

    this.appendValueInput('ANGLE')
        .setCheck('Number')
        .appendField(Blockly.Msg.CODERBOT_MOVE_MOTION_ANGLE);
    this.setInputsInline(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return Blockly.Msg.CODERBOT_MOVE_MOTION_TURN_TIP;
    });
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['coderbot_motion_turn'] = function(block) {
  // Generate JavaScript for moving forward.
  return 'get_bot().right();\n';
};

Blockly.Python['coderbot_motion_turn'] = function(block) {
  // Generate Python for moving forward.
  var angle = Blockly.Python.valueToCode(block, 'ANGLE', Blockly.Python.ORDER_NONE);
  var code = "get_motion().turn(angle=" + angle + ")\n";
  return code;
};

Blockly.Blocks['coderbot_adv_motor'] = {
  // Block for moving forward.
  init: function() {
    this.setHelpUrl('http://code.google.com/p/blockly/wiki/Motor');
    this.setColour(40);
    this.interpolateMsg(Blockly.Msg.CODERBOT_MOVE_ADV_MOTOR,
                        ['TEXT', null, Blockly.ALIGN_RIGHT],
                        Blockly.ALIGN_RIGHT);
    
    this.appendValueInput('SPEED_LEFT')
        .setCheck('Number')
        .appendField(Blockly.Msg.CODERBOT_MOVE_ADV_MOTOR_SPEED_LEFT);
    this.appendValueInput('SPEED_RIGHT')
        .setCheck('Number')
        .appendField(Blockly.Msg.CODERBOT_MOVE_ADV_MOTOR_SPEED_RIGHT);
    this.appendValueInput('ELAPSE')
        .setCheck('Number')
        .appendField(Blockly.Msg.CODERBOT_MOVE_ADV_ELAPSE);
    this.setInputsInline(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var mode = thisBlock.getFieldValue('ACTION');
      return TOOLTIPS[mode] + Blockly.Msg.CODERBOT_MOVE_ADV_TIP_TAIL;
    });
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['coderbot_adv_motor'] = function(block) {
  // Generate JavaScript for moving forward.
  return 'get_bot().motor();\n';
};

Blockly.Python['coderbot_adv_motor'] = function(block) {
  // Generate Python for moving forward.
  var speed_left = Blockly.Python.valueToCode(block, 'SPEED_LEFT', Blockly.Python.ORDER_NONE);
  var speed_right = Blockly.Python.valueToCode(block, 'SPEED_RIGHT', Blockly.Python.ORDER_NONE);
  var elapse = Blockly.Python.valueToCode(block, 'ELAPSE', Blockly.Python.ORDER_NONE);
  var code = "get_bot().motor_control(speed_left=" + speed_left + ", speed_right=" + speed_right + ", elapse=" + elapse + ")\n";
  return code;
};

Blockly.Blocks['coderbot_adv_stop'] = {
  // Block to stop the get_bot().
  init: function() {
    this.setHelpUrl('http://code.google.com/p/blockly/wiki/Stop');
    this.setColour(40);
    this.appendDummyInput()
        .appendField(Blockly.Msg.CODERBOT_MOVE_STOP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(('CoderBot_stopTooltip'));
  }
};

Blockly.JavaScript['coderbot_adv_stop'] = function(block) {
  // Generate JavaScript to stop the get_bot().
  return 'get_bot().stop();\n';
};

Blockly.Python['coderbot_adv_stop'] = function(block) {
  // Generate Python to stop the get_bot().
  return 'get_bot().stop()\n';
};


Blockly.Blocks['coderbot_camera_photoTake'] = {
  // Block for taking a picture.
  init: function() {
    this.setHelpUrl('http://code.google.com/p/blockly/wiki/Turn');
    this.setColour(120);
    var di = this.appendDummyInput()
    if(CODERBOT_PROG_LEVEL.indexOf("basic")>=0) {
        di.appendField(new Blockly.FieldImage('/images/blocks/photo_take.png', 32, 32, '*'));
    } else {
        di.appendField(Blockly.Msg.CODERBOT_PHOTO_TAKE)
    }
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(('CoderBot_PhotoTooltip'));
  }
};

Blockly.JavaScript['coderbot_camera_photoTake'] = function(block) {
  // Generate JavaScript for turning left or right.
  return 'get_cam().takePhoto();\n';
};

Blockly.Python['coderbot_camera_photoTake'] = function(block) {
  // Generate Python for turning left or right.
  return 'get_cam().photo_take()\n';
};

Blockly.Blocks['coderbot_camera_videoRec'] = {
  // Block for recording a video (start).
  init: function() {
    this.setHelpUrl('http://code.google.com/p/blockly/wiki/Turn');
    this.setColour(120);

    var di = this.appendDummyInput()
    if(CODERBOT_PROG_LEVEL.indexOf("basic")>=0) {
        di.appendField(new Blockly.FieldImage('/images/blocks/video_rec.png', 32, 32, '*'));
    } else {
        di.appendField(Blockly.Msg.CODERBOT_VIDEO_REC)
    }
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(('CoderBot_VideoTooltip'));
  }
};

Blockly.JavaScript['coderbot_camera_videoRec'] = function(block) {
  // Generate JavaScript for turning left or right.
  return 'get_cam().videoRec();\n';
};

Blockly.Python['coderbot_camera_videoRec'] = function(block) {
  // Generate Python for turning left or right.
  return 'get_cam().video_rec()\n';
};

Blockly.Blocks['coderbot_camera_videoStop'] = {
  // Block for recording a video (stop).
  init: function() {
    this.setHelpUrl('http://code.google.com/p/blockly/wiki/Turn');
    this.setColour(120);

    var di = this.appendDummyInput()
    if(CODERBOT_PROG_LEVEL.indexOf("basic")>=0) {
        di.appendField(new Blockly.FieldImage('/images/blocks/video_stop.png', 32, 32, '*'));
    } else {
        di.appendField(Blockly.Msg.CODERBOT_VIDEO_STOP)
    }
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(('CoderBot_VideoTooltip'));
  }
};

Blockly.JavaScript['coderbot_camera_videoStop'] = function(block) {
  // Generate JavaScript for turning left or right.
  return 'get_cam().videoStop();\n';
};

Blockly.Python['coderbot_camera_videoStop'] = function(block) {
  // Generate Python for turning left or right.
  return 'get_cam().video_stop()\n';
};

Blockly.Blocks['coderbot_adv_pathAhead'] = {
  /**
   * Block for pathAhead function.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.LOGIC_BOOLEAN_HELPURL);
    this.setColour(290);
    this.appendDummyInput()
        .appendField(Blockly.Msg.CODERBOT_SENSOR_PATHAHEAD);
    this.setOutput(true, 'Number');
    this.setTooltip(Blockly.Msg.LOGIC_BOOLEAN_TOOLTIP);
  }
};

Blockly.JavaScript['coderbot_adv_pathAhead'] = function(block) {
  // Boolean values true and false.
  var code = 'get_cam().path_ahead()';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['coderbot_adv_pathAhead'] = function(block) {
  // Boolean values true and false.
  var code = 'get_cam().path_ahead()';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks['coderbot_adv_findLine'] = {
  /**
   * Block for pathAhead function.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.LOGIC_BOOLEAN_HELPURL);
    this.setColour(290);
    this.appendDummyInput()
        .appendField(Blockly.Msg.CODERBOT_SENSOR_FINDLINE);
    this.setOutput(true, 'Number');
    this.setTooltip(Blockly.Msg.LOGIC_BOOLEAN_TOOLTIP);
  }
};

Blockly.JavaScript['coderbot_adv_findLine'] = function(block) {
  // Boolean values true and false.
  var code = 'get_cam().find_line()';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['coderbot_adv_findLine'] = function(block) {
  // Boolean values true and false.
  var code = 'get_cam().find_line()';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks['coderbot_adv_findSignal'] = {
  /**
   * Block for findSignal function.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.LOGIC_BOOLEAN_HELPURL);
    this.setColour(290);
    this.appendDummyInput()
        .appendField(Blockly.Msg.CODERBOT_SENSOR_FINDSIGNAL);
    this.setOutput(true, 'Number');
    this.setTooltip(Blockly.Msg.LOGIC_BOOLEAN_TOOLTIP);
  }
};

Blockly.JavaScript['coderbot_adv_findSignal'] = function(block) {
  // Boolean values true and false.
  var code = 'get_cam().find_signal()';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['coderbot_adv_findSignal'] = function(block) {
  // Boolean values true and false.
  var code = 'get_cam().find_signal()';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks['coderbot_adv_findFace'] = {
  /**
   * Block for findSignal function.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.LOGIC_BOOLEAN_HELPURL);
    this.setColour(290);
    this.appendDummyInput()
        .appendField(Blockly.Msg.CODERBOT_SENSOR_FINDFACE)
        .appendField(new Blockly.FieldDropdown([[Blockly.Msg.CODERBOT_SENSOR_FINDFACE_X, 'X'], [Blockly.Msg.CODERBOT_SENSOR_FINDFACE_Y, 'Y'],[Blockly.Msg.CODERBOT_SENSOR_FINDFACE_SIZE, 'SIZE'],[Blockly.Msg.CODERBOT_SENSOR_FINDFACE_ALL,'ALL']]), 'RETVAL')
    this.setInputsInline(true);
    this.setOutput(true, ['Number', 'Array']);
    this.setTooltip(Blockly.Msg.LOGIC_BOOLEAN_TOOLTIP);
  }
};

Blockly.JavaScript['coderbot_adv_findFace'] = function(block) {
  // Boolean values true and false.
  var retval = block.getFieldValue('RETVAL');
  var ret_code = {'X': '[0]', 'Y': '[1]', 'SIZE': '[2]', 'ALL': ''}[retval];
  var code = 'get_cam().find_face()' + ret_code + ';';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['coderbot_adv_findFace'] = function(block) {
  // Boolean values true and false.
  var retval = block.getFieldValue('RETVAL');
  var ret_code = {'X': '[0]', 'Y': '[1]', 'SIZE': '[2]', 'ALL': ''}[retval];
  var code = 'get_cam().find_face()' + ret_code;
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks['coderbot_adv_findCode'] = {
  /**
   * Block for findSignal function.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.LOGIC_BOOLEAN_HELPURL);
    this.setColour(290);
    this.appendDummyInput()
        .appendField(Blockly.Msg.CODERBOT_SENSOR_FINDCODE);
    this.setOutput(true, 'Number');
    this.setTooltip(Blockly.Msg.LOGIC_BOOLEAN_TOOLTIP);
  }
};

Blockly.JavaScript['coderbot_adv_findCode'] = function(block) {
  // Boolean values true and false.
  var code = 'get_cam().find_code()';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['coderbot_adv_findCode'] = function(block) {
  // Boolean values true and false.
  var code = 'get_cam().find_code()';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks['coderbot_adv_findColor'] = {
  /**
   * Block for findSignal function.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.LOGIC_BOOLEAN_HELPURL);
    this.setColour(290);
    this.appendDummyInput()
        .appendField(Blockly.Msg.CODERBOT_SENSOR_FINDCOLOR_FIND)
        .appendField(new Blockly.FieldDropdown([[Blockly.Msg.CODERBOT_SENSOR_FINDCOLOR_X, 'X'], [Blockly.Msg.CODERBOT_SENSOR_FINDCOLOR_Y, 'Y'],[Blockly.Msg.CODERBOT_SENSOR_FINDCOLOR_DIAMETER,'DIAMETER'],[Blockly.Msg.CODERBOT_SENSOR_FINDCOLOR_ALL,'ALL']]), 'RETVAL')
        .appendField(Blockly.Msg.CODERBOT_SENSOR_FINDCOLOR_COLOR);
    this.appendValueInput('COLOR')
        .setCheck('Colour');
    this.setInputsInline(true);
    this.setOutput(true, ['Number', 'Array']);
    this.setTooltip(Blockly.Msg.LOGIC_BOOLEAN_TOOLTIP);
  }
};

Blockly.JavaScript['coderbot_adv_findColor'] = function(block) {
  // Boolean values true and false.
  var color = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_NONE);
  var retval = block.getFieldValue('RETVAL');
  var ret_code = {'X': '[0]', 'Y': '[1]', 'DIAMETER': '[2]', 'ALL': ''}[retval];
  var code = 'get_cam().find_color(' + color + ')' + ret_code + ';';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['coderbot_adv_findColor'] = function(block) {
  // Boolean values true and false.
  var color = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_NONE);
  var retval = block.getFieldValue('RETVAL');
  var ret_code = {'X': '[0]', 'Y': '[1]', 'DIAMETER': '[2]', 'ALL': ''}[retval];
  var code = 'get_cam().find_color(' + color + ')' + ret_code;
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks['coderbot_adv_findLogo'] = {
  /**
   * Block for findLogo function.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.LOGIC_BOOLEAN_HELPURL);
    this.setColour(290);
    this.appendDummyInput()
        .appendField(Blockly.Msg.CODERBOT_SENSOR_FINDLOGO);
    this.setOutput(true, 'Number');
    this.setTooltip(Blockly.Msg.LOGIC_BOOLEAN_TOOLTIP);
  }
};

Blockly.JavaScript['coderbot_adv_findLogo'] = function(block) {
  // Boolean values true and false.
  var code = 'get_cam().find_logo()';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['coderbot_adv_findLogo'] = function(block) {
  // Boolean values true and false.
  var code = 'get_cam().find_logo()';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks['coderbot_armRaise'] = {
  /**
     * Block for armRaise function.
     * @this Blockly.Block
     */
  init: function() {
    this.setHelpUrl(Blockly.Msg.CODERBOT_ARM_RAISE_HELPURL);
    this.setColour(290);
    var di = this.appendDummyInput()    
    if (CODERBOT_PROG_LEVEL.indexOf("basic")>=0) {
      di.appendField(new Blockly.FieldImage('/images/blocks/arm_raise.png', 32, 32, '*'));
    } else {
      di.appendField(Blockly.Msg.CODERBOT_ARM_RAISE)
    }
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Coderbot_armRaiseTooltip');
  }
};

Blockly.JavaScript['coderbot_armRaise'] = function(block) {
  // Generate JavaScript for raising the arm
  return 'get_bot().arm_up();\n';
};

Blockly.Python['coderbot_armRaise'] = function(block) {
  // Generate Python code for raising the arm
  return 'get_bot().arm_up()\n';
};

Blockly.Blocks['coderbot_armLower'] = {
  /** 
     * Block for armLower function.
     * @this Blockly.Block
     */
  init: function() {
    this.setHelpUrl(Blockly.Msg.CODERBOT_ARM_RAISE_HELPURL);
    this.setColour(290);
    var di = this.appendDummyInput()
    if (CODERBOT_PROG_LEVEL.indexOf("basic")>=0) {
      di.appendField(new Blockly.FieldImage('/image/blocks/arm_lower.png', 32, 32, '*'));
    } else {
      di.appendField(Blockly.Msg.CODERBOT_ARM_LOWER)
    }
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Coderbot_armLowerTooltip');
  } 
};

Blockly.JavaScript['coderbot_armLower'] = function(block) {
  // Generate JavaScript code for lowering the arm
  return 'get_bot().arm_down();\n';
};

Blockly.Python['coderbot_armLower'] = function(block) {
  // Generate Python code for lowering the arm
  return 'get_bot().arm_down()\n';
};


Blockly.Blocks['coderbot_printCircle'] = {
  /**
   * Block for printing a circle on the screen at a given coordinate
   * @this Blockly.Block
   */
  init: function() {
    this.appendValueInput("colourX")
        .setCheck("Number")
        .appendField("Print circle of colour")
        .appendField(new Blockly.FieldColour("#ff0000"), "COLOUR_PARAM")
        .appendField("at coordinates X");
    this.appendValueInput("colourY")
        .setCheck("Number")
        .appendField(" and Y");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(30);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['coderbot_printCircle'] = function(block) {
  var colour_param = block.getFieldValue('COLOUR_PARAM');
  var value_colourx = Blockly.JavaScript.valueToCode(block, 'colourX', Blockly.JavaScript.ORDER_ATOMIC);
  var value_coloury = Blockly.JavaScript.valueToCode(block, 'colourY', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  return 'get_cam().drawCircle(' + colour_param + ',' + value_colourx + ',' + value_coloury + ';\n';
};

Blockly.Python['coderbot_printCircle'] = function(block) {
  var colour_param = block.getFieldValue('COLOUR_PARAM');
  var value_colourx = Blockly.Python.valueToCode(block, 'colourX', Blockly.Python.ORDER_ATOMIC);
  var value_coloury = Blockly.Python.valueToCode(block, 'colourY', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  return 'get_cam().drawCircle(' + colour_param + ',' + value_colourx + ',' + value_coloury + ';\n';
};

Blockly.Blocks['turn_led_on'] = {
  init: function() {
    this.appendValueInput("seconds")
      .setCheck("Number")
      .appendField("Turn the ")
      .appendField(new Blockly.FieldDropdown([["red", "Red LED"], ["green", "Green LED"], ["blue", "Blue LED"]]), "Colour")
      .appendField("LED on for ");
    this.appendDummyInput()
      .appendField("seconds");
    this.setInputsInline(true);
    this.setHelpUrl(Blockly.Msg.CODERBOT_LED);
    this.setColour(355);
    this.setPreviousStatement(true,null);
    this.setNextStatement(true,null);
    this.setTooltip('Coderbot_LED');
  }
};

Blockly.JavaScript['turn_led_on'] = function(block) {
  // Generate JavaScrip code for LED lights
  var dropdown_colour = block.getFieldValue('Colour');
  var time = Blockly.Javascript.valueToCode(block, 'seconds', Blockly.Javascript.ORDER_ATOMIC);
  return 'get_bot().LED_on();\n';
};

Blockly.Python['turn_led_on'] = function(block) {
  // Generate Python code for LED lights
  var dropdown_colour = block.getFieldValue('Colour');
  var time = Blockly.Python.valueToCode(block, 'seconds', Blockly.Python.ORDER_ATOMIC);
  var code =  "get_bot().LED_on(Colour=\"" + dropdown_colour + "\", seconds=" +time + ")\n";
  return code;
};

Blockly.Blocks['led_on'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Turn the ")
      .appendField(new Blockly.FieldDropdown([["red", "Red LED"], ["green", "Green LED"], ["blue", "Blue LED"]]), "Colour")
      .appendField("LED on");
    this.setHelpUrl(Blockly.Msg.CODERBOT_LED_ON);
    this.setColour(355);
    this.setPreviousStatement(true,null);
    this.setNextStatement(true,null);
    this.setTooltip('Coderbot_LED');
  }
};

Blockly.JavaScript['led_on'] = function(block) {
  // Generate JavaScrip code for LED lights
  var dropdown_colour = block.getFieldValue('Colour');
  return 'get_bot().LED_on_indef();\n';
};

Blockly.Python['led_on'] = function(block) {
  // Generate Python code for LED lights
  var dropdown_colour = block.getFieldValue('Colour');
  var code =  "get_bot().LED_on_indef(Colour=\"" + dropdown_colour + "\"" + ")\n";
  return code;
};

Blockly.Blocks['led_off'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Turn the ")
      .appendField(new Blockly.FieldDropdown([["red", "Red LED"], ["green", "Green LED"], ["blue", "Blue LED"]]), "Colour")
      .appendField("LED off");
    this.setHelpUrl(Blockly.Msg.CODERBOT_LED_OFF);
    this.setColour(355);
    this.setPreviousStatement(true,null);
    this.setNextStatement(true,null);
    this.setTooltip('Coderbot_LED');
  }
};

Blockly.JavaScript['led_off'] = function(block) {
  // Generate JavaScrip code for LED lights
  var dropdown_colour = block.getFieldValue('Colour');
  return 'get_bot().LED_on_indef();\n';
};

Blockly.Python['led_off'] = function(block) {
  // Generate Python code for LED lights
  var dropdown_colour = block.getFieldValue('Colour');
  var code =  "get_bot().LED_off_indef(Colour=\"" + dropdown_colour + "\"" + ")\n";
  return code;
};

Blockly.Blocks['rgb_blend'] = {
  /**
   * Block for findSignal function.
   * @this Blockly.Block
   */
  init: function() {
    this.appendValueInput("COLOR")
      .setCheck('Colour')
      .appendField("Turn the LED on with the specific colour ");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setHelpUrl(Blockly.Msg.CODERBOT_LED_BLEND);
    this.setColour(355);
  } 
};


Blockly.JavaScript['rgb_blend'] = function(block) {
  // Generate JavaScrip code for LED lights
  var color = Blockly.Javascript.valueToCode(block, 'COLOR', Blockly.Javascript.ORDER_ATOMIC);
  var code =  "get_bot().RGB_Blend(s_color=" + s_color +  ")\n";
  return code
};

Blockly.Python['rgb_blend'] = function(block) {
  // Generate Python code for LED lights
  var s_color = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC);
  var code =  "get_bot().RGB_Blend(s_color=" + s_color +  ")\n";
  return code
};

Blockly.Blocks['all_off'] = {
  /** 
     * Block for armLower function.
     * @this Blockly.Block
     */
  init: function() {
    this.appendDummyInput()
      .appendField("Turn all LEDs off");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('Coderbot_alloffTooltip');
    this.setHelpUrl(Blockly.Msg.CODERBOT_ALL_OFF_HELPURL);
    this.setColour(355);
  } 
};

Blockly.JavaScript['all_off'] = function(block) {
  // Generate JavaScript code for lowering the arm
  return 'get_bot().alloff();\n';
};

Blockly.Python['all_off'] = function(block) {
  // Generate Python code for lowering the arm
  return 'get_bot().alloff()\n';
};