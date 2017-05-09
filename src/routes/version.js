import hud from '../hud';
import { roomColors as colors } from '../theme/colors';

const colorKeys = Object.keys(colors);

export default () => {
  const choices = [
    ['default', 'Default'],
    ['io-daydream', 'IO Daydream'],
    ['io-vive', 'IO Vive'],
  ];
  const choose = ({ id, color }) => {
    if (!id) {
      window.localStorage.removeItem('version');
    } else {
      window.localStorage.setItem('version', id);
    }

    if (!color) {
      window.localStorage.removeItem('color');
    } else {
      window.localStorage.setItem('color', color);
    }

    hud.clear();
    createElements();
  };

  const createElements = () => {
    const activeVersion = window.localStorage.getItem('version') || 'default';
    const activeColor = window.localStorage.getItem('color') || 'default';

    console.log(activeColor);

    hud.create('div.choose-version',
      hud.h('ul',
        choices.map(([id, name]) => (
          hud.h(
            'li.choose-version-button',
            {
              onclick: () => choose({ id }),
              style: activeVersion === id ? 'color: yellow' : null,
            },
            name
          )
        )),
        hud.h('div',
          {
            style: 'padding-top: 1rem',
          },
          hud.h('div.choose-color',
            colorKeys.map(color => (
              hud.h(
                'div.choose-color-button',
                {
                  onclick: () => choose({ color }),
                  style: `background: ${colors[color].getStyle()}; border: ${activeColor === color ? '3px solid white' : '0'}`,
                },
              )
            )),
          ),
          hud.h(
            'a',
            {
              href: '/',
            },
            'Go home'
          )
        ),
      )
    );
  };

  return {
    mount: createElements,
    unmount: () => { },
  };
};
