/** @jsx h */
import { h } from 'preact';
import classNames from 'classnames';

export default ({ onClick, disabled, page }) => (
  <span
    onClick={() => { onClick(page); }}
    className={classNames('paginated-list-previous', disabled && 'mod-disabled')}
  >&lt; </span>
);
