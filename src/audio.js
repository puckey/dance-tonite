import emitter from 'mitt';
import audioPool from './utils/audio-pool';
import feature from './utils/feature';
import { sleep } from './utils/async';
import settings from './settings';
import pageVisibility from './utils/page-visibility';

const AudioContext = window.AudioContext || window.webkitAudioContext;

let context;
let source;
let gainNode;
let loopCount;
let duration = 0;
let lastTime = 0;
let lastLoopProgress = 0;
let startTime;
let audioElement;
let request;
let onCanPlayThrough;
let onPause;
let onPlay;
let onSeeked;
let pauseTime;
let muted = false;

const FADE_OUT_SECONDS = 2;
const ALMOST_ZERO = 1e-4;

let scheduledTime;
const audio = Object.assign(emitter(), {
  tick() {
    if ((!audioElement && !context) || !startTime) return;
    const time = this.time = (audioElement
      ? (pauseTime || (Date.now() - startTime)) / 1000
      : context.currentTime - startTime) % duration;
    const { loopDuration } = settings;
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
    this.totalTime = this.totalProgress * loopDuration;
    lastTime = time;

    if (this.totalProgress - lastLoopProgress > 1) {
      lastLoopProgress = Math.floor(this.totalProgress);
      this.emit('loop', lastLoopProgress);
    }
  },

  load(param) {
    return new Promise(async (resolve, reject) => {
      audio.reset();
      context = new AudioContext();
      gainNode = context.createGain();
      // Reset time, set loop count
      lastTime = 0;
      lastLoopProgress = 0;
      loopCount = param.loops === undefined
        ? 1
        : param.loops;
      this.loopCount = 0;
      const canPlay = () => {
        this.duration = duration;
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
        const getAudioTime = () => audioElement.currentTime * 1000;
        onCanPlayThrough = () => {
          duration = audioElement.duration;
          canPlay();
          audioElement.removeEventListener('canplaythrough', onCanPlayThrough);
        };
        onPause = () => {
          this.paused = true;
          pauseTime = getAudioTime();
          this.emit('pause');
        };
        onPlay = () => {
          startTime = Date.now() - getAudioTime();
          this.paused = false;
          pauseTime = null;
          this.emit('play');
        };
        onSeeked = () => {
          startTime = Date.now() - getAudioTime();
          if (pauseTime) {
            pauseTime = getAudioTime();
          }
        };
        audioElement.addEventListener('canplaythrough', onCanPlayThrough);
        audioElement.addEventListener('pause', onPause);
        audioElement.addEventListener('play', onPlay);
        audioElement.addEventListener('seeked', onSeeked);
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
    if (!this.muted) {
      audio.fadeIn();
    }
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

  previousLoop() {
    const time = (Math.round(this.progress) - 1.1) * settings.loopDuration;
    this.gotoTime(Math.max(0, Math.min(this.duration, time)));
  },

  nextLoop() {
    const time = (Math.round(this.progress) + 0.9) * settings.loopDuration;
    this.gotoTime(Math.max(0, Math.min(this.duration, time)));
  },

  resetValues() {
    this.progress = 0;
    this.time = 0;
    this.totalTime = 0;
    this.loopProgress = 0;
    this.totalProgress = 0;
    this.looped = false;
  },

  reset() {
    if (context) {
      context.close();
    }
    audio.resetValues();
    // Cancel loading of audioElement:
    if (audioElement) {
      audioElement.removeEventListener('canplaythrough', onCanPlayThrough);
      audioElement.removeEventListener('pause', onPause);
      audioElement.removeEventListener('play', onPlay);
      audioElement.removeEventListener('seeked', onSeeked);
      audioElement.pause();
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
    if (audioElement) {
      audioElement.muted = true;
    }
  },

  unmute() {
    if (scheduledTime) {
      gainNode.gain.cancelScheduledValues(scheduledTime);
    }
    gainNode.gain.value = 1;
    if (audioElement) {
      audioElement.muted = false;
    }
  },

  isMuted() {
    return muted;
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

audio.resetValues();

pageVisibility.on('change', (visible) => {
  audio[visible ? 'play' : 'pause']();
});

export default audio;
