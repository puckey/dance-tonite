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
import Portal from 'preact-portal';

import './style.scss';

import ButtonClose from '../ButtonClose';
import Colophon from '../Colophon';
import feature from '../../utils/feature';
import audio from '../../audio';
import router from '../../router';
import aboutSrc from './content.md';

let content;

export default class About extends Component {
  constructor() {
    super();
    this.state = {};
    this.receiveContentElement = this.receiveContentElement.bind(this);
  }

  componentWillMount() {
    this.mounted = true;
    const classList = document.body.classList;
    classList.remove('mod-overflow-hidden');
    classList.add('mod-about');
    if (feature.isMobile) {
      audio.pause();
    } else {
      audio.fadeOut().then(() => {
        if (this.mounted) {
          audio.pause();
        }
      });
    }
    this.asyncMount();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.content !== this.state.content;
  }

  componentWillUnmount() {
    this.mounted = false;
    const classList = document.body.classList;
    classList.add('mod-overflow-hidden');
    classList.remove('mod-about');
    audio.play();
  }

  receiveContentElement(el) {
    if (!el) return;

    setTimeout(() => {
      el.querySelector('.gallery-link').addEventListener(
        'click',
        () => {
          this.props.onClose();
          router.navigate('/gallery/');
        }
      );
    });
  }

  async asyncMount() {
    if (!content) {
      const response = await fetch(aboutSrc, {
        credentials: 'same-origin',
      });
      content = await response.text();
      content = content.replace(/<a\s+href="http(s)*:\/\//gi, '<a target="_blank" href="http://');
    }
    if (!this.mounted) return;
    this.setState({ content });
  }

  render() {
    return (
      <Portal into="body">
        <div className="about">
          <ButtonClose onClick={this.props.onClose} dark />
          { content && (
            <div
              className="about-content"
              ref={this.receiveContentElement}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
          { content && (
            <div className="about-content mod-colophon">
              <Colophon />
              <div className="privacy-and-terms">
                <a href="https://www.google.com/policies/privacy/" target="_blank" rel="noreferrer noopener">Privacy</a> | <a href="https://www.google.com/policies/terms/" target="_blank" rel="noreferrer noopener">Terms</a>
              </div>
            </div>
          )
          }
        </div>
      </Portal>
    );
  }
}
