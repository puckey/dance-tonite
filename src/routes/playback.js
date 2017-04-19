import fetch from 'unfetch';
import Orb from '../orb';
import audio from '../audio';
import audioSrc from '../public/sound/lcd-14loops.ogg';
import Playlist from '../playlist';
import viewer from '../viewer';
import settings from '../settings';
import aboutContent from '../content/about.md';

const { roomDepth, roomOffset } = settings;

const togglePopover = () => {
  popoverVisible = !popoverVisible;
  about.classList[popoverVisible ? 'remove' : 'add']('mod-hidden');
  audio[popoverVisible ? 'pause' : 'play']();
  // Fetch content for about popover
  fetch(aboutContent)
    .then(response => response.text())
    .then(data => {
      about.innerHTML = data;

      // Display close button
      about.appendChild(closeButton);
    });
};

const about = document.createElement('div');
document.body.appendChild(about);
about.className = 'about mod-hidden';

const closeButton = document.createElement('div');
closeButton.innerHTML = '&times';
closeButton.className = 'about-close-button';
closeButton.addEventListener('click', togglePopover);

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
  
  mount: (req) => {
    viewer.switchCamera('orthographic');
    orb = new Orb();

    const moveCamera = (progress) => {
      const z = ((progress - 1.5) * roomDepth) + roomOffset;
      viewer.camera.position.set(0, 1.6, z);
      orb.move(z);
    };

    moveCamera(0);
    playlist = new Playlist({
      url: 'curated.json',
      pathRecording: req.params.id,
    }, () => {
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
  },

  unmount: () => {
    audio.reset();
    viewer.events.off('tick', tick);
    orb.destroy();
    playlist.destroy();
  },
};
