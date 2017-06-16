import router from '../router';
<<<<<<< HEAD
import playback from './playback';
import record from './record';
import giffer from './giffer';
=======
>>>>>>> master
import notFound from './not-found';
import transition from '../transition';
import hud from '../hud';
import audio from '../audio';

let current;

<<<<<<< HEAD
// const components = { record, playback };
const components = { record, playback, giffer };
const routes = {
  '/record/:loopIndex?/:hideHead?': record,
  '/giffer/:id?': giffer,
  '/:loopIndex?/:id?': playback,
  '/*': notFound,
};
=======
const { components, routes } = require(`./routes-${
  process.env.FLAVOR === 'cms' ? 'cms' : 'website'
}`).default;

routes['/*'] = notFound;
>>>>>>> master

export const mount = async (id, req = { params: {} }, event) => {
  const route = routes[id] || components[id];
  if (!route || (event && event.parent())) return;
  if (current) {
    audio.reset();
    current.unmount();
    hud.clear();
    current = null;
  }

  hud.hideLoader();
  if (transition.isInside()) {
    await transition.fadeOut();
  }
  current = route(req);
  current.mount();
  hud.update(current.hud);
};

export const installRouter = () => {
  Object
    .keys(routes)
    .forEach((url) => {
      router.get(url, (req, event) => mount(url, req, event));
    });
};
