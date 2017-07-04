/** @jsx h */
import { h, Component } from 'preact';
import './style.scss';

import windowSize from '../../utils/windowSize';

const getLineTransform = (x1, y1, x2, y2) => {
  const margin = windowSize.height * 0.04;
  const length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) - margin;
  const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  return `translate(${x1}px, ${y1}px) rotate(${angle}deg) scaleX(${length / 100})`;
};

export default class LineTitle extends Component {
  constructor() {
    super();
    this.style = {};
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.receiveTextElement = this.receiveTextElement.bind(this);
  }

  componentWillMount() {
    windowSize.on('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    windowSize.off('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions({ width }) {
    this.setState({
      originX: width * 0.5,
      originY: this.state.textEl && this.state.textEl.offsetHeight * 1.2,
    });
  }

  receiveTextElement(textEl) {
    this.setState({ textEl });
    setTimeout(() => {
      this.updateWindowDimensions(windowSize);
    });
  }

  render({ x, y, text, children, visible }, { originX, originY }) {
    const hidden = x == null;
    return (
      <div className="line-title">
        {
          visible && (
            <div
              className="line-title-text"
              ref={this.receiveTextElement}
            >
              <span>{ text }</span>
            </div>
          )
        }
        {
          visible && (
            <div
              className="line-title-line"
              style={{
                transform: !hidden
                  && getLineTransform(
                    originX,
                    originY,
                    x,
                    y,
                    windowSize.height * 0.04
                  ),
                opacity: hidden ? 0 : 1,
              }}
            />
          )
        }
        { children }
      </div>
    );
  }
}
