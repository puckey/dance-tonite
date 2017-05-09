import mitt from 'mitt';
import h from 'hyperscript';
import audio from './audio';
import createTimeline from './lib/timeline';

const emitter = mitt();

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
    time: 3.6,
    text: 'dance<br>dance',
  },
  {
    time: 4.6,
    text: 'dance<br>dance<br>dance',
  },
  {
    time: 5.6,
    text: ' ',
  },
  {
    time: 6.6,
    text: 'tonite',
  },
  {
    time: 7.6,
    text: 'tonite<br>tonite',
  },
  {
    time: 8.6,
    text: 'tonite<br>tonite<br>tonite',
  },
  {
    time: 9.6,
    text: ' ',
  },
  {
    time: 10.6,
    text: 'lcd',
  },
  {
    time: 11.6,
    text: 'lcd<br>sound',
  },
  {
    time: 12.6,
    text: 'lcd<br>sound<br>system',
  },
  {
    time: 13.6,
    text: ' ',
  },
  {
    time: 15,
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
    if (text === ' ') {
      emitter.emit('no-text-shown');
    } else {
      emitter.emit('text-shown');
    }
  }
});

export default Object.assign(emitter, {
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
});
