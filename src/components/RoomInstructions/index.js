/** @jsx h */
import { Component } from 'preact';

import { Group } from '../../third_party/three';
import viewer from '../../viewer';
import { textColor } from '../../theme/colors';
import deps from '../../deps';

let subtitleItem;
let mainItem;

export default class RecordInstructions extends Component {
  constructor() {
    super();

    if (!subtitleItem) {
      const textCreator = deps.SDFText.creator();

      const textSettings = {
        align: 'center',
        color: textColor.getHex(),
        mode: 'nowrap',
      };

      subtitleItem = textCreator.create('', {
        ...textSettings,
        scale: 2.25,
      });

      mainItem = textCreator.create('', {
        ...textSettings,
        scale: 7.5,
      });

      mainItem.position.y = -0.65;
    }

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
    const { subtitle = '', main = '' } = this.props;
    subtitleItem.updateLabel(subtitle);
    mainItem.updateLabel(main);
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
