import createEmitter from 'mitt';

const emitter = createEmitter();
const prefixes = ['webkit', 'moz', 'ms', 'o'];
const property = (() => {
  if ('hidden' in document) return 'hidden';

  for (let i = 0; i < prefixes.length; i++) {
    const prop = `${prefixes[i]}Hidden`;
    if (prop in document) {
      return prop;
    }
  }

  return null;
})();

if (property) {
  const eventName = `${property.replace(/hidden/i, '')}visibilitychange`;
  document.addEventListener(eventName, () => {
    emitter.emit('change', !document[property]);
  }, false);
}

export default emitter;
