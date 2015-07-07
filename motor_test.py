#!/usr/bin/python

import os

os.chdir('/home/pi/coderbot_lboro/')

from program import ProgramEngine, Program

prog_name = 'motor_test'
prog_code = 'get_bot().motor_control(speed_left=100,speed_right=100,elapse=5)'


prog_engine = ProgramEngine.get_instance()
prog = None

prog = prog_engine.create(prog_name, prog_code)
prog.execute
