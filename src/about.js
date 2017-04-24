import h from 'hyperscript';
import fetch from 'unfetch';
import audio from './audio';
import aboutSrc from './content/about.md';

let visible = false;
let fetched = false;

const toggle = () => {
  visible = !visible;
  document.body.classList[visible ? 'remove' : 'add']('mod-overflow-hidden');
  about.classList[visible ? 'remove' : 'add']('mod-hidden');
  audio[visible ? 'pause' : 'play']();
  if (!fetched) {
    fetched = true;
    fetch(aboutSrc)
      .then(response => response.text())
      .then(data => {
        about.innerHTML = data;
        about.appendChild(closeButton);
      });
  }
};

const about = h('div.about.mod-hidden')
const closeButton = h('div.about-close-button', { onclick: toggle }, '×');
document.body.appendChild(about);

export default { toggle };
