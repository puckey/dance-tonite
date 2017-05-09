import h from 'hyperscript';
import audio from './audio';
import createTimeline from './lib/timeline';

const hudEl = document.querySelector('.hud');

const splashTitle = h(
  'div.splash-title',
  ' '
);
const splash = h(
  'div.splash',
  h('div.splash-title--top', ''),
  splashTitle,
  h('div.splash-title--bottom', ''),
);

const elements = { splash };

const chromeExperiment = document.querySelector('.chrome-experiment');

const timeline = createTimeline([
  {
    time: 0,
    show: [chromeExperiment],
  },
  {
    time: 2.6,
    text: 'dance',
  },
  {
    time: 3.1,
    text: 'dance<br>dance',
  },
  {
    time: 4.1,
    text: 'dance<br>dance<br>dance',
  },
  {
    time: 5.1,
    text: ' ',
  },
  {
    time: 6.1,
    text: 'tonite',
  },
  {
    time: 6.6,
    text: 'tonite<br>tonite',
  },
  {
    time: 7.1,
    text: 'tonite<br>tonite<br>tonite',
  },
  {
    time: 8.1,
    text: ' ',
  },
  {
    time: 9.1,
    text: 'lcd',
  },
  {
    time: 9.6,
    text: 'lcd<br>sound',
  },
  {
    time: 10.1,
    text: 'lcd<br>sound<br>system',
  },
  {
    time: 11.1,
    text: 'lcd<br>sound',
  },
  {
    time: 11.6,
    text: 'lcd',
  },
  {
    time: 12,
    text: ' ',
  },
  {
    time: 9,
    hide: [chromeExperiment],
  },
]);

timeline.on('keyframe', ({ show, hide, text }) => {
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
  if (text) {
    splashTitle.innerHTML = text;
  }
});

export default {
  hide: () => {
    for (const key in elements) {
      elements[key].classList.add('mod-hidden');
    }
  },
  mount: () => {
    for (const key in elements) {
      hudEl.appendChild(elements[key]);
    }
  },
  destroy: () => {
    for (const key in elements) {
      hudEl.removeChild(elements[key]);
    }
  },
  tick: () => {
    timeline.tick(audio.currentTime);
  },
};
