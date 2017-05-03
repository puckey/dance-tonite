import router from '../router';
import playback from './playback';
import record from './record';
import plane from './plane';
import notFound from './not-found';
import transition from '../transition';
import hud from '../hud';
import audio from '../audio';
import Room from '../room';

let current;

const routes = {
  '/record/:roomIndex?': record,
  '/:id?': playback,
  '/plane': plane,
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
      router.get(url, async (req, event) => {
        const route = routes[url];
        if (!route || event.parent()) return;
        hud.hideLoader();
        await transition.exit({ immediate: true });
        route.mount(req);
        hud.update(route.hud);
        current = route;
      });
    });
};
