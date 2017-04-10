import emitter from 'mitt';

let context;
let source;
let gainNode;
let loopCount;
let duration = 0;
let lastTime = 0;
let startTime;
const ZERO = 1e-25;

const audio = Object.assign(emitter(), {
  tick() {
    if (!source.buffer) return;

    const time = this.time = (context.currentTime - startTime) % duration;
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
    }

    lastTime = time;
  },

  load(param, callback) {
    if (context) context.close();

    context = new AudioContext();
    source = context.createBufferSource();
    gainNode = context.createGain();

    source.connect(gainNode);
    gainNode.connect(context.destination);

    // Reset time, set loop count
    lastTime = 0;
    loopCount = param.loops;

    const request = new XMLHttpRequest();
    request.open('GET', param.src, true);
    request.responseType = 'arraybuffer';
    request.onload = () => {
      context.decodeAudioData(
        request.response,
        (response) => {
          // Load the file into the buffer
          source.buffer = response;

          duration = source.buffer.duration;
          this.loopDuration = duration / loopCount;
          source.loop = true;
          // Start audio and immediately suspend playback
          context.suspend();
          startTime = context.currentTime;
          if (callback) callback(null, param.src);
          audio.emit('load', param.src);
        },
        (err) => { callback(err); },
      );
    };

    request.send();
  },

  play() {
    source.start(0);
    context.resume();
  },

  pause() { context.suspend(); },

  fadeOut(callback) {
    if (!context) return;
    const fadeDuration = 2;
    // Fade out the music in 2 seconds
    gainNode.gain.exponentialRampToValueAtTime(
      ZERO,
      context.currentTime + fadeDuration,
    );

    setTimeout(callback, fadeDuration * 1000);
    audio.emit('faded-out');
  },

  time: 0,
  loopIndex: 0,
});

export default audio;
