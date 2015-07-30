import time
import copy
import os
import sys
import math
from PIL import Image as PILImage
from StringIO import StringIO
from threading import Thread, Lock
import logging

from viz import camera, streamer, image, blob
import config

import picamera
import picamera.array
import io
import cv2
import colorsys
import numpy as np

CAMERA_REFRESH_INTERVAL=0.01
MAX_IMAGE_AGE = 0.0
PHOTO_PATH = "./photos"
DEFAULT_IMAGE = "./photos/broken.jpg"
PHOTO_PREFIX = "DSC"
VIDEO_PREFIX = "VID"
PHOTO_THUMB_SUFFIX = "_thumb"
PHOTO_THUMB_SIZE = (240,180)
VIDEO_ELAPSE_MAX = 900
PHOTO_FILE_EXT = ".jpg"
FFMPEG_CMD = "MP4Box"
VIDEO_FILE_EXT = ".mp4"
VIDEO_FILE_EXT_H264 = ".h264"
MIN_MATCH_COUNT = 10


class Camera(Thread):

  _instance = None
  _img_template = cv2.imread("coderdojo-logo.png")
  _warp_corners_1 = [(0, -120), (640, -120), (380, 480), (260, 480)]
  _warp_corners_2 = [(0, -60), (320, -60), (190, 240), (130, 240)]
  _warp_corners_4 = [(0, -30), (160, -30), (95, 120), (65, 120)]
  _image_cache = None
  _image_cache_updated = False
  _face_cascade = cv2.CascadeClassifier('/usr/local/share/OpenCV/lbpcascades/lbpcascade_frontalface.xml')
  
  stream_port = 9080

  @classmethod
  def get_instance(cls):
    if cls._instance is None:
      cls._instance = Camera()
      cls._instance.start()
    return cls._instance

  def __init__(self):
    logging.info("starting camera")
    self.init_camera()
        
    self._streamer = streamer.JpegStreamer("0.0.0.0:"+str(self.stream_port), st=0.1)
    #self._cam_off_img.save(self._streamer)
    self.recording = False
    self.video_start_time = time.time() + 8640000
    self._run = True
    self._image_time = 0
    self._image_lock = Lock()

    self._photos = []
   
    for dirname, dirnames, filenames,  in os.walk(PHOTO_PATH):
      for filename in filenames:
        if (PHOTO_PREFIX in filename or VIDEO_PREFIX in filename) and PHOTO_THUMB_SUFFIX not in filename:
          self._photos.append(filename)
   
    super(Camera, self).__init__()

  def init_camera(self):
    try:
      props = {
        "width":640,
        "height":480,
        "exposure_mode":config.Config.get().get("camera_exposure_mode"),
        "rotation":config.Config.get().get("camera_rotation")
      }
      self._camera = picamera.PiCamera()
      cam = self._camera
      res = (props.get("width",640), props.get("height",480))
      cam.resolution = res
      cam.framerate = 30
      cam.exposure_mode = props.get("exposure_mode")
      cam.rotation = props.get("rotation")
      self.out_jpeg = io.BytesIO()
      self.out_rgb = picamera.array.PiRGBArray(cam, size=res)
      self.h264_encoder = None
      self.recording = None
      self.video_filename = None
    except:
      self._camera = None
      logging.error("Could not initialise camera:" + str(sys.exc_info()[0]))
      pass

  def grab_start(self):
    logging.debug("grab_start")
    
    rgb_res = (640,480)

    camera_port_0, output_port_0 = self._camera._get_ports(True, 0)
    self.jpeg_encoder = self._camera._get_image_encoder(camera_port_0, output_port_0, 'jpeg', None, quality=40)
    camera_port_1, output_port_1 = self._camera._get_ports(True, 1)
    self.rgb_encoder = self._camera._get_image_encoder(camera_port_1, output_port_1, 'bgr', rgb_res)
    
    with self._camera._encoders_lock:
      self._camera._encoders[0] = self.jpeg_encoder
      self._camera._encoders[1] = self.rgb_encoder

  def grab_one(self):
    self.out_jpeg.seek(0)
    self.out_rgb.seek(0)
    self.jpeg_encoder.start(self.out_jpeg)
    self.rgb_encoder.start(self.out_rgb)
    if not self.jpeg_encoder.wait(10):
      raise picamera.PiCameraError('Timed Out')
    if not self.rgb_encoder.wait(10):
      raise picamera.PiCameraError('Timed Out')

  def grab_stop(self):
    logging.debug("grab_stop")
    
    with self._camera._encoders_lock:
      del self._camera._encoders[0]
      del self._camera._encoders[1]
    
    self.jpeg_encoder.close()
    self.rgb_encoder.close()

  def run(self):
    if self._camera is None:
      return
    try:
      self.grab_start()
      while self._run:
        sleep_time = CAMERA_REFRESH_INTERVAL - (time.time() - self._image_time)
        if sleep_time <= 0:
          ts = time.time()
          #print "run.1"
          self._image_lock.acquire()
          self.grab_one()
          self._image_lock.release()
          #print "run.2: " + str(time.time()-ts)
          #self.save_image(image.Image(self._camera.get_image_bgr()).open().binarize().to_jpeg())
          if self._image_cache_updated is True:
            ret, jpeg_array = cv2.imencode('.jpeg', self._image_cache)
            self.jpeg_to_stream(np.array(jpeg_array).tostring())
            self._image_cache_updated = False
          else:
            self.jpeg_to_stream(self.out_jpeg.getvalue())
          #print "run.3: " + str(time.time()-ts)
        else:
          time.sleep(sleep_time)

        if self.recording and time.time() - self.video_start_time > VIDEO_ELAPSE_MAX:
          self.video_stop()

      self.grab_stop()
    except:
      logging.error("Unexpected error:" + str(sys.exc_info()[0]))
      raise

  def get_image_array(self, maxage = MAX_IMAGE_AGE):
    if self._camera is None:
      print "get_image: Default image"
      return cv2.imread(DEFAULT_IMAGE)
    else:
      return self.out_rgb.array

  def get_image_binarized(self, maxage = MAX_IMAGE_AGE):
    data = get_image_array(maxage)    
    data = cv2.cvtColor(data, cv2.cv.CV_BGR2GRAY)
    data = cv2.adaptiveThreshold(data, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 5, 3)
    return data
      

  def jpeg_to_stream(self, image_jpeg):
    self._streamer.set_image(image_jpeg)
    self._image_time=time.time()

  def set_text(self, text):
    if self._camera is None:
      return
    self._camera.annotate_text = str(text)

  def get_next_photo_index(self):
    last_photo_index = 0
    for p in self._photos:
      try:
        index = int(p[len(PHOTO_PREFIX):-len(self.PHOTO_FILE_EXT)])
        if index > last_photo_index:
          last_photo_index = index
      except:
        pass
    return last_photo_index + 1

  def rotate(self):
    if self._camera is None:
      return
    rot = self._camera.rotation
    rot = rot + 90
    if rot > 271:
      rot = 0
    self._camera.rotation = rot

  def photo_take(self):
    if self._camera is None:
      return
    photo_index = self.get_next_photo_index()
    filename = PHOTO_PREFIX + str(photo_index) + PHOTO_FILE_EXT;
    filename_thumb = PHOTO_PREFIX + str(photo_index) + PHOTO_THUMB_SUFFIX + PHOTO_FILE_EXT;
    of = open(PHOTO_PATH + "/" + filename, "w+")
    oft = open(PHOTO_PATH + "/" + filename_thumb, "w+")
    im_str = self.out_jpeg.getvalue()
    of.write(im_str)
    # thumb
    im_pil = PILImage.open(StringIO(im_str)) 
    im_pil.resize(PHOTO_THUMB_SIZE).save(oft)
    self._photos.append(filename)

  def is_recording(self):
    return self.recording

  def video_rec(self, video_name=None):
    if self.recording:
      return
    if self._camera is None:
      return
    self.recording = True
    if video_name is None:
      video_index = self.get_next_photo_index()
      filename = VIDEO_PREFIX + str(video_index) + VIDEO_FILE_EXT;
      filename_thumb = VIDEO_PREFIX + str(video_index) + PHOTO_THUMB_SUFFIX + PHOTO_FILE_EXT;
    else:
      filename = VIDEO_PREFIX + video_name + VIDEO_FILE_EXT;
      filename_thumb = VIDEO_PREFIX + video_name + PHOTO_THUMB_SUFFIX + PHOTO_FILE_EXT;
      try:
        os.remove(PHOTO_PATH + "/" + filename)
      except:
        pass

    oft = open(PHOTO_PATH +  "/" + filename_thumb, "w")
    im_str = self.out_jpeg.getvalue()
    im_pil = PILImage.open(StringIO(im_str)) 
    im_pil.resize(PHOTO_THUMB_SIZE).save(oft)
    self._photos.append(filename)

    filename = PHOTO_PATH + "/" + filename
    self.video_filename = filename[:filename.rfind(".")]

    camera_port_2, output_port_2 = self._camera._get_ports(True, 2)
    self.h264_encoder = self._camera._get_video_encoder(camera_port_2, output_port_2, 'h264', None)

    with self._camera._encoders_lock:
      self._camera._encoders[2] = self.h264_encoder
    logging.debug( self.video_filename + VIDEO_FILE_EXT_H264 )

    self.h264_encoder.start(self.video_filename + VIDEO_FILE_EXT_H264)

    #self._camera.video_rec(PHOTO_PATH + "/" + filename)
    self.video_start_time = time.time()

  def video_stop(self):
    if self._camera is None:
      return
    if self.recording:
      logging.debug("video_stop")
      self.h264_encoder.stop()
      
      with self.camera._encoders_lock:
        del self.camera._encoders[2]
      
      self.h264_encoder.close()
      # pack in mp4 container
      params = " -fps 12 -add " + self.video_filename + VIDEO_FILE_EXT_H264 + " " + self.video_filename + VIDEO_FILE_EXT
      os.system(self.FFMPEG_CMD + params)
      # remove h264 file
      os.remove(self.video_filename + VIDEO_FILE_EXT_H264)
      self.recording = False
    
  def get_photo_list(self):
    return self._photos

  def get_photo_file(self, filename):
    return open(PHOTO_PATH + "/" + filename)

  def get_photo_thumb_file(self, filename):
    return open(PHOTO_PATH + "/" + filename[:-len(PHOTO_FILE_EXT)] + PHOTO_THUMB_SUFFIX + PHOTO_FILE_EXT)

  def delete_photo(self, filename):
    logging.info("delete photo: " + filename)
    os.remove(PHOTO_PATH + "/" + filename)
    if self._camera is not None:
      os.remove(PHOTO_PATH + "/" + filename[:filename.rfind(".")] + PHOTO_THUMB_SUFFIX + PHOTO_FILE_EXT)
    self._photos.remove(filename)

  def exit(self):
    self._run = False
    self.join()

  def calibrate(self):
    if self._camera is None:
      return
    img = self._camera.getImage() # ??
    self._background = img.hueHistogram()[-1]

  def set_rotation(self, rotation):
    if self._camera is None:
      return
    self._camera.rotation = rotation
  
  def find_line(self):
    self._image_lock.acquire()
    img = self.get_image_binarized(0)
    slices = [0,0,0]
    blobs = [0,0,0]
    slices[0] = img.crop(0, 100, 160, 120)
    slices[1] = img.crop(0, 80, 160, 100)
    slices[2] = img.crop(0, 60, 160, 80)
    coords = [-1, -1, -1]
    for idx, slice in enumerate(slices):
      blobs[idx] = slice.find_blobs(minsize=30, maxsize=160)
      if len(blobs[idx]):
        coords[idx] = (blobs[idx][0].center[0] * 100) / 160
	logging.info("line coord: " + str(idx) + " " +  str(coords[idx])+ " area: " + str(blobs[idx][0].area()))
    
    self._image_lock.release()
    return coords[0]

  def find_template(self, img, template):
    # initiate sift detector
    sift = cv2.SIFT()
    # find the keypoints and descriptors with SIFT
    kp1, des1 = sift.detectAndCompute(template, None)
    kp2, des2 = sift.detectAndCompute(img, None)
    FLANN_INDEX_KDTREE = 0
    index_params = dict(algorithm = FLAN_INDEX_KDTREE, trees = 5)
    search_params = dict(checks = 50)
    flann = cv2.FlannBasedMatcher(index_params, search_params)
    matches = flan.knnMatch(des1, des2, k=2)
    # store all the good matches as per Lowe's ratio test
    good = []
    templates = []
    for m,n in matches:
      if m.distance < 0.7 * n.distance:
        good.append(m)

    if len(good) > MIN_MATCH_COUNT:
      src_pts = np.float32([ kp1[m.queryIdx].pt for m in good ]).reshape(-1,1,2)
      dst_pts = np.float32([ kp2[m.trainIdx].pt for m in good ]).reshape(-1,1,2)

      M, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
      matchesMask = mask.ravel().tolist()
      
      h,w = template.shape
      pts = np.float32([ [0,0],[0,h-1],[w-1,h-1],[w-1,0] ]).reshape(-1,1,2)
      dst = cv2.perspectiveTransform(pts,M)
      logging.info("found template: " + dst)
      templates[0] = dst
    else: 
      logging.info("Not enough matches are found - %d/%d" % (len(good),MIN_MATCH_COUNT))
      matchesMask = None
    return templates

  def find_signal(self):
    #print "signal"
    angle = None
    ts = time.time()
    self._image_lock.acquire()
    img = self.get_image_array(0)
    signals = self.find_template(img, self._img_template)
     
    logging.info("signal: " + str(time.time() - ts))
    if len(signals):
      angle = signals[0].angle

    self._image_lock.release()

    return angle

  def find_face(self):
    faceX = faceY = faceS = None
    self._image_lock.acquire()
    img = self.get_image_array(0)
    ts = time.time()
    img = cv2.cvtColor(img, cv2.cv.CV_BGR2GRAY)
    faces = self._face_cascade.detectMultiScale(img)
    print "face.detect: " + str(time.time() - ts)
    self._image_lock.release()
    print faces
    if len(faces):
      # Get the largest face, face is a rectangle 
      x, y, w, h = faces[0]
      centerX = x + (w/2)
      # ASSUMING RGB 160X120 RESOLUTION!
      faceX = ((centerX * 100) / 160) - 50 #center = 0
      centerY = y + (h/2)
      faceY = 50 - (centerY * 100) / 120 #center = 0 
      size = h 
      faceS = (size * 100) / 120
    return [faceX, faceY, faceS]

  def find_blobs(self, img, minsize=0, maxsize=1000000):
    blobs = []
    contours, hierarchy = cv2.findContours(img, cv2.cv.CV_RETR_TREE, cv2.cv.CV_CHAIN_APPROX_SIMPLE)
    for c in contours:
      area = cv2.contourArea(c)
      if area > minsize and area < maxsize:
        if len(blobs) and area > blobs[0].area:
          blobs.insert(0, blob.Blob(c))
        else:
          blobs.append(blob.Blob(c))

    return blobs
  
  def path_ahead(self):
    #print "path ahead"
    ts = time.time()
    self._image_lock.acquire()
    img = self.get_image_array(0)
    img_binarized = self.get_image_binarized(0)
    blobs = self.find_blobs(img=img_binarized, minsize=100, maxsize=8000)
    #print "path_ahead.get_image: " + str(time.time() - ts)
    #img.crop(0, 100, 160, 120)

    #control_color = control.meanColor()
    #color_distance = cropped.dilate().color_distance(control_color)

    #control_hue = control.getNumpy().mean()
    #hue_distance = cropped.dilate().hueDistance(control_hue)

    #print "path_ahead.crop: " + str(time.time() - ts)
    #control_hue = control_hue - 20 if control_hue > 127 else control_hue + 20
    #binarized = cropped.dilate().binarize(control_hue)
    #binarized = cropped.dilate().binarize().invert()
    #control_hue = control_hue - 10
    #binarized = color_distance.binarize(control_hue).invert()
    #print "path_ahead.binarize: " + str(time.time() - ts)
    #blobs = img.binarize().find_blobs(minsize=100, maxsize=8000)
    #print "path_ahead.blobs: " + str(time.time() - ts)
    coordY = 60
    if len(blobs):
      obstacle = blob.Blob.sort_distance((80,120), blobs)[0]
      #for b in blobs:
      #  print "blobs.bottom: " + str(b.bottom) + " area: " + str(b.area())

      logging.info("obstacle:" + str(obstacle.bottom)) 
      #print "path_ahead.sortdistnace: " + str(time.time() - ts)
      #dw_x = 260 + obstacle.coordinates()[0] - (obstacle.width()/2)
      #dw_y = 160 + obstacle.coordinates()[1] - (obstacle.height()/2) 
      #img.drawRectangle(dw_x, dw_y, obstacle.width(), obstacle.height(), color=(255,0,0))
      
      # TRANSFORM ASSUMES RGB 160X120 RESOLUTION! 
      #x, y = img.transform((obstacle.center[0], obstacle.bottom))
      #coordY = 60 - ((y * 48) / 100) 
      coordY = 60 - ((obstacle.center[1] * 48) / 100)
      logging.info("coordY: " + str(coordY))
      #print obstacle.coordinates()[1]+(obstacle.height()/2)
      #ar_layer.centeredRectangle(obstacle.coordinates(), (obstacle.width(), obstacle.height()))
      #warped.addDrawingLayer(ar_layer)
      #warped.applyLayers()
      #self.save_image(warped.warp(self._unwarp_corners), expire=10)

    #img.drawText("path ahead clear for " + str(coordY) + " cm", 0, 0, fontsize=32 )
    #print "path_ahead.drawtext: " + str(time.time() - ts)
    #self.save_image(img)
    #print "path_ahead.save_image: " + str(time.time() - ts)
    self._image_lock.release()
    #print "path_ahead: " + str(time.time() - ts)
    return coordY

  def find_color(self, s_color):
    color = (int(s_color[1:3],16), int(s_color[3:5],16), int(s_color[5:7],16))
    code_data = None
    ts = time.time()
    self._image_lock.acquire()
    img = self.get_image_array(0)
    self._image_lock.release()
    #bw = img.filter_color(color)
    h, s, v = colorsys.rgb_to_hsv(color[0]/255.0, color[1]/255.0, color[2]/255.0)
    img_hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    h = h * 180
    s = s * 255
    v = v * 255
    logging.debug("color_hsv: " + str(h) + " " + str(s) + " " + str(v))
    lower_color = np.array([h-10, 50, 50])
    upper_color = np.array([h+10, 255, 255])
    logging.debug("lower: " + str(lower_color) + " upper: " + str(upper_color))
    bw = cv2.inRange(img_hsv, lower_color, upper_color)
    # get unordered list of contours in filtered image
    contours, _ = cv2.findContours(bw, cv2.cv.CV_RETR_LIST, cv2.cv.CV_CHAIN_APPROX_SIMPLE)
    center = (0,0)
    radius = 0
    if not contours is None and len(contours) > 0:
      # get the contour with the largest area
      largest = sorted(contours, key = cv2.contourArea, reverse=True)[0]
      (x,y),radius = cv2.minEnclosingCircle(largest) 
      center = (int(x), int(y))
      radius = int(radius)
      # draw a circle around the largest
      cv2.circle(img, center, radius, (0,255,0), 2)
      # copy to image cache for jpegging and streaming [see run()]
      self._image_cache = img
      self._image_cache_updated = True
    #self.save_image(bw.to_jpeg())
    #objects = bw.find_blobs(minsize=5, maxsize=100)
    #logging.debug("objects: " + str(objects))
    #dist = -1
    #angle = 180

    #if objects and len(objects):
      #obj = objects[-1]
      #bottom = obj.bottom
      #logging.info("bottom: " + str(obj.center[0]) + " " +str(obj.bottom))
      #coords = bw.transform([(obj.center[0], obj.bottom)])
      #logging.info("coordinates: " + str(coords))
      #x = coords[0][0]
      #y = coords[0][1]
      #dist = math.sqrt(math.pow(12 + (68 * (120 - y) / 100),2) + (math.pow((x-80)*60/160,2)))
      #angle = math.atan2(x - 80, 120 - y) * 180 / math.pi
      #logging.info("object found, dist: " + str(dist) + " angle: " + str(angle))
    #self.save_image(img.to_jpeg())
    #print "object: " + str(time.time() - ts)
    #return [dist, angle]
    return [center[0],center[1],radius*2]
      
    
  def sleep(self, elapse):
    logging.debug("sleep: " + str(elapse))
    time.sleep(elapse)

  def drawCircle(self,colour,x,y):
    cv2.circle(self._camera.get_image_bgr(),(x,y),30,(0,0,255), -1)
    #cv2.circle(self.get_image(0)
    

      

