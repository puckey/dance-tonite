/** @jsx h */
import { h, Component } from 'preact';

import viewer from '../../viewer';
import windowSize from '../../utils/windowSize';
import audio from '../../audio';
import settings from '../../settings';

import './style.scss';

const getRatio = event => event.clientX / windowSize.width;

export default class ProgressBar extends Component {
  constructor() {
    super();
    // set initial time:
    this.state = { };
    this.targetRatio = 0;
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.tick = this.tick.bind(this);
  }

  componentDidMount() {
    viewer.events.on('tick', this.tick);
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillUnmount() {
    viewer.events.off('tick', this.tick);
  }

  onMouseMove(event) {
    this.moveRatio = getRatio(event);
    event.stopPropagation();
  }

  onMouseLeave() {
    this.moveRatio = null;
  }

  onClick(event) {
    audio.gotoTime(audio.duration * getRatio(event));
    event.stopPropagation();
  }

  onMouseDown(event) {
    event.stopPropagation();
  }

  tick() {
    if (audio.progress === undefined) return;
    const ratio = this.moveRatio || (audio.progress / settings.totalLoopCount);
    const targetRatio = this.targetRatio = this.targetRatio * 0.8 + ratio * 0.2;
    this.progressEl.style.transform = `scaleX(${targetRatio})`;
  }

  render() {
    return (
      <div
        className="audio-progress-bar-container"
        onMouseDown={this.onMouseDown}
        onClick={this.onClick}
        onMouseLeave={this.onMouseLeave}
        onMouseMove={this.onMouseMove}
      >
        <div
          className="audio-progress-bar"
          ref={(el) => { this.progressEl = el; }}
        />
      </div>
    );
  }
}

