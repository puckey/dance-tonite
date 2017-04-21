import router from '../router';
import addIconSvg from './icons/addvr.svg';
import enterIconSvg from './icons/entervr.svg';
import enterIconDisabledSvg from './icons/x_entervr.svg';
import aboutIconSvg from './icons/about.svg';

const defaultState = {
  menuAdd: false,
  menuEnter: false,
  aboutButton: false,
};

const elements = {
  menuAdd: document.querySelector('.menu-item-add'),
  menuEnter: document.querySelector('.menu-item-enter'),
  aboutButton: document.querySelector('.about-button'),
};

const state = { };

const selectorToRoute = {
  '.menu-item-add': '/record',
};

// Check if VR device is connected
if (typeof navigator.getVRDevices === 'function') {
  navigator.getVRDevices().then(devices => {
    if (devices.length > 0) {
      elements.menuEnter.querySelector('.menu-item-label').innerHTML = 'Enter VR';
      elements.menuEnter.querySelector('.menu-item-icon').innerHTML = enterIconSvg;
    }
  });
}

elements.menuAdd.querySelector('.menu-item-icon').innerHTML = addIconSvg;
elements.aboutButton.querySelector('.menu-item-icon').innerHTML = aboutIconSvg;
elements.menuEnter.querySelector('.menu-item-icon').innerHTML = enterIconDisabledSvg;

Object.keys(selectorToRoute)
  .filter(className => !!selectorToRoute[className])
  .forEach(className => {
    document
      .querySelector(className)
      .addEventListener('click', () => {
        router.navigate(selectorToRoute[className]);
      });
  });

export default {
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
      if (typeof handler === 'function') {
        el.addEventListener('click', handler);
      }
      if (visible !== state[key]) {
        el.classList[visible ? 'remove' : 'add']('mod-hidden');
      }
    }
  },
  elements,
};
