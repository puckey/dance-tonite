/** @jsx h */
import { h, Component } from 'preact';
import './style.scss';

import ButtonItem from '../ButtonItem';
import audio from '../../audio';

import icon from './icon.svg';
import iconDisabled from './icon-disabled.svg';

export default class MuteButton extends Component {
  constructor() {
    super();

    this.state = {
      muted: false,
    };

    this.toggleMute = this.toggleMute.bind(this);
  }

  toggleMute() {
    this.setState({ muted: audio.toggleMute() });
  }

  render(props, { muted }) {
    return (
      <ButtonItem
        onClick={this.toggleMute}
        icon={muted ? iconDisabled : icon}
      />
    );
  }
}
