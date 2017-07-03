/** @jsx h */
import { h, Component } from 'preact';
import Portal from 'preact-portal';

import './style.scss';

import Align from '../Align';
import ButtonClose from '../ButtonClose';
import Colophon from '../Colophon';
import feature from '../../utils/feature';
import audio from '../../audio';
import aboutSrc from './content.md';

let content;

export default class About extends Component {
  constructor() {
    super();
    this.state = {};
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
          <Align type="top-right">
            <ButtonClose onClick={this.props.onClose} dark />
          </Align>
          { content && (
            <div
              className="about-content"
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
