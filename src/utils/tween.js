import Tween from 'tween-ticker';
import cubicInOut from 'eases/cubic-out';
import viewer from '../viewer';

const tween = new Tween({
  eases: {
    cubicInOut,
  },
});

viewer.events.on('tick', tween.tick.bind(tween));

export default (elements, param) => {
  const t = tween.to(elements, param);
  t.promise = new Promise(resolve => {
    t.on('complete', resolve);
  });
  return t;
};
