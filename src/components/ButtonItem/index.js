/** @jsx h */
import { h, Component } from 'preact';
import classNames from 'classnames';

import './style.scss';

export default class ButtonItem extends Component {
  shouldComponentUpdate({ icon }) {
    return icon !== this.props.icon;
  }

  render({ onClick, icon, label, children, className, text }) {
    return (
      <div
        className={classNames('button-item', className, text && 'mod-text')}
        onClick={onClick}
      >
        {
          label &&
            <span className="button-item-label">{label}</span>
        }
        { icon &&
          <span
            className={
              classNames(
                'button-item-icon',
                label && 'mod-label',
              )
            }
            dangerouslySetInnerHTML={{ __html: icon }}
          />
        }
        { text ? <span>{ children }</span> : null }
      </div>
    );
  }
}