import fetch from 'unfetch';
import audio from './audio';
import aboutSrc from './content/about.md';

let visible = false;

const about = document.createElement('div');
about.className = 'about mod-hidden';
document.body.appendChild(about);

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

        // Display close button
        about.appendChild(closeButton);
      });
  }
};

const closeButton = document.createElement('div');
closeButton.innerHTML = '&times';
closeButton.className = 'about-close-button';
closeButton.addEventListener('click', toggle);

export default { toggle };
