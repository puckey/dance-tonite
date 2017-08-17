/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import emitter from 'mitt';
import audioPool from './utils/audio-pool';
import feature from './utils/feature';
import { sleep } from './utils/async';
import settings from './settings';
import pageVisibility from './utils/page-visibility';
import viewer from './viewer';

const logging = false;

const AudioContext = window.AudioContext || window.webkitAudioContext;

let context;
let source;
let gainNode;
let filter;
let loopCount;
let duration = 0;
let lastTime = 0;
let audioTime;
let lastLoopProgress = 0;
let startTime;
let contextStartTime;
let audioElement;
let request;
let onCanPlayThrough;
let onPause;
let onPlay;
let onSeeking;
let pauseTime;
let muted = false;

const FADE_OUT_SECONDS = 2;
const FADE_IN_SECONDS = 1;
const ALMOST_ZERO = 1e-4;
const FILTER_LOW = 6600.0;
const FILTER_HIGH = 14000.0;

// The allowable sync difference on android is higher, because for some reason
// it is is much less accurate in reporting HTMLMediaElement.currentTime:
const ALLOWED_SYNC_DIFFERENCE = (feature.isMobile && !feature.isIOs) ? 0.1 : 0.05;

let scheduledTime;
const audio = Object.assign(emitter(), {
  tick(staticTime) {
    if (!context || !duration) return;

    // If we don't have enough data to play the audio,
    // pause playback by returning early:
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState
    if (audioElement && audioElement.readyState === 2) return;

    const now = Date.now();

    const isStatic = staticTime !== undefined;

    if (!isStatic) {
      // The time as reported by the context or audio element:
      audioTime = (audioElement
        ? audioElement.currentTime
        : context.currentTime - contextStartTime) % audio.duration;
      if (audioTime === 0) {
        startTime = now;
        return;
      }
    }

    this.time = (isStatic
      ? staticTime
      : (pauseTime || (now - startTime)) / 1000
    );

    if (!isStatic) {
      // If our animation time is running out of sync with the time reported
      // by the audio element correct it:
      const syncDiff = this.time - audioTime;
      if (Math.abs(syncDiff) > ALLOWED_SYNC_DIFFERENCE) {
        if (logging) {
          const loopText = syncDiff > (0.9 * audio.duration) ? 'audio looped: ' : '';
          console.log(`${loopText}syncing animation to audio by ${Math.round(syncDiff * 1000)} ms to ${audioTime}`);
        }
        this.time = audioTime;
        startTime = now - audioTime * 1000;
      }
    }
    const { loopDuration } = settings;
    const time = this.time;
    // The position within the track as a multiple of loopDuration:
    this.progress = time > 0
      ? time / loopDuration
      : 0;
    // The position within the individual loop as a value between 0 - 1:
    this.loopProgress = (time % loopDuration) / loopDuration;

    // True when the audio looped, false otherwise:
    this.looped = (time < lastTime) && Math.abs(time - lastTime) > (audio.duration * 0.9);
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
      filter = context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = FILTER_HIGH;
      filter.Q.value = 2;
      // Reset time, set loop count
      lastTime = 0;
      lastLoopProgress = 0;
      loopCount = param.loops === undefined
        ? 1
        : param.loops;
      this.loopCount = 0;
      const canPlay = () => {
        this.duration = duration;
        gainNode.gain.setValueAtTime(ALMOST_ZERO, context.currentTime);
        audio.fadeIn();
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
        audioElement.crossOrigin = 'anonymous';
        audioElement.loop = param.loop === undefined ? true : param.loop;
        const getAudioTime = () => audioElement.currentTime * 1000;
        onCanPlayThrough = () => {
          // On Samsung Internet the audio element doesn't have a duration
          // yet when 'canplaythrough' is fired, therefore we check again (and again)
          // using a timeout when duration === 0:
          const checkHasDuration = () => {
            duration = audioElement.duration;
            if (duration === 0) {
              setTimeout(checkHasDuration, 5);
            } else {
              canPlay();
            }
          };
          checkHasDuration();
          audioElement.removeEventListener('canplaythrough', onCanPlayThrough);
        };
        onPause = () => {
          this.paused = true;
          pauseTime = getAudioTime();
          this.emit('pause');
        };
        onPlay = () => {
          this.paused = false;
          pauseTime = null;
          this.emit('play');
        };
        onSeeking = () => {
          startTime = Date.now() - getAudioTime();
          if (pauseTime) {
            pauseTime = getAudioTime();
          }
          this.time = audioElement.currentTime;
          onPause();
        };
        audioElement.addEventListener('canplaythrough', onCanPlayThrough);
        audioElement.addEventListener('pause', onPause);
        audioElement.addEventListener('playing', onPlay);
        audioElement.addEventListener('seeking', onSeeking);
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
              contextStartTime = context.currentTime;
              startTime = Date.now();
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
    if (audioElement) {
      audioElement.play();
    }
    if (!muted && gainNode.gain.value < 1) {
      audio.fadeIn();
    }
  },

  pause() {
    this.paused = true;
    if (context) context.suspend();
    if (audioElement) {
      audioElement.pause();
    }
  },

  toggle() {
    this[this.paused ? 'play' : 'pause']();
  },

  gotoTime(time) {
    audioElement.currentTime = time;
    this.tick();
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
    duration = 0;
    lastTime = null;
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
      audioElement.removeEventListener('playing', onPlay);
      audioElement.removeEventListener('seeking', onSeeking);
      audioElement.pause();
      audioElement = null;
      onCanPlayThrough = null;
    }
    if (request) {
      request.abort();
      request.onload = null;
      request = null;
    }
    pauseTime = contextStartTime = null;
    startTime = 0;
  },

  rewind() {
    if (audioElement) {
      audioElement.currentTime = 0;
      gainNode.gain.value = muted ? ALMOST_ZERO : 1;
    }
  },

  mute() {
    if (scheduledTime) {
      gainNode.gain.cancelScheduledValues(scheduledTime);
    }
    gainNode.gain.value = ALMOST_ZERO;
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

  async dim(immediate = false) {
    if (!context) return;

    source.disconnect();
    source.connect(filter);
    filter.connect(gainNode);

    if (immediate) {
      filter.frequency.value = FILTER_LOW;
    } else {
      audio.fade(2, FILTER_LOW, filter.frequency);
    }

    await audio.fade(1, 0.85);
  },

  async undim(immediate = false) {
    if (!context) return;

    if (immediate) {
      filter.frequency.value = FILTER_HIGH;
    } else {
      audio.fade(2, FILTER_HIGH, filter.frequency);
    }
    await audio.fade(1, 1);

    filter.disconnect();
    source.disconnect();
    source.connect(gainNode);
  },

  async fadeOut(fadeDuration = FADE_OUT_SECONDS) {
    await audio.fade(fadeDuration, ALMOST_ZERO);
  },

  async fadeIn(fadeDuration = FADE_IN_SECONDS) {
    await audio.fade(fadeDuration, 1);
  },

  async fade(fadeDuration, targetValue, _property = gainNode.gain) {
    if (!context || muted) return;
    if (scheduledTime) {
      _property.cancelScheduledValues(scheduledTime);
    }
    scheduledTime = context.currentTime;
    gainNode.gain.setValueAtTime(_property.value, context.currentTime);
    _property.exponentialRampToValueAtTime(
      targetValue,
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

// Fix issue on Samsung Gear VR browser, where audio does not play anymore after
// exiting VR:
if (feature.isSamsungInternet) {
  viewer.on('vr-present-change', () => {
    setTimeout(() => audio.play(), 500);
  });
}

export default audio;
