import router from './router';

const defaultState = {
  menuList: false,
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
