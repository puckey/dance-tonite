import router from '../router';
import playback from './playback';
import record from './record';
import plane from './plane';
import version from './version';
import notFound from './not-found';
import transition from '../transition';
import hud from '../hud';
import audio from '../audio';
import feature from '../utils/feature';

let current;

const routes = {
  '/version': version,
  '/plane': plane,
  '/record/:loopIndex?/:hideHead?': record,
  '/:loopIndex?/:id?': playback,
  '/*': notFound,
};

// #googleIO2017: redirect from homepage to record mode on first load:
if (feature.isIOVive && window.location.pathname === '/') {
  window.location = '/record';
}

export default () => {
  Object
    .keys(routes)
    .forEach((url) => {
      router.get(url, async (req, event) => {
        const route = routes[url];
        if (!route || event.parent()) return;
        if (current) {
          audio.fadeOut();
          current.unmount();
          hud.clear();
          current = null;
        }

        hud.hideLoader();
        if (transition.isInside()) {
          await transition.fadeOut();
        } else {
          transition.reset();
        }
        current = route(req);
        current.mount();
        hud.update(current.hud);
      });
    });
};
