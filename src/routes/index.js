import router from '../router';
import notFound from './not-found';
import transition from '../transition';
import audio from '../audio';

let current;

const { components, routes } = require(`./routes-${
  process.env.FLAVOR === 'cms' ? 'cms' : 'website'
}`).default;

routes['/*'] = notFound;

export const mount = async (id, req = { params: {} }, event) => {
  const route = routes[id] || components[id];
  if (!route || (event && event.parent())) return;
  if (current) {
    audio.reset();
    current.unmount();
    current = null;
  }

  if (transition.isInside()) {
    await transition.fadeOut();
  }
  current = route(req);
  current.mount();
};

export const installRouter = () => {
  Object
    .keys(routes)
    .forEach((url) => {
      router.get(url, (req, event) => mount(url, req, event));
    });
};
