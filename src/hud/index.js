import hyperscript from 'hyperscript';
import router from '../router';
import feature from '../utils/feature';
import audio from '../audio';
import about from '../about';
import addIconSvg from './icons/addvr.svg';
import enterIconSvg from './icons/entervr.svg';
import enterIconDisabledSvg from './icons/x_entervr.svg';
import aboutIconSvg from './icons/about.svg';
import speakerIconSvg from './icons/speaker.svg';
import speakerMuteIconSvg from './icons/mute_speaker.svg';
import playIconSvg from './icons/play.svg';
import pauseIconSvg from './icons/pause.svg';
import prevIconSvg from './icons/prev.svg';
import nextIconSvg from './icons/next.svg';
import viewer from '../viewer';
import settings from '../settings';

const componentContext = hyperscript.context();

const toggleMute = () => {
  const muted = audio.toggleMute();
  elements.muteButton.querySelector('.menu-item-icon').innerHTML =
    muted ? speakerMuteIconSvg : speakerIconSvg;
};

const showVRError = () => {
  const overlay = hud.create(
    'div.tutorial-overlay',
    componentContext(
      'div.tutorial-overlay-text',
      componentContext(
        'span',
        componentContext('h3', 'VR not found.'),
        componentContext('p', 'This experience requires room-scale VR and a WebVR-enabled browser.'),
        componentContext('a', { href: 'https://webvr.info', target: '_blank' }, 'Get set up'),
        ' or ',
        componentContext('a', { onclick: () => hud.remove(overlay) }, 'return home.')
      )
    ),
  );
};

let elements = {
  menuAdd: '.menu-item-add',
  menuEnter: '.menu-item-enter',
  aboutButton: '.menu-item-about',
  muteButton: '.menu-item-mute',
  loaderOverlay: '.spinner-overlay',
  loaderOverlayText: '.spinner-overlay-text',
  playButton: '.play-button',
  colophon: '.colophon',
};

let defaultState = {
  menuAdd: false,
  menuEnter: false,
  aboutButton: about.toggle,
  muteButton: toggleMute,
  colophon: false,
  nextRoom: false,
  prevRoom: false,
  playPauseButton: false,
};

// In the CMS, add play/pause button and prev/next buttons
if (process.env.FLAVOR === 'cms') {
  document.querySelector('.menu-left').appendChild(
    componentContext('div.cms-playback-controls',
      componentContext('div.menu-item-icon.mod-fill.mod-no-stroke.cms-prev-button',
        { onclick: () => audio.prevLoop(), innerHTML: prevIconSvg }),
      componentContext('div.menu-item-icon.mod-fill.mod-no-stroke.cms-play-pause-button', {
        onclick: () => {
          audio.toggle();
        },
        innerHTML: pauseIconSvg,
      }),
      componentContext('div.menu-item-icon.mod-fill.mod-no-stroke.cms-next-button',
        { onclick: () => audio.nextLoop(), innerHTML: nextIconSvg })
    )
  );

  audio.on('play', () => {
    document.querySelector('.cms-play-pause-button').innerHTML = playIconSvg;
  });

  audio.on('pause', () => {
    document.querySelector('.cms-play-pause-button').innerHTML = pauseIconSvg;
  });

  elements = {
    ...elements,
    playPauseButton: '.cms-play-pause-button',
    prevButton: '.cms-prev-button',
    nextButton: '.cms-next-button',
  };

  defaultState = {
    ...defaultState,
    playPauseButton: false,
    prevButton: false,
    nextButton: false,
  };
}

let state = { };

const componentElements = [];

// Interface methods
const hud = {
  prepare() {
    const hudEl = document.querySelector('.hud');
    for (const i in elements) {
      elements[i] = hudEl.querySelector(elements[i]);
    }
    elements.hud = hudEl;

    elements.menuEnter.addEventListener('mouseenter', function () {
      this.querySelector('.menu-item-label')
        .innerHTML = viewer.vrEffect.isPresenting
          ? 'Exit VR'
          : feature.hasVR
            ? 'Enter VR'
            : 'VR not found';
    });

    elements.menuAdd.addEventListener('click', () => {
      router.navigate(`/record/${Math.floor(Math.random() * settings.loopCount)}/head=yes/`);
    });

    // Add .mod-mobile identifier to body on mobile to disable hover effects
    if (feature.isMobile) {
      document.body.classList.add('mod-mobile');
    }

    elements.menuEnter.querySelector('.menu-item-label').innerHTML = feature.hasVR
      ? 'Enter VR'
      : 'VR not found';

    elements.menuEnter.querySelector('.menu-item-icon').innerHTML = feature.hasVR
      ? enterIconSvg
      : enterIconDisabledSvg;

    if (!feature.hasVR) {
      elements.menuEnter.addEventListener('click', showVRError);
    }

    // Add icons
    elements.menuAdd.querySelector('.menu-item-icon').innerHTML = addIconSvg;
    elements.aboutButton.querySelector('.menu-item-icon').innerHTML = aboutIconSvg;
    elements.muteButton.querySelector('.menu-item-icon').innerHTML = speakerIconSvg;
  },

  update(param = {}) {
    const newState = Object.assign(
      {},
      defaultState,
      param,
    );
    // Remove any handlers:
    for (const key in state) {
      const handler = state[key];
      if (typeof handler === 'function') {
        elements[key].removeEventListener('click', handler);
      }
    }
    Object
      .keys(newState)
      .forEach((key) => {
        const handler = newState[key];
        const visible = !!handler;
        const el = elements[key];
        if (el && visible !== state[key]) {
          el.classList[visible ? 'remove' : 'add']('mod-removed');
        }
        if (typeof handler === 'function') {
          el.addEventListener('click', handler);
        }
      });
    state = newState;
  },

  showLoader(label = '') {
    elements.loaderOverlayText.innerHTML = label;
    elements.loaderOverlay.classList.remove('mod-hidden');
  },

  hideLoader() {
    elements.loaderOverlay.classList.add('mod-hidden');
  },

  enterVR: () => {
    if (!feature.isMobile) {
      const el = hud.add(
        componentContext(
        'div.vr-info-overlay.mod-entering-vr',
        componentContext('div.vr-info-overlay-text', 'Put on your VR headset')
      ), false);
      return () => {
        hud.remove(el);
      };
    }
    return () => {};
  },

  create(/* tag, attrs, [text?, Elements?,...] */...args) {
    return hud.add(componentContext.apply(componentContext, args));
  },

  add(el, componentElement = true) {
    if (componentElement) {
      componentElements.push(el);
    }
    elements.hud.appendChild(el);
    return el;
  },

  remove(el) {
    const index = componentElements.indexOf(el);
    if (index !== -1) {
      componentElements.splice(index, 1);
    }
    elements.hud.removeChild(el);
  },

  clear() {
    elements.vrInfo = null;
    componentElements.forEach((el) => {
      elements.hud.removeChild(el);
    });

    // Remove event listeners from hyperscript context:
    componentContext.cleanup();

    componentElements.length = 0;
  },

  h: componentContext,

  elements,
};

export default hud;
