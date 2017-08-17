/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/** @jsx h */
import { h, Component } from 'preact';
import './style.scss';

import windowSize from '../../utils/windowSize';
import Title from '../Title';

const getLineTransform = (x1, y1, x2, y2) => {
  const margin = windowSize.height * 0.06;
  const length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) - (margin * 1.5);
  const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  return `translate(${x1}px, ${y1 + margin * 0.5}px) rotate(${angle}deg) scaleX(${length / 100})`;
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
      originY: this.state.textEl && this.state.textEl.offsetHeight,
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
            <div ref={this.receiveTextElement} className="line-title-wrapper">
              <Title>{ text }</Title>
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
                    y
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
