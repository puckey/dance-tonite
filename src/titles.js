import audio from './audio';
import viewer from './viewer';
import createTimeline from './lib/timeline';

const hudEl = document.querySelector('.hud');
const elements = {
  'splashTitleLCD': document.createElement('div'),
  'splashTitleDance': document.createElement('div'),
  'chromeExperiment': document.createElement('div'),
};

const webVRExperimentImg = document.createElement('img');
const friendsWithGoogleImg = document.createElement('img');
webVRExperimentImg.src = '/public/colophon/webVR_experiment@3x.png';
webVRExperimentImg.alt = 'This is a WebVR experiment';
friendsWithGoogleImg.src = '/public/colophon/friends_with_g@3x.png';
friendsWithGoogleImg.alt = 'Made with some friends from Google';

elements.splashTitleLCD.className = 'splash-title splash-title-lcd mod-hidden';
elements.splashTitleLCD.innerHTML = 'LCD Sound<br>system';

elements.splashTitleDance.className = 'splash-title splash-title-dance mod-hidden';
elements.splashTitleDance.innerHTML = 'Dance To&ndash;<br>night';

elements.chromeExperiment.className = 'chrome-experiment';
elements.chromeExperiment.appendChild(webVRExperimentImg);
elements.chromeExperiment.appendChild(friendsWithGoogleImg);

for (const element in elements) {
  hudEl.appendChild(elements[element]);
}

const timeline = createTimeline([
  {
    time: 0.3,
    callback: () => {
      elements.splashTitleLCD.classList.remove('mod-hidden');
      elements.chromeExperiment.classList.add('mod-hidden');
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
]);

viewer.events.on('tick', () => {
  timeline.tick(audio.progress);
});

export default {
    destroy: () => {
      for (const element in elements) {
        hudEl.removeChild(elements[element]);
      }
    }
}
