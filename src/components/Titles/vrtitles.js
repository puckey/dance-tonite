import * as THREE from '../../lib/three';
import deps from '../../deps';
import { textColor } from '../../theme/colors';

export default function create() {
  const textCreator = deps.SDFText.creator();

  // const numLines = 3;
  // const textLines = [];

  const group = new THREE.Group();
  const textLine = textCreator.create('', {
    wrapWidth: 1980,
    scale: 4,
    align: 'center',
    vAlign: 'center',
    color: textColor.getHex(),
  });

  textLine.position.y = 1.5;
  group.add(textLine);

  function clearTitles() {
    textLine.updateLabel('');
  }

  function setTitles(titles) {
    if (!titles) {
      clearTitles();
      return;
    }

    const str = titles.reduce(function (fullStr, line) {
      return fullStr + line + '\n';
    }, '');

    textLine.updateLabel(str);
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
