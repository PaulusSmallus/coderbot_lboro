#!/usr/bin/python

import time
import pigpio


PIN = 25   # RIGHT=4 LEFT=25 ARM=9

PWM_FREQ = 50
PWM_RANGE = 2000

pi = pigpio.pi('localhost')

pi.set_PWM_frequency(PIN,PWM_FREQ)
pi.set_PWM_range(PIN,PWM_RANGE)

# duty cycle values for range 2000, frequency 50
# 

print 'full counter-clockwise (1ms):'
pi.set_PWM_dutycycle(PIN,100)
time.sleep(2)

print 'rest (1.5ms):'
pi.set_PWM_dutycycle(PIN,150)
time.sleep(2)

print 'full clockwise (2ms):'
pi.set_PWM_dutycycle(PIN,200)
time.sleep(2)

print 'stop:'
pi.set_PWM_dutycycle(PIN,0)
time.sleep(2)

print 'whole range:'
for x in range (100,200):
    pi.set_PWM_dutycycle(PIN,x)
    time.sleep(0.02)
    print x


pi.set_PWM_dutycycle(PIN,0)
print 'test complete.'

