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

  shouldComponentUpdate({ icon }) {
    return icon !== this.props.icon;
  }

  navigate() {
    router.navigate(this.props.navigate);
  }

  render({ onClick, navigate, icon, label, children, className, text }) {
    return (
      <div
        className={classNames('button-item', className, text && 'mod-text')}
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
        { text ? <span>{ children }</span> : null }
      </div>
    );
  }
}