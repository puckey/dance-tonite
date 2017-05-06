import hyperscript from 'hyperscript';
import router from '../router';
import feature from '../utils/feature';
import addIconSvg from './icons/addvr.svg';
import enterIconSvg from './icons/entervr.svg';
import enterIconDisabledSvg from './icons/x_entervr.svg';
import aboutIconSvg from './icons/about.svg';
import { sleep } from '../utils/async';
import viewer from '../viewer';

const h = hyperscript.context();

const elements = {
  menuAdd: '.menu-item-add',
  menuEnter: '.menu-item-enter',
  menuEnterLabel: '.menu-item-enter .menu-item-label',
  aboutButton: '.about-button',
  loaderOverlay: '.loader-overlay',
  loaderOverlayText: '.loader-overlay-text',
  vrInfoOverlay: '.vr-info-overlay',
  playButton: '.play-button',
  chromeExperiment: '.chrome-experiment',
};

const defaultState = {
  menuAdd: false,
  menuEnter: false,
  aboutButton: false,
  colophon: false,
  chromeExperiment: false,
};

let state = { };

const hudEl = document.querySelector('.hud');

const componentElements = [];

// VR state
const toggleVRLabel = () => {
  elements.menuEnter.onmouseleave = () => {
    elements.menuEnterLabel.innerHTML = viewer.vrEffect.isPresenting ? 'Exit VR' : 'Enter VR';
  };
};

// Interface methods
const hud = {
  prepare() {
    for (const i in elements) {
      elements[i] = hudEl.querySelector(elements[i]);
    }

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
          el.classList[visible ? 'remove' : 'add']('mod-hidden');
        }
        if (key === 'menuEnter' && !feature.hasVR) return;
        if (typeof handler === 'function') {
          el.addEventListener('click', handler);
        }
      });
    state = newState;
  },

  showLoader(label = 'Just a sec...') {
    elements.loaderOverlayText.innerHTML = label;
    elements.loaderOverlay.classList.remove('mod-hidden');
  },

  hideLoader() {
    elements.loaderOverlay.classList.add('mod-hidden');
  },

  enterVR: async () => {
    elements.vrInfoOverlay.classList.add('mod-entering-vr');
    document.body.classList.add('mod-in-vr');
    toggleVRLabel();
    await sleep(2);
  },

  exitVR() {
    elements.vrInfoOverlay.classList.remove('mod-entering-vr');
    document.body.classList.remove('mod-in-vr');
    toggleVRLabel();
  },

  create(/* tag, attrs, [text?, Elements?,...] */) {
    const el = h.apply(h, arguments);
    return hud.add(el);
  },

  add(el) {
    componentElements.push(el);
    hudEl.appendChild(el);
    return el;
  },

  remove(el) {
    const index = componentElements.indexOf(el);
    if (index !== -1) {
      componentElements.splice(index, 1);
      hudEl.removeChild(el);
    }
  },

  clear() {
    componentElements.forEach((el) => {
      hudEl.removeChild(el);
    });

    // Remove event listeners from hyperscript context:
    h.cleanup();

    componentElements.length = 0;
  },

  h,

  elements,
};

export default hud;
