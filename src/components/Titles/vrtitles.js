import * as THREE from '../../lib/three';
import deps from '../../deps';
import settings from '../../settings';
import { textColor } from '../../theme/colors';

export default function create() {
  const textCreator = deps.SDFText.creator();

  const group = new THREE.Group();
  group.position.x = -3.75; // TODO.. why is this a magic number?!!?
  group.position.y = settings.holeHeight; // hole height

  const textLine = textCreator.create('', {
    wrapWidth: 1980,
    scale: 9,
    align: 'center',
    color: textColor.getHex(),
    lineHeight: 400,
  });
  group.add(textLine);

  function clearTitles() {
    textLine.updateLabel('');
  }

  function setTitles(titles) {
    if (!titles) {
      clearTitles();
      return;
    }
    textLine.updateLabel(titles.join('\n'));
  }

  function setPosition(p) {
    if (!p) {
      return;
    }
    this.group.position.z = p.z;
  }

  return {
    setTitles,
    setPosition,
    group,
  };
}
