/** @jsx h */
import { h } from 'preact';
import classNames from 'classnames';
import './style.scss';

export default ({ children, type, rows, margin }) => (
  <div
    className={classNames(
      'aligner',
      `mod-${type}`,
      !!margin && 'mod-margin',
      !!rows && 'mod-rows'
    )}
  >
    {children}
  </div>
);
