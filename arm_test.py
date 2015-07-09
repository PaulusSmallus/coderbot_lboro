#!/usr/python/bin

import time
import pigpio

PIN = 9

PWM_FREQ = 50
PWM_RANGE = 2000

pi = pigpio.pi('localhost')

pi.set_PWM_frequency(PIN,PWM_FREQ)
pi.set_PWM_range(PIN,PWM_RANGE)

# entire dutycycle range seems to be 50-220

print '1ms-2ms range'
for x in range (100,200):
    pi.set_PWM_dutycycle(PIN,x)
    time.sleep(0.02)
    print x

print 'three waves hello:'
for x in range (0,3):
    pi.set_PWM_dutycycle(PIN,100)
    time.sleep(0.5)
    pi.set_PWM_dutycycle(PIN,200)
    time.sleep(1)




pi.set_PWM_dutycycle(PIN,0)
print 'test complete.'
