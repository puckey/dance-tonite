/** @jsx h */
import { h, Component } from 'preact';
import classNames from 'classnames';

import './style.scss';
import iconVR from './icon-vr-experiments.svg';
import iconFriends from './icon-friends-of-google.svg';

export default class Colophon extends Component {
  shouldComponentUpdate({ hide }) {
    return hide !== this.props.hide;
  }

  render({ hide }) {
    return (
      <div className={classNames('colophon', hide && 'mod-hidden')}>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://webvrexperiments.com/"
          dangerouslySetInnerHTML={{ __html: iconVR }}
        />
        <div className="colophon-divider" />
        <span
          dangerouslySetInnerHTML={{ __html: iconFriends }}
        />
      </div>
    );
  }
}
