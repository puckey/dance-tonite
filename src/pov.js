import closestHead from './utils/closestHead';
import intersectOrb from './utils/intersectcenter';
import viewer from './viewer';
import InstancedItem from './instanced-item';
import Room from './room';
import layout from './room/layout';
import settings from './settings';

const { holeHeight } = settings;

let pointerX;
let pointerY;

export default function create({ rooms, orb }) {
  let hoverPerformance;
  let hoverOrb;
  //  for some reason position has to be done here as well as in playback
  //  otherwise the positional values begin spiraling into infinity
  function move(progress) {
    const position = layout.getPosition(progress + 0.5);
    position.y += holeHeight;
    position.z *= -1;
    return position;
  }

  function viewFromPerformance(performance) {
    const [index, headIndex] = performance;
    rooms[index].transformToHead(viewer.camera, headIndex);
  }

  function viewFromOrb() {
    viewer.camera.position.z *= -1;
    viewer.camera.rotation.set(0, Math.PI, 0);
  }

  function performHighlight() {
    if (viewer.vrEffect.isPresenting) {
      return;
    }

    if (intersectOrb(pointerX, pointerY)) {
      orb.highlight();
      Room.setHighlight();
    } else {
      orb.unhighlight();
      if (!hoverPerformance && !hoverOrb) {
        Room.setHighlight(
          closestHead(
            pointerX,
            pointerY,
            rooms
          )
        );
      }
    }
  }

  function update(progress) {
    performHighlight();

    const position = move(progress || 0);
    viewer.camera.position.copy(position);
    if (hoverOrb) {
      viewFromOrb();
    } else if (hoverPerformance) {
      viewFromPerformance(hoverPerformance);
    }
  }

  const onMouseMove = ({ clientX, clientY }) => {
    if (viewer.vrEffect.isPresenting) return;
    pointerX = clientX;
    pointerY = clientY;
  };

  const onMouseDown = ({ clientX, clientY, touches }) => {
    if (viewer.vrEffect.isPresenting) return;
    let x = clientX;
    let y = clientY;
    if (touches && touches.length > 0) {
      x = touches[0].pageX;
      y = touches[0].pageY;
    }

    if (intersectOrb(x, y)) {
      hoverPerformance = null;
      hoverOrb = true;
    } else {
      hoverPerformance = closestHead(x, y, rooms);
      if (hoverPerformance[0] === undefined) hoverPerformance = null;
      hoverOrb = false;
    }

    if (hoverPerformance || hoverOrb) {
      setPerformanceView();
    }
  };

  const onMouseUp = () => {
    if (viewer.vrEffect.isPresenting) return;
    hoverPerformance = null;
    hoverOrb = false;
    setOrthographicView();
  };

  function setupInput() {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchstart', onMouseDown, false);
    window.addEventListener('touchend', onMouseUp, false);
  }

  function removeInput() {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('mouseup', onMouseUp);
  }

  function setPerformanceView() {
    viewer.switchCamera('default');
    InstancedItem.group.add(viewer.camera);
  }

  function setOrthographicView() {
    viewer.switchCamera('orthographic');
  }

  return {
    update,
    setupInput,
    removeInput,
  };
}
