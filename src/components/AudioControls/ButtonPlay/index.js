/** @jsx h */
import { h, Component } from 'preact';

import ButtonItem from '../../ButtonItem';
import audio from '../../../audio';

import iconPlay from './icon-play.svg';
import iconPause from './icon-pause.svg';

export default class ButtonPlay extends Component {
  constructor() {
    super();

    this.state = {
      playing: false,
    };

    this.onPlay = this.setPlaying.bind(this, true);
    this.onPause = this.setPlaying.bind(this, false);
    this.togglePlaying = this.togglePlaying.bind(this);
  }

  componentDidMount() {
    audio.on('play', this.onPlay);
    audio.on('pause', this.onPause);
  }

  componentWillUnmount() {
    audio.off('play', this.onPlay);
    audio.off('pause', this.onPause);
  }

  setPlaying(playing) {
    this.setState({ playing });
  }

  togglePlaying() {
    audio.toggle();
  }

  render(props, { playing }) {
    return (
      <ButtonItem
        onClick={this.togglePlaying}
        icon={playing ? iconPause : iconPlay}
      />
    );
  }
}
