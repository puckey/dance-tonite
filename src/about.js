import h from 'hyperscript';
import fetch from 'unfetch';
import audio from './audio';
import aboutSrc from './content/about.md';

let visible = false;
let fetched = false;

const toggle = async () => {
  visible = !visible;
  document.body.classList[visible ? 'remove' : 'add']('mod-overflow-hidden');
  about.classList[visible ? 'remove' : 'add']('mod-hidden');
  if (visible) {
    audio.fadeOut().then(() => {
      if (visible) {
        audio.pause();
      }
    });
  } else {
    audio.play();
    audio.fadeIn(0.5);
  }
  if (!fetched) {
    fetched = true;
    const response = await fetch(aboutSrc, {
      credentials: 'include',
    });
    const data = await response.text();
    about.innerHTML = data;
    about.appendChild(closeButton);
  }
};

const about = h('div.about.mod-hidden');
const closeButton = h('div.close-button', { onclick: toggle }, '×');
document.body.appendChild(about);

export default { toggle };
