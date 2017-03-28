let running = true;
let looping = false;
let functions;
let onceFunctions;
let lastTime;

function stop() {
  running = false;
}

function loop(timestamp) {
  const delta = lastTime
    ? (timestamp - lastTime)
    : timestamp;
  lastTime = timestamp;
  if (functions) {
    for (let i = 0; i < functions.length; i++) {
      functions[i](delta);
    }
  }
  if (onceFunctions) {
    for (let i = 0; i < onceFunctions.length; i++) {
      onceFunctions[i]();
    }
    if (onceFunctions.length) onceFunctions.length = 0;
  }
  if (running) {
    window.requestAnimationFrame(loop);
  }
}

function start() {
  running = true;
  looping = true;
  window.requestAnimationFrame(loop);
}

function add(func) {
  if (!functions) {
    functions = [];
  }
  functions.push(func);
  if (running && !looping) {
    start();
  }
}

function once(func) {
  if (!onceFunctions) {
    onceFunctions = [];
  }
  onceFunctions.push(func);
}

function removeFromArray(array, thing) {
  const index = array.indexOf(thing);
  if (index !== -1) {
    array.splice(index, 1);
  }
}

function remove(func) {
  if (functions) {
    removeFromArray(functions, func);
  }
  if (onceFunctions) {
    removeFromArray(onceFunctions, func);
  }
}

export default { stop, start, add, remove, once };
