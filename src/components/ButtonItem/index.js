/** @jsx h */
import { h } from 'preact';
import classNames from 'classnames';

import './style.scss';

export default ({ onClick, icon, label, children, className }) => (
  <div
    className={classNames('button-item', className)}
    onClick={onClick}
  >
    {
      label &&
        <div className="button-item-label">{label}</div>
    }
    { icon &&
      <div
        className={
          classNames(
            'button-item-icon',
            label && 'mod-label',
          )
        }
        dangerouslySetInnerHTML={{ __html: icon }}
      />
    }
    { children }
  </div>
);
