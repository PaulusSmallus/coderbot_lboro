#!/usr/bin/python

import os

os.chdir("/home/pi/coderbot_lboro/")

import coderbot
import main

if __name__=="__main__":
  main.run_server()
