import hud from '../hud';

export default () => {
  const choices = [
    ['default', 'Default'],
    ['io-daydream', 'IO Daydream'],
    ['io-vive', 'IO Vive'],
  ];

  const choose = (id) => {
    if (!id) {
      window.localStorage.removeItem('version');
    } else {
      window.localStorage.setItem('version', id);
    }
    hud.clear();
    createElements();
  };

  const createElements = () => {
    const activeVersion = window.localStorage.getItem('version') || 'default';

    hud.create('div.choose-version',
      {
        style: `
          color: white;
          position:absolute;
          z-index: 20;
          width: 100vw;
          margin: 1rem;
          cursor: pointer;
        `,
      },
      hud.h('ul',
        choices.map(([id, name]) => (
          hud.h(
            'li.choose-version-button',
            {
              onclick: () => choose(id),
              style: activeVersion === id ? 'color: yellow' : null,
            },
            name
          )
        )),
        hud.h('div',
          {
            style: 'padding-top: 1rem',
          },
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

