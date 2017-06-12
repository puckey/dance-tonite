import './style.scss';

import hud from '../hud';
import audio from '../audio';
import settings from '../settings';
import windowSize from '../utils/windowSize';

let progressEl;
let moveRatio;
let targetRatio = 0;
const getRatio = event => event.clientX / windowSize.width;

export default {
  create() {
    progressEl = hud.h('div.audio-progress-bar');
    hud.create(
      'div.audio-progress-bar-container',
      {
        onmousemove: (event) => {
          moveRatio = getRatio(event);
          event.stopPropagation();
        },

        onmouseleave: () => {
          moveRatio = null;
        },

        onclick: (event) => {
          audio.gotoTime(audio.duration * getRatio(event));
          event.stopPropagation();
        },

        onmousedown: (event) => {
          event.stopPropagation();
        },
      },
      progressEl
    );
  },

  destroy() {
    progressEl = null;
  },

  tick() {
    const ratio = moveRatio || (audio.progress / settings.totalLoopCount);
    targetRatio = targetRatio * 0.8 + ratio * 0.2;
    progressEl.style.transform = `scaleX(${targetRatio})`;
  },
};
