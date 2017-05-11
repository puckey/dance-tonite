import hud from '../hud';
import { roomColors as colors } from '../theme/colors';

const colorKeys = Object.keys(colors);

export default () => {
  const choices = [
    ['default', 'Default'],
    ['io-daydream', 'IO Daydream'],
    ['io-vive', 'IO Vive'],
  ];

  const setOrRemove = (name, value) => {
    if (!value) {
      window.localStorage.removeItem(name);
    } else {
      window.localStorage.setItem(name, value);
    }
  };

  const render = () => {
    hud.clear();
    const activeVersion = window.localStorage.getItem('version');
    const activeColor = window.localStorage.getItem('color');

    hud.create('div.choose-version',
      hud.h('ul',
        choices.map(([version, name]) => (
          hud.h(
            'li.choose-version-button',
            {
              onclick: () => {
                setOrRemove('version', version);
                render();
              },
              style: activeVersion === version ? 'color: yellow' : null,
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
                  onclick: () => {
                    setOrRemove('color', color === activeColor
                      ? null
                      : color);
                    render();
                  },
                  style: `
                    background: ${colors[color].getStyle()};
                    border: ${activeColor === color ? '3px solid white' : '0'};
                  `,
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
    mount: render,
    unmount: () => { },
  };
};
