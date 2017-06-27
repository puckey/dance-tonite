/** @jsx h */
import { h, Component } from 'preact';
import './style.scss';
import keyframes from './keyframes';

import createTimeline from '../../lib/timeline';
import audio from '../../audio';
import viewer from '../../viewer';

export default class Titles extends Component {
  constructor() {
    super();

    const timeline = this.timeline = createTimeline(keyframes);

    timeline.on('keyframe', ({ titles, colophon }) => {
      this.setState({ titles });
      this.props.onUpdate(titles, colophon);
    });

    this.state = {
      titles: null,
    };

    this.tick = this.tick.bind(this);
  }

  componentDidMount() {
    viewer.on('tick', this.tick);
  }

  componentWillUnmount() {
    viewer.off('tick', this.tick);
  }

  tick() {
    this.timeline.tick(audio.time);
  }

  renderTitles() {
    return this.state.titles.map(title => (
      <div className="titles-title">
        {title}
      </div>
    ));
  }

  render() {
    return this.state.titles && (
      <div className="titles">{this.renderTitles()}</div>
    );
  }
}
