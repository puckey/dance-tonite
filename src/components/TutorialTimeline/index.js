/** @jsx h */
import { h, Component } from 'preact';
import './style.scss';

import viewer from '../../viewer';
import windowSize from '../../utils/windowSize';

import AudioTimeline from '../AudioTimeline';
import { worldToScreen } from '../../utils/three';
import audio from '../../audio';

const getLineTransform = (x1, y1, x2, y2, margin) => {
  const length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) - margin;
  const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  return `translate(${x1}px, ${y1}px) rotate(${angle}deg) scaleX(${length / 100})`;
};

export default class TutorialTimeline extends Component {
  constructor() {
    super();
    this.performUpdateTutorial = this.performUpdateTutorial.bind(this);
    this.tick = this.tick.bind(this);
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.receiveTextElement = this.receiveTextElement.bind(this);
    this.getTime = this.getTime.bind(this);
  }

  componentWillMount() {
    const getHeadPosition = (index) => (
        this.context.room &&
        this.context.room.getHeadPosition(
          index !== undefined
            ? index
            : this.context.room.frame.count - 1
        )
    );
    this.keyframes = [
      {
        time: 0.5,
        text: 'This is you.',
        getPosition: getHeadPosition.bind(this),
        layers: 1,
      },
      {
        time: 5,
        text: 'This is the camera.',
        getPosition: () => this.context.orb && this.context.orb.position,
      },
      {
        time: 8,
        text: 'Dance!',
      },
      {
        time: 10.5,
        text: '(Try to avoid bumping into the camera)',
        getPosition: null,
      },
      {
        time: 13.5,
        text: '',
        getPosition: null,
      },
      {
        time: 14,
        getPosition: getHeadPosition.bind(this),
        text: 'This is you...',
      },
      {
        time: 17,
        text: 'This is your previous recording.',
        getPosition: getHeadPosition.bind(this, 0),
      },
      {
        time: 24,
        text: 'Dance together!',
      },
      {
        time: 32,
        text: 'Add up to 10 copies of yourself.',
        layers: 3,
      },
      {
        time: 33,
        text: 'Add up to 10 copies of yourself.',
        layers: 4,
      },
      {
        time: 34,
        text: 'Add up to 10 copies of yourself.',
        layers: 5,
      },
      {
        time: 38,
        text: '',
        ended: true,
      },
    ];
    viewer.on('tick', this.tick);
    windowSize.on('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    viewer.off('tick', this.tick);
    windowSize.off('resize', this.updateWindowDimensions);
  }

  getTime() {
    return audio.totalTime % 48;
  }

  tick() {
    const { lineOriginX, lineOriginY } = this.state;
    if (this.getLineTarget && lineOriginX !== undefined) {
      const target = this.getLineTarget();
      if (!target) return;
      const { x, y } = worldToScreen(viewer.camera, target);
      this.setState({
        lineStyle: {
          transform: getLineTransform(
            lineOriginX,
            lineOriginY,
            x,
            y,
            windowSize.height * 0.04
          ),
        },
      });
    } else {
      this.setState({
        lineStyle: {
          opacity: 0,
        },
      });
    }
  }

  receiveTextElement(textEl) {
    this.setState({ textEl });
    setTimeout(() => {
      this.updateWindowDimensions(windowSize);
    });
  }

  updateWindowDimensions({ width }) {
    this.setState({
      lineOriginX: width * 0.5,
      lineOriginY: this.state.textEl && this.state.textEl.offsetHeight * 1.2,
    });
  }

  performUpdateTutorial({ text, getPosition, layers, ended }) {
    if (ended) {
      this.props.onEnd();
    }
    // just !text would return true on empty string, so:
    if (text !== undefined) {
      this.setState({ text });
    }
    this.getLineTarget = getPosition;
    if (layers !== undefined) {
      this.props.onUpdateLayers(layers);
    }
  }

  render() {
    return (
      <div className="tutorial">
        <div
          className="tutorial-text"
          ref={this.receiveTextElement}
        >
          { this.state.text }
        </div>
        {
          <div
            className="tutorial-line"
            style={this.state.lineStyle}
          />
        }
        <AudioTimeline
          keyframes={this.keyframes}
          getTime={this.getTime}
          callback={this.performUpdateTutorial}
        />
      </div>
    );
  }
}
