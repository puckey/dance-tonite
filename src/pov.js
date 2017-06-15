import closestHead from './utils/closestHead';
import intersectCenter from './utils/intersectcenter';
import viewer from './viewer';
import InstancedItem from './instanced-item';
import Room from './room';
import layout from './room/layout';
import settings from './settings';

const { holeHeight } = settings;

let pointerX;
let pointerY;

export default function create(orb, playlist) {
  let hoverPerformance;

  function move(progress) {
    const position = layout.getPosition(progress + 0.5);
    position.y += holeHeight;
    position.z *= -1;
    orb.position.copy(position);
    return position;
  }

  function viewFromPerformance(performance) {
    const [index, headIndex] = performance;
    playlist.rooms[index].transformToHead(viewer.camera, headIndex);
  }

  function update(progress) {
    if (!viewer.vrEffect.isPresenting) {
      if (intersectCenter(pointerX, pointerY)) {
        orb.highlight();
        Room.setHighlight();
      } else {
        orb.unhighlight();
        if (!hoverPerformance) {
          Room.setHighlight(
            closestHead(
              pointerX,
              pointerY,
              playlist.rooms
            )
          );
        }
      }
    }

    const position = move(progress || 0);
    viewer.camera.position.copy(position);
    if (hoverPerformance) {
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

    if (intersectCenter(x, y)) {
      viewer.switchCamera('default');
      hoverPerformance = null;
      // viewer.camera.rotation.set(0, Math.PI, 0);
    } else {
      hoverPerformance = closestHead(x, y, playlist.rooms);
      if (hoverPerformance[0] === undefined) hoverPerformance = null;
    }

    if (hoverPerformance) {
      setPerformanceView();
    }
  };

  const onMouseUp = () => {
    if (viewer.vrEffect.isPresenting) return;
    hoverPerformance = null;
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
    if (process.env.FLAVOR === 'cms') {
      document.querySelectorAll('.room-label')
        .forEach(room => room.classList.add('mod-hidden'));
    }
    InstancedItem.group.add(viewer.camera);
  }

  function setOrthographicView() {
    viewer.switchCamera('orthographic');
    if (process.env.FLAVOR === 'cms') {
      document.querySelectorAll('.room-label')
        .forEach(room => room.classList.remove('mod-hidden'));
    }
  }

  move(0);

  return {
    update,
    setupInput,
    removeInput,
  };
}
