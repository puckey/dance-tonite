import Tween from 'tweenr';

const tween = Tween();

export default (elements, param, onTick) => {
  const t = tween.to(elements, param);
  if (onTick) t.on('update', onTick);
  t.promise = new Promise(resolve => {
    t.on('complete', resolve);
  });
  return t;
};
