/** @jsx h */
import { Component } from 'preact';
import * as THREE from '../../lib/three';
import deps from '../../deps';
import settings from '../../settings';
import { textColor } from '../../theme/colors';
import viewer from '../../viewer';

export default class VRTitles extends Component {
  constructor() {
    super();

    this.textCreator = deps.SDFText.creator();

    this.clearTitles = this.clearTitles.bind(this);
    this.setPosition = this.setPosition.bind(this);
  }

  componentDidMount() {
    const group = this.group = new THREE.Group();
    group.position.x = -7.0; // TODO.. why is this a magic number?!!?
    group.position.y = settings.holeHeight; // hole height

    this.textLine = this.textCreator.create('', {
      wrapWidth: 5120,
      scale: 9,
      align: 'center',
      color: textColor.getHex(),
      lineHeight: 400,
      mode: 'nowrap',
    });
    group.add(this.textLine);
    viewer.scene.add(this.group);
  }

  componentWillReceiveProps({ titles, position }) {
    if (!titles) {
      this.clearTitles();
      return;
    }
    this.textLine.updateLabel(titles.join('\n').replace('o','@'));
    this.setPosition(position);
  }

  componentWillUnmount() {
    viewer.scene.remove(this.group);
  }

  setPosition(p) {
    if (!p) {
      return;
    }
    this.group.position.z = p.z;
  }

  clearTitles() {
    this.textLine.updateLabel('');
  }
}
