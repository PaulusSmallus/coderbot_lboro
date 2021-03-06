import os
import time
import pigpio

PIN_MOTOR_ENABLE = 22
PIN_LEFT_FORWARD = 25
PIN_LEFT_BACKWARD = 24 # NOT USED FOR SERVOS
PIN_RIGHT_FORWARD = 4
PIN_RIGHT_BACKWARD = 17 # NOT USED FOR SERVOS
PIN_PUSHBUTTON = 18
PIN_SERVO_3 = 9 # ARM PIN
PIN_SERVO_4 = 10
LED_RED = 21
LED_BLUE = 16
LED_GREEN = 20

PWM_FREQUENCY = 50 #Hz
PWM_UPPER = 1700 # 1.7ms for full clockwise
PWM_LOWER = 1300 # 1.3ms for full anti-clockwise
LEDPinFreq =100


def coderbot_callback(gpio, level, tick):
  return CoderBot.get_instance().callback(gpio, level, tick)

class CoderBot:
  _pin_out = [PIN_MOTOR_ENABLE, PIN_LEFT_FORWARD, PIN_RIGHT_FORWARD, PIN_LEFT_BACKWARD, PIN_RIGHT_BACKWARD, PIN_SERVO_3, PIN_SERVO_4]


  def __init__(self, servo=False):
    self.check_end = None
    self.pi = pigpio.pi('localhost')
    self.pi.set_mode(PIN_PUSHBUTTON, pigpio.INPUT)
    self._cb = dict()
    self._cb_last_tick = dict()
    self._cb_elapse = dict()
    self._servo = servo
    if self._servo:
      self.motor_control = self._servo_motor
    else:
      self.motor_control = self._dc_motor
    cb1 = self.pi.callback(PIN_PUSHBUTTON, pigpio.EITHER_EDGE, coderbot_callback)
    for pin in self._pin_out:
      self.pi.set_PWM_frequency(pin, PWM_FREQUENCY)

    self.pi.set_PWM_frequency(LED_RED, LEDPinFreq)
    self.pi.set_PWM_frequency(LED_GREEN, LEDPinFreq)
    self.pi.set_PWM_frequency(LED_BLUE, LEDPinFreq)
    self.stop()
    self._is_moving = False
 
  the_bot = None

  @classmethod
  def get_instance(cls, servo = False):
    if not cls.the_bot:
      cls.the_bot = CoderBot(servo)
    return cls.the_bot

  #add a method to be called periodically while waiting
  def setCheckEndMethod(self,check_end):
    self.check_end = check_end

  def move(self, speed=100, elapse=-1):
    self.motor_control(speed_left=speed, speed_right=speed, elapse=elapse)

  def turn(self, speed=100, elapse=-1):
    self.motor_control(speed_left=speed, speed_right=-speed, elapse=elapse)

  def forward(self, speed=100, elapse=-1):
    self.move(speed=speed, elapse=elapse)

  def backward(self, speed=100, elapse=-1):
    self.move(speed=-speed, elapse=elapse)

  def left(self, speed=100, elapse=-1):
    self.turn(speed=-speed, elapse=elapse)

  def right(self, speed=100, elapse=-1):
    self.turn(speed=speed, elapse=elapse) 

  def servo3(self, angle):
    #self._servo_control(PIN_SERVO_3, angle)
    angle = self.clamp(angle,0,100)
    pwm = PWM_LOWER + ((angle/100.0)*(PWM_UPPER - PWM_LOWER))
    self.pi.set_servo_pulsewidth(PIN_SERVO_3,pwm)

  def arm_up(self):
    self.servo3(0)
    
  def arm_down(self):
    self.servo3(120)
                       

  def servo4(self, angle):
    self._servo_control(PIN_SERVO_4, angle)

  def _dc_motor(self, speed_left=100, speed_right=100, elapse=-1):
    self._is_moving = True

    if speed_left < 0:
      speed_left = abs(speed_left)
      self.pi.write(PIN_LEFT_FORWARD, 0)
      self.pi.set_PWM_dutycycle(PIN_LEFT_BACKWARD, speed_left)
    else:
      self.pi.write(PIN_LEFT_BACKWARD, 0)
      self.pi.set_PWM_dutycycle(PIN_LEFT_FORWARD, speed_left)

    if speed_right < 0:
      speed_right = abs(speed_right)
      self.pi.write(PIN_RIGHT_FORWARD, 0)
      self.pi.set_PWM_dutycycle(PIN_RIGHT_BACKWARD, speed_right)
    else:
      self.pi.write(PIN_RIGHT_BACKWARD, 0)
      self.pi.set_PWM_dutycycle(PIN_RIGHT_FORWARD, speed_right)

    self.pi.write(PIN_MOTOR_ENABLE, 1)
    if elapse > 0:
      self.sleep(elapse)
      self.stop()

  def _servo_motor(self, speed_left=100, speed_right=100, elapse=-1):
    self._is_moving = True
    speed_left = -speed_left

    self.pi.write(PIN_MOTOR_ENABLE, 1)
    self.pi.write(PIN_RIGHT_BACKWARD, 0)
    self.pi.write(PIN_LEFT_BACKWARD, 0)

    self._servo_motor_control(PIN_LEFT_FORWARD, speed_left)
    self._servo_motor_control(PIN_RIGHT_FORWARD, speed_right)
    if elapse > 0:
      self.sleep(elapse)
      self.stop()


  def _servo_motor_control(self, pin, speed):
    self._is_moving = True

    #clamp between -100 and 100
    speed = self.clamp(speed,-100,100)

    #calculate pwn value between the range of UPPER_PWM and LOWER_PWM
    half_range = ((PWM_UPPER - PWM_LOWER) / 2)
    pwm_out = PWM_LOWER + half_range + ((speed / 100.0) * half_range)
    self.pi.set_servo_pulsewidth(pin, pwm_out)

  def _servo_control(self, pin, angle):

    # assuming angle range is 0 to 120
    # transform from angle range to servo duty cycle range (100 to 200)
    duty = angle + 90 # (90-210)
    if duty < 90: duty = 90
    if duty > 210: duty = 210
    self.pi.set_PWM_range(pin, PWM_RANGE)
    self.pi.set_PWM_frequency(pin, PWM_FREQUENCY)
    self.pi.set_PWM_dutycycle(pin, duty)

  def stop(self):
    for pin in self._pin_out:
      if pin != PIN_SERVO_3 and pin != PIN_SERVO_4:
        self.pi.write(pin, 0)
    self._is_moving = False

  def clamp(self,x,lower,upper):
    if x < lower:
      x = lower
    if x > upper:
      x = upper
    return x

  def sleep(self, elapse):
    for i in range(int(elapse / 0.1)):
      time.sleep(0.1)
      if self.check_end != None:
        self.check_end()
          
    time.sleep(elapse % 0.1)

  def is_moving(self):
    return self._is_moving

  def say(self, what):
    if what and "$" in what:
      os.system ('omxplayer sounds/' + what[1:])
    elif what and len(what):
      os.system ('espeak -ven -p 90 -a 200 -s 150 -g 10 "' + what + '" 2>>/dev/null')

  def set_callback(self, gpio, callback, elapse):
    self._cb_elapse[gpio] = elapse * 1000
    self._cb[gpio] = callback
    self._cb_last_tick[gpio] = 0

  def callback(self, gpio, level, tick):
    cb = self._cb.get(gpio)
    if cb:
      elapse = self._cb_elapse.get(gpio)
      if level == 0:
        self._cb_last_tick[gpio] = tick
      elif tick - self._cb_last_tick[gpio] > elapse: 
        self._cb_last_tick[gpio] = tick
        print "pushed: ", level, tick
        cb()

  def halt(self):
    os.system ('sudo halt')

  def restart(self):
    os.system ('sudo /etc/init.d/coderbot stop && sudo pkill -9 dbus && sudo /etc/init.d/coderbot start')

  def reboot(self):
    os.system ('sudo reboot')


  def LED_on(self, Colour, seconds, pin=0):
    if Colour == "Red LED":
      pin = LED_RED
    elif Colour == "Green LED":
      pin = LED_GREEN
    elif Colour == "Blue LED":
      pin = LED_BLUE
    self.pi.write(pin, 1)
    time.sleep(seconds)
    self.pi.write(pin, 0)

  def LED_on_indef(self, Colour, pin=0):
    if Colour == "Red LED":
      pin = LED_RED
    elif Colour == "Green LED":
      pin = LED_GREEN
    elif Colour == "Blue LED":
      pin = LED_BLUE
    self.pi.write(pin, 1)

  def LED_off_indef(self, Colour, pin=0):
    if Colour == "Red LED":
      pin = LED_RED
    elif Colour == "Green LED":
      pin = LED_GREEN
    elif Colour == "Blue LED":
      pin = LED_BLUE
    self.pi.write(pin, 0)  

  def RGB_Blend(self, s_color):
    colorR = int(s_color[1:3],16)
    colorG = int(s_color[3:5],16)
    colorB = int(s_color[5:7],16)
    self.pi.set_PWM_dutycycle(LED_RED, colorR)
    self.pi.set_PWM_dutycycle(LED_GREEN, colorG)
    self.pi.set_PWM_dutycycle(LED_BLUE, colorB)

  def alloff(self):
    self.pi.write(LED_GREEN, 0)
    self.pi.write(LED_RED, 0)
    self.pi.write(LED_BLUE, 0)      
