/** @jsx h */
import { h, Component } from 'preact';
import classNames from 'classnames';
import './style.scss';

import router from '../../router';

export default class ButtonItem extends Component {
  constructor() {
    super();
    this.navigate = this.navigate.bind(this);
  }

  shouldComponentUpdate({ icon, label, disabled }) {
    return icon !== this.props.icon ||
      label !== this.props.label ||
      disabled !== this.props.disabled;
  }

  navigate() {
    router.navigate(this.props.navigate);
  }

  render({ onClick, navigate, icon, label, className, text, underline, disabled }) {
    return (
      <div
        className={classNames(
          'button-item',
          className,
          text && 'mod-text',
          disabled && 'mod-disabled',
        )}
        onClick={navigate ? this.navigate : onClick}
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
        { text
            ? underline
              ? <a><span>{text}</span></a>
              : <a>{text}</a>
            : null
        }
      </div>
    );
  }
}
