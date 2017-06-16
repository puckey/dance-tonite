/** @jsx h */
import { h } from 'preact';
import classNames from 'classnames';
import './style.scss';

export default ({ children, type, rows }) => (
  <div
    className={classNames(
      'aligner',
      `mod-${type}`,
      !!rows && 'mod-rows'
    )}
  >
    {children}
  </div>
);
