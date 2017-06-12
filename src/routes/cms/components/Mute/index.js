/** @jsx h */
import { h } from 'preact';
import './style.scss';
import MenuItem from '../MenuItem';
import audio from '../../../../audio';
import speakerIconSvg from '../../../../hud/icons/speaker.svg';
import speakerMuteIconSvg from '../../../../hud/icons/mute_speaker.svg';

export default class MuteButton extends MenuItem {
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
      <div
        className="cms-menu-item"
        dangerouslySetInnerHTML={{ __html: muted ? speakerMuteIconSvg : speakerIconSvg }}
        onClick={this.toggleMute}
      />
    );
  }
}
