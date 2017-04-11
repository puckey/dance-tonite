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
    gainNode = context.createGain();

    // Reset time, set loop count
    lastTime = 0;
    loopCount = param.loops === undefined
      ? 1
      : param.loops;

    const canPlay = () => {
      this.loopDuration = duration / loopCount;
      startTime = context.currentTime;

      context.suspend();

      if (callback) callback(null, param.src);

      audio.emit('load', param.src);
    }

    if (param.progressive) {
      const audioElement = document.createElement('audio');
      source = context.createMediaElementSource(audioElement);
      audioElement.src = param.src;
      audioElement.loop = true;
      audioElement.type = 'audio/mpeg';

      audioElement.addEventListener('canplaythrough', () => {
        duration = audioElement.duration;
        audioElement.play();
        canPlay();
      })
    } else {
      source = context.createBufferSource();
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
            source.loop = true;
            source.start(0);
            canPlay();
          },
          (err) => { callback(err); },
        );
      };

      request.send();
    }

    source.connect(gainNode);
    gainNode.connect(context.destination);
  },

  play() {
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

    if (callback) {
      setTimeout(callback, fadeDuration * 1000);
    }
    audio.emit('faded-out');
  },

  time: 0,
  loopIndex: 0,
});

export default audio;
