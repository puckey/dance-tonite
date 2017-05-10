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
let onPlay;

const FADE_OUT_SECONDS = 2;
const ALMOST_ZERO = 1e-4;

let scheduledTime;

const audio = Object.assign(emitter(), {
  tick(dt) {
    this.currentTime = this.currentTime + dt;
    this.loopCount = 21;
    this.loopDuration = 8;
    const time = this.time = this.currentTime;

    const { loopDuration } = this;
    // The position within the track as a multiple of loopDuration:
    this.progress = time / loopDuration;

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
    return new Promise((resolve, reject) => {
      resolve(param.src);
    });
  },

  play() {
  },

  pause() {
  },

  reset() {
  },

  rewind() {
  },

  mute() {
  },

  async fadeOut(fadeDuration = FADE_OUT_SECONDS) {
    return sleep(fadeDuration * 1000);
  },

  async fadeIn(fadeDuration = FADE_OUT_SECONDS) {
    return sleep(fadeDuration * 1000);
  },

  currentTime:0,
  time: 0,
  loopIndex: 0,
});

export default audio;
