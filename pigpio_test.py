#!/usr/bin/python

import time
import pigpio


PIN_SERVO = 4

PWM_FREQ = 50
PWM_RANGE = 100

pi = pigpio.pi('localhost')

pi.set_PWM_frequency(PIN_SERVO,PWM_FREQ)
pi.set_PWM_range(PIN_SERVO,PWM_RANGE)

pi.set_PWM_dutycycle(PIN_SERVO,0)
time.sleep(1)
pi.set_PWM_dutycycle(PIN_SERVO,25)
time.sleep(1)
pi.set_PWM_dutycycle(PIN_SERVO,60)
time.sleep(1)
pi.set_PWM_dutycycle(PIN_SERVO,100)


