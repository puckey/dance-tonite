import Tween from 'tween-ticker';
import cubicInOut from 'eases/cubic-out';
import viewer from '../viewer';

const tween = new Tween({
  eases: {
    cubicInOut,
  },
});

viewer.on('tick', tween.tick.bind(tween));

export default function createTweener() {
  let t;
  return (elements, param) => {
    if (t) {
      t.cancel();
    }
    t = tween.to(elements, param);
    if (param.onUpdate) {
      t.on('update', param.onUpdate);
    }
    t.promise = new Promise(resolve => {
      t.on('complete', resolve);
    });
    return t;
  };
}

