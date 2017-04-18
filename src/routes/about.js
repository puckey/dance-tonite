import fetch from 'unfetch';
import router from '../router';
import content from '../content/about.md';

const about = document.createElement('div');
const closeButton = document.createElement('div');

const navigate = () => {
  router.navigate('/');
}

export default {
  mount: () => {
    // Set up root element
    document.body.appendChild(about);
    about.className = 'about';

    // Fetch content
    fetch(content)
      .then(response => response.text())
      .then(data => {
        about.innerHTML = data;

        // Display close button
        closeButton.innerHTML = '&times';
        closeButton.className = 'about-close-button';
        closeButton.addEventListener('click', navigate);
        about.appendChild(closeButton);
      });
  },

  unmount: () => {
    about.className += ' mod-closing';
    about.parentNode.removeChild(about);
    closeButton.removeEventListener('click', navigate);
  },
};
