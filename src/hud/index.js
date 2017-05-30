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
import viewer from '../viewer';

const componentContext = hyperscript.context();

const toggleMute = () => {
  const muted = audio.toggleMute();
  const muteButton = elements.muteButton;
  muteButton.querySelector('.menu-item-icon').innerHTML =
    muted ? speakerMuteIconSvg : speakerIconSvg;
  muteButton.querySelector('.menu-item-label').innerHTML =
    muted ? 'Unmute' : 'Mute';
};

const elements = {
  menuAdd: '.menu-item-add',
  menuEnter: '.menu-item-enter',
  aboutButton: '.menu-item-about',
  muteButton: '.menu-item-mute',
  loaderOverlay: '.loader-overlay',
  loaderOverlayText: '.loader-overlay-text',
  playButton: '.play-button',
  colophon: '.colophon',
};

const defaultState = {
  menuAdd: false,
  menuEnter: false,
  aboutButton: about.toggle,
  muteButton: toggleMute,
  colophon: false,
};

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
      router.navigate('/record');
    });

    // Add .mod-mobile identifier to body on mobile to disable hover effects
    if (feature.isMobile) {
      document.body.classList.add('mod-mobile');
    }

    if (feature.hasVR) {
      elements.menuEnter.classList.remove('mod-disabled');
    }

    elements.menuEnter.querySelector('.menu-item-label').innerHTML = feature.hasVR
      ? 'Enter VR'
      : 'VR not found';

    elements.menuEnter.querySelector('.menu-item-icon').innerHTML = feature.hasVR
      ? enterIconSvg
      : enterIconDisabledSvg;

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
          el.classList[visible ? 'remove' : 'add']('mod-display-none');
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
    const el = hud.add(
      componentContext(
      'div.vr-info-overlay.mod-entering-vr',
      componentContext('div.vr-info-overlay-text', 'Put on your VR headset')
    ), false);
    return () => {
      hud.remove(el);
    };
  },

  create(/* tag, attrs, [text?, Elements?,...] */) {
    return hud.add(componentContext.apply(componentContext, arguments));
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
