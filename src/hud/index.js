import router from '../router';
import addIconSvg from './icons/add-icon.svg'
import enterIconSvg from './icons/enter-icon.svg'

const defaultState = {
  menuAdd: false,
  menuEnter: false,
  // aboutButton: true,
};

const elements = {
  menuList: document.querySelector('.menu-list'),
  // aboutButton: document.querySelector('.about-button'),
};

const state = { };

const selectorToRoute = {
  '.menu-item-add': '/record',
};

// Render icons
document.querySelector('.menu-icon-add').innerHTML = addIconSvg;
document.querySelector('.menu-icon-enter').innerHTML = enterIconSvg;

Object.keys(selectorToRoute)
  .forEach((className) => {
    document
      .querySelector(className)
      .addEventListener('click', () => {
        router.navigate(selectorToRoute[className]);
      });
  });

export default (param = {}) => {
  const newState = Object.assign(
    {},
    defaultState,
    param,
  );
  for (const key in newState) {
    const visible = newState[key];
    if (visible !== state[key]) {
      elements[key].classList[visible ? 'remove' : 'add']('mod-hidden');
    }
  }
};
