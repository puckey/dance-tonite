/** @jsx h */
import { h, Component } from 'preact';
import './style.scss';
import audio from '../../../../audio';
import speakerIconSvg from '../../../../hud/icons/speaker.svg';
import speakerMuteIconSvg from '../../../../hud/icons/mute_speaker.svg';

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
      <div
        className="menu-item-icon mod-fill mod-no-stroke"
        dangerouslySetInnerHTML={{ __html: muted ? speakerMuteIconSvg : speakerIconSvg }}
        onClick={this.toggleMute}
      />
    );
  }
}
