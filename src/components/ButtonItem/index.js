/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/** @jsx h */
import { h, Component } from 'preact';
import classNames from 'classnames';
import './style.scss';

import router from '../../router';
import stopPropagation from '../../utils/stop-propagation';

export default class ButtonItem extends Component {
  constructor() {
    super();
    this.navigate = this.navigate.bind(this);
  }

  shouldComponentUpdate({ icon, label, disabled, text }) {
    return icon !== this.props.icon ||
      text !== this.props.text ||
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
        onMouseDown={stopPropagation}
        onTouchStart={stopPropagation}
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
