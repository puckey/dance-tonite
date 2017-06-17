/** @jsx h */
import { Component } from 'preact';

import { Group } from '../../lib/three';
import * as SDFText from '../../sdftext';
import viewer from '../../viewer';
import settings from '../../settings';

const textCreator = SDFText.creator();
const subtitleItem = textCreator.create('', {
  scale: 2.25,
  align: 'center',
  color: settings.textColor,
  mode: 'nowrap',
});

const mainItem = textCreator.create('', {
  scale: 7.5,
  align: 'center',
  color: settings.textColor,
  mode: 'nowrap',
});
mainItem.position.y = -0.65;

export default class RecordInstructions extends Component {
  constructor() {
    super();

    const group = this.group = new Group();
    group.name = 'Instructions';
    group.add(subtitleItem, mainItem);
    group.position.set(0, 2, -4);

    this.state = {
      main: '',
      subtitle: '',
    };
  }

  componentDidMount() {
    this.mounted = true;
    viewer.scene.add(this.group);
    const { subtitle, main } = this.props;
    if (subtitle) {
      subtitleItem.updateLabel(subtitle);
    }
    if (main) {
      mainItem.updateLabel(main);
    }
  }

  shouldComponentUpdate({ subtitle, main }) {
    const {
      subtitle: curSubtitle,
      main: curMain,
    } = this.props;
    if (curSubtitle !== subtitle) {
      subtitleItem.updateLabel(subtitle || '');
    }
    if (curMain !== main) {
      mainItem.updateLabel(main || '');
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    viewer.scene.remove(this.group);
  }
}
