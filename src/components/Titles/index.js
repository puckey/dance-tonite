/** @jsx h */
import { h, Component } from 'preact';
import classNames from 'classnames';

import './style.scss';
import keyframes from './keyframes';

import createTimeline from '../../lib/timeline';
import audio from '../../audio';
import viewer from '../../viewer';
import createVRTitles from './vrtitles';

export default class Titles extends Component {
  constructor() {
    super();

    this.vrTitles = createVRTitles();

    const timeline = this.timeline = createTimeline(keyframes);

    timeline.on('keyframe', ({ titles, colophon = false, small, position }) => {
      this.vrTitles.setTitles(titles);
      this.vrTitles.setPosition(position);
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
    viewer.scene.add(this.vrTitles.group);
  }

  componentWillUnmount() {
    viewer.off('tick', this.tick);
    viewer.scene.remove(this.vrTitles.group);
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
