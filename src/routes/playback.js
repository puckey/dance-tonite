import fetch from 'unfetch';
import Orb from '../orb';
import audio from '../audio';
import audioSrc from '../public/sound/lcd-14loops.ogg';
import Playlist from '../playlist';
import viewer from '../viewer';
import settings from '../settings';
import aboutContent from '../content/about.md';

const { roomDepth, roomOffset } = settings;

const about = document.createElement('div');
const closeButton = document.createElement('div');

const togglePopover = () => {
  popoverVisible = !popoverVisible;
  about.classList[popoverVisible ? 'remove' : 'add']('mod-hidden');
  audio[popoverVisible ? 'pause' : 'play']();
};

let orb;
let playlist;
let tick;
let popoverVisible = false;

export default {
  hud: {
    menuAdd: true,
    menuEnter: viewer.toggleVR,
    aboutButton: togglePopover,
  },

  mount: () => {
    viewer.switchCamera('orthographic');
    orb = new Orb();

    const moveCamera = (progress) => {
      const z = ((progress - 1.5) * roomDepth) + roomOffset;
      viewer.camera.position.set(0, 1.6, z);
      orb.move(z);
    };

    moveCamera(0);

    playlist = new Playlist('curated', () => {
      tick = () => {
        audio.tick();
        playlist.tick();
        moveCamera(audio.progress);
      };

      // Audio plays after playlist is done loading:
      audio.load({
        src: audioSrc,
        loops: 16,
        progressive: true,
      }, (loadError) => {
        if (loadError) throw loadError;
        audio.play();
        viewer.events.on('tick', tick);
      });
    });

    // Set up about popover
    document.body.appendChild(about);
    about.className = 'about mod-hidden';

    // Fetch content for about popover
    fetch(aboutContent)
      .then(response => response.text())
      .then(data => {
        about.innerHTML = data;

        // Display close button
        closeButton.innerHTML = '&times';
        closeButton.className = 'about-close-button';
        closeButton.addEventListener('click', togglePopover);
        about.appendChild(closeButton);
      });
  },

  unmount: () => {
    audio.reset();
    viewer.events.off('tick', tick);
    orb.destroy();
    playlist.destroy();
  },
};
