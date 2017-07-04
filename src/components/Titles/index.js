/** @jsx h */
import { h, Component } from 'preact';
import classNames from 'classnames';

import './style.scss';
import keyframes from './keyframes';

import createTimeline from '../../lib/timeline';
import audio from '../../audio';
import viewer from '../../viewer';

export default class Titles extends Component {
  constructor() {
    super();

    const timeline = this.timeline = createTimeline(keyframes);

    timeline.on('keyframe', ({ titles, colophon = false, small }) => {
      this.setState({ titles, small });
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

  render(props, { titles, small }) {
    return titles && (
      <div className={classNames('titles', small && 'mod-small')}>
        {this.renderTitles()}
      </div>
    );
  }
}
