/** @jsx h */
import { h } from 'preact';
import classNames from 'classnames';

import './style.scss';
import iconVR from './icon-vr-experiments.svg';
import iconFriends from './icon-friends-of-google.svg';

export default function Colophon({ className }) {
  return (
    <div className={classNames('colophon', className)}>
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
