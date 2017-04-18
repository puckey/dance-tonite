import router from '../router';
import playback from './playback';
import record from './record';
import about from './about';
import notFound from './not-found';
import hud from '../hud';
import audio from '../audio';
import Room from '../room';

let current;

const routes = {
  '/': playback,
  '/record': record,
  '/about': about,
  '/*': notFound,
};

router.on('navigate', () => {
  if (current) {
    audio.fadeOut();
    current.unmount();
    Room.reset();
    current = null;
  }
});

export default () => {
  Object
    .keys(routes)
    .forEach((url) => {
      router.get(url, (req, event) => {
        const route = routes[url];
        if (!route || event.parent()) return;
        route.mount(req);
        hud.update(route.hud);
        current = route;
      });
    });
};
