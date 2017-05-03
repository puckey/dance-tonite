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
    show: [chromeExperiment],
    hide: [elements.splashTitleLCD, elements.splashTitleDance],
  },
  {
    time: 0.3,
    show: [elements.splashTitleLCD],
  },
  {
    time: 0.6,
    show: [elements.splashTitleDance],
    hide: [elements.splashTitleLCD],
  },
  {
    time: 1,
    hide: [elements.splashTitleDance],
  },
  {
    time: 1.2,
    hide: [chromeExperiment],
  },
]);

timeline.on('keyframe', ({ show, hide }) => {
  if (show) {
    for (let i = 0; i < show.length; i++) {
      show[i].classList.remove('mod-hidden');
    }
  }
  if (hide) {
    for (let i = 0; i < hide.length; i++) {
      hide[i].classList.add('mod-hidden');
    }
  }
});

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
