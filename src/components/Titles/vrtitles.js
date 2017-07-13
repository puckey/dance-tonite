import * as THREE from '../../lib/three';
import deps from '../../deps';
import { textColor } from '../../theme/colors';

export default function create() {
  const textCreator = deps.SDFText.creator();

  const numLines = 3;
  const textLines = [];
  const group = new THREE.Group();
  for (let i = 0; i < numLines; i++) {
    const textLine = textCreator.create('', {
      wrapWidth: 1980,
      scale: 4,
      align: 'center',
      color: textColor.getHex(),
    });
    textLines.push(textLine);
    group.add(textLine);
    textLine.position.y = 2 - i * 0.5;
  }

  function clearTitles() {
    textLines.forEach(function (textLine) {
      textLine.updateLabel('');
    });
  }

  function setTitles(titles) {
    if (!titles) {
      clearTitles();
      return;
    }
    textLines.forEach(function (textLine, index) {
      const title = titles[index];
      if (title !== undefined) {
        textLine.updateLabel(title);
      } else {
        textLine.updateLabel('');
      }
    });
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
