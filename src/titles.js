import h from 'hyperscript';
import audio from './audio';
import createTimeline from './lib/timeline';

const hudEl = document.querySelector('.hud');
const elements = {
  splashTitleLCD: h(
    'div.splash-title.splash-title-lcd.mod-hidden',
    'LCD Sound\nsystem'
  ),
  splashTitleDance: h(
    'div.splash-title.splash-title-dance.mod-hidden',
    'Dance Tonight'
  ),
};

const chromeExperiment = document.querySelector('.chrome-experiment');

const timeline = createTimeline([
  {
    time: 0,
    callback: () => {
      chromeExperiment.classList.remove('mod-hidden');
      elements.splashTitleLCD.classList.add('mod-hidden');
      elements.splashTitleDance.classList.add('mod-hidden');
    },
  },
  {
    time: 0.3,
    callback: () => {
      elements.splashTitleLCD.classList.remove('mod-hidden');
    },
  },
  {
    time: 0.6,
    callback: () => {
      elements.splashTitleLCD.classList.add('mod-hidden');
      elements.splashTitleDance.classList.remove('mod-hidden');
    },
  },
  {
    time: 1,
    callback: () => {
      elements.splashTitleDance.classList.add('mod-hidden');
    },
  },
  {
    time: 1.2,
    callback: () => {
      chromeExperiment.classList.add('mod-hidden');
    },
  },
]);

export default {
  mount: () => {
    for (const element in elements) {
      hudEl.appendChild(elements[element]);
    }
  },
  destroy: () => {
    for (const element in elements) {
      hudEl.removeChild(elements[element]);
    }
  },
  tick: () => {
    timeline.tick(audio.progress);
  },
};