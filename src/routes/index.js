import router from '../router';
import playback from './playback';
import record from './record';
import notFound from './not-found';
import hud from '../hud';
import audio from '../audio';

let current;

const routes = {
  '/': playback,
  '/record': record,
  '/*': notFound,
};

router.on('navigate', () => {
  if (current) {
    audio.fadeOut();
    current.unmount();
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
        hud(route.hud);
        current = route;
      });
    });
};
