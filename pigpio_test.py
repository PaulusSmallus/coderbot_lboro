#!/usr/bin/python

import time
import pigpio


PIN = 4   # RIGHT=4 LEFT=25 ARM=9

PWM_FREQ = 500
PWM_RANGE = 100

pi = pigpio.pi('localhost')

pi.set_PWM_frequency(PIN,PWM_FREQ)
pi.set_PWM_range(PIN,PWM_RANGE)

# duty cycle values for range 100, frequency 400
# 0-

for x in range (50,100):
    pi.set_PWM_dutycycle(PIN,x)
    time.sleep(0.2)
    print x

pi.set_PWM_dutycycle(PIN,0)


