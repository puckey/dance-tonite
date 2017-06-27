/** @jsx h */
import { h } from 'preact';
import classNames from 'classnames';

export default ({ onClick, page, disabled }) => (
  <span
    onClick={() => { onClick(page); }}
    className={classNames('paginated-list-next', disabled && 'mod-disabled')}
  > &gt;</span>
);
