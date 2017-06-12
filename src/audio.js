import emitter from 'mitt';
import audioPool from './utils/audio-pool';
import feature from './utils/feature';
import { sleep } from './utils/async';

const AudioContext = window.AudioContext || window.webkitAudioContext;

let context;
let source;
let gainNode;
let loopCount;
let duration = 0;
let lastTime = 0;
let startTime;
let audioElement;
let request;
let onCanPlayThrough;
let onPause;
let onPlay;
let pauseTime;
let muted = false;

const FADE_OUT_SECONDS = 2;
const ALMOST_ZERO = 1e-4;

let scheduledTime;
const audio = Object.assign(emitter(), {
  tick() {
    if ((!audioElement && !context) || !startTime) {
      this.progress = 0;
      this.currentTime = 0;
      this.loopProgress = 0;
      this.totalProgress = 0;
      this.looped = false;
      return;
    };
    this.currentTime = audioElement
      ? (pauseTime || (Date.now() - startTime)) / 1000
      : context.currentTime - startTime;
    const time = this.time = this.currentTime % duration;

    const { loopDuration } = this;
    // The position within the track as a multiple of loopDuration:
    this.progress = time > 0
      ? time / loopDuration
      : 0;
    // The position within the individual loop as a value between 0 - 1:
    this.loopProgress = (time % loopDuration) / loopDuration;

    // True when the audio looped, false otherwise:
    this.looped = time < lastTime;

    if (this.looped) {
      // The index of the loop, used when the audio has more than one loops:
      this.loopIndex = Math.floor(this.progress * loopCount);
      this.loopCount++;
    }

    this.totalProgress = this.loopCount * loopCount + this.progress;
    lastTime = time;
  },

  load(param) {
    return new Promise(async (resolve, reject) => {
      if (context) context.close();
      context = new AudioContext();
      gainNode = context.createGain();
      // Reset time, set loop count
      lastTime = 0;
      loopCount = param.loops === undefined
        ? 1
        : param.loops;
      this.loopCount = 0;
      const canPlay = () => {
        this.duration = duration;
        this.loopDuration = duration / loopCount;
        context.suspend();
        resolve(param.src);
      };

      if (param.loopOffset) {
        this.loopOffset = param.loopOffset;
      }

      if (param.progressive) {
        audioElement = feature.isMobile
          ? audioPool.get()
          : new Audio();
        audioElement.addEventListener('ended', () => audio.emit('ended'));
        audioElement.autoplay = true;
        audioElement.src = param.src;
        audioElement.loop = param.loop === undefined ? true : param.loop;
        onCanPlayThrough = () => {
          duration = audioElement.duration;
          canPlay();
          audioElement.removeEventListener('canplaythrough', onCanPlayThrough);
        };
        onPause = () => {
          this.paused = true;
          this.pauseTime = audioElement.currentTime * 1000;
        };
        onPlay = () => {
          startTime = Date.now() - audioElement.currentTime * 1000;
          this.paused = false;
          this.pauseTime = null;
        };
        audioElement.addEventListener('canplaythrough', onCanPlayThrough);
        audioElement.addEventListener('pause', onPause);
        audioElement.addEventListener('play', onPlay);
        source = context.createMediaElementSource(audioElement);
      } else {
        source = context.createBufferSource();
        request = new XMLHttpRequest();
        request.open('GET', param.src, true);
        request.responseType = 'arraybuffer';
        request.onload = () => {
          context.decodeAudioData(
            request.response,
            (response) => {
              // Load the file into the buffer
              source.buffer = response;
              duration = source.buffer.duration;
              source.loop = param.loop === undefined ? true : param.loop;
              source.start(0);
              startTime = context.currentTime;
              canPlay();
            },
            reject
          );
        };
        request.send();
      }
      source.connect(gainNode);
      gainNode.connect(context.destination);
      if (muted) this.mute();
    });
  },

  play() {
    this.paused = false;
    if (context) context.resume();
    if (audioElement) audioElement.play();
  },

  pause() {
    this.paused = true;
    if (context) context.suspend();
    if (audioElement) audioElement.pause();
  },

  toggle() {
    this[this.paused ? 'play' : 'pause']();
  },

  gotoTime(time) {
    audioElement.currentTime = time;
    startTime = Date.now() - time * 1000;
  },

  prevLoop() {
    this.gotoTime(this.time - (1 + this.loopProgress) * this.loopDuration);
  },

  nextLoop() {
    this.gotoTime(this.time + this.loopDuration - this.loopProgress * this.loopDuration);
  },

  reset() {
    audio.fadeOut();
    // Cancel loading of audioElement:
    if (audioElement) {
      audioElement.removeEventListener('canplaythrough', onCanPlayThrough);
      audioElement.removeEventListener('pause', onPause);
      audioElement.removeEventListener('play', onPlay);
      if (feature.isMobile) {
        audioPool.release(audioElement);
      }
      audioElement = null;
      onCanPlayThrough = null;
    }
    if (request) {
      request.abort();
      request.onload = null;
      request = null;
    }
    pauseTime = startTime = null;
  },

  rewind() {
    if (audioElement) {
      audioElement.currentTime = 0;
      gainNode.gain.value = muted ? 0.001 : 1;
    }
  },

  mute() {
    if (scheduledTime) {
      gainNode.gain.cancelScheduledValues(scheduledTime);
    }
    gainNode.gain.value = 0.001;
  },

  unmute() {
    gainNode.gain.value = 1;
  },

  toggleMute() {
    this[muted ? 'unmute' : 'mute']();
    muted = !muted;
    return muted;
  },

  async fadeOut(fadeDuration = FADE_OUT_SECONDS) {
    if (!context) return;
    if (scheduledTime) {
      gainNode.gain.cancelScheduledValues(scheduledTime);
    }
    scheduledTime = context.currentTime;
    gainNode.gain.exponentialRampToValueAtTime(
      ALMOST_ZERO,
      scheduledTime + fadeDuration
    );
    return sleep(fadeDuration * 1000);
  },

  async fadeIn(fadeDuration = FADE_OUT_SECONDS) {
    if (!context || muted) return;
    if (scheduledTime) {
      gainNode.gain.cancelScheduledValues(scheduledTime);
    }
    scheduledTime = context.currentTime;
    gainNode.gain.exponentialRampToValueAtTime(
      1,
      scheduledTime + fadeDuration
    );
    return sleep(fadeDuration * 1000);
  },

  time: 0,
  loopIndex: 0,
});

export default audio;
