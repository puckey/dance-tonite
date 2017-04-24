import router from '../router';
import viewer from '../viewer';
import feature from '../lib/feature';
import addIconSvg from './icons/addvr.svg';
import enterIconSvg from './icons/entervr.svg';
import enterIconDisabledSvg from './icons/x_entervr.svg';
import aboutIconSvg from './icons/about.svg';

const elements = {
  menuAdd: document.querySelector('.menu-item-add'),
  menuEnter: document.querySelector('.menu-item-enter'),
  menuEnterLabel: document.querySelector('.menu-item-enter .menu-item-label'),
  aboutButton: document.querySelector('.about-button'),
  loaderOverlay: document.querySelector('.loader-overlay'),
  loaderOverlayText: document.querySelector('.loader-overlay-text'),
  vrInfoOverlay: document.querySelector('.vr-info-overlay'),
};

const defaultState = {
  menuAdd: false,
  menuEnter: false,
  aboutButton: false,
};

const state = { };

let hasVR;

elements.menuAdd.addEventListener('click', () => {
  router.navigate('/record');
});

// Add .mod-mobile identifier to body on mobile to disable hover effects
if (feature.isMobile) {
  document.body.classList.add('mod-mobile');
}

// Check if VR device is connected
if (typeof navigator.getVRDisplays === 'function') {
  navigator.getVRDisplays().then(devices => {
    hasVR = devices.length > 0;
    if (hasVR) {
      elements.menuEnter.classList.remove('mod-disabled');
      elements.menuEnter.querySelector('.menu-item-label').innerHTML = 'Enter VR';
      elements.menuEnter.querySelector('.menu-item-icon').innerHTML = enterIconSvg;
    }
  });
}

// Add icons
elements.menuAdd.querySelector('.menu-item-icon').innerHTML = addIconSvg;
elements.aboutButton.querySelector('.menu-item-icon').innerHTML = aboutIconSvg;
elements.menuEnter.querySelector('.menu-item-icon').innerHTML = enterIconDisabledSvg;

// VR state
let vr = false;
const toggleVRLabel = () => {
  vr = !vr;
  elements.menuEnter.onmouseleave = () => {
    elements.menuEnterLabel.innerHTML = vr ? 'Exit VR' : 'Enter VR';
  }
}

// Interface methods
const hud = {
  update: (param = {}) => {
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
    for (const key in newState) {
      const handler = newState[key];
      const visible = !!handler;
      const el = elements[key];
      if (visible !== state[key]) {
        el.classList[visible ? 'remove' : 'add']('mod-hidden');
      }
      if (typeof handler === 'function') {
        el.addEventListener('click', (event) => {
          if (key === 'menuEnter' && !hasVR) return;
          handler(event);
        });
      }
    }
  },
  showLoader: (label = 'Just a sec...') => {
    elements.loaderOverlayText.innerHTML = label;
    elements.loaderOverlay.classList.remove('mod-hidden');
  },
  hideLoader: () => {
    elements.loaderOverlay.classList.add('mod-hidden');
  },
  enterVR: () => {
    elements.vrInfoOverlay.classList.add('mod-entering-vr');
    document.body.classList.add('mod-in-vr');
    toggleVRLabel();
  },
  exitVR: () => {
    elements.vrInfoOverlay.classList.remove('mod-entering-vr');
    document.body.classList.remove('mod-in-vr');
    toggleVRLabel();
  },
  elements,
};

export default hud;
