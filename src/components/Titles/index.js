/** @jsx h */
import { h, Component } from 'preact';
import './style.scss';
import createTimeline from '../../lib/timeline';
import keyframes from './keyframes';

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
    this.props.viewer.events.on('tick', this.tick);
  }

  componentWillUnmount() {
    this.props.viewer.events.off('tick', this.tick);
  }

  tick() {
    this.timeline.tick(this.props.audio.time);
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
