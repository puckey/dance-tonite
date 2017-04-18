import router from '../router';
import addIconSvg from './icons/addvr.svg';
import enterIconSvg from './icons/entervr.svg';
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
  '.about-button': '/about',
};

// Add icons
document.querySelector('.menu-item-add .menu-item-icon').innerHTML = addIconSvg;
document.querySelector('.menu-item-enter .menu-item-icon').innerHTML = enterIconSvg;
document.querySelector('.about-button .menu-item-icon').innerHTML = aboutIconSvg;

Object.keys(selectorToRoute)
  .forEach((className) => {
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
