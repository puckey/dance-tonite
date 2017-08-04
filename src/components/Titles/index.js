/** @jsx h */
import { h, Component } from 'preact';
import classNames from 'classnames';

import './style.scss';
import keyframes from './keyframes';

import createTimeline from '../../third_party/timeline';
import audio from '../../audio';
import viewer from '../../viewer';
import VRTitles from '../VRTitles';

export default class Titles extends Component {
  constructor() {
    super();

    const timeline = this.timeline = createTimeline(keyframes);

    timeline.on('keyframe', (param) => {
      this.setState(param);
      this.props.onUpdate(param);
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

  render(props, { titles, small, position }) {
    return (
        !viewer.vrEffect.isPresenting ?
          titles &&
            <div className={classNames('titles', small && 'mod-small')}>
              { this.renderTitles() }
            </div>
          :
          <VRTitles titles={titles} small={small} position={position} />
    );
  }
}
