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

export default class ListChoice extends Component {
  constructor() {
    super();
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.props.onClick(this.props.item);
  }

  render() {
    const { title, active, className } = this.props;
    return (
      <a
        className={classNames('paginated-list-item-link')}
        onClick={!active && this.onClick}
      >
        <div
          className={classNames(
            'paginated-list-item',
            active && 'mod-active',
            className
          )}
        >
          <div className="paginated-list-item-name-container">
            <div className="paginated-list-item-name">{title}</div>
          </div>
        </div>
      </a>
    );
  }
}
