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
import { h } from 'preact';
import classNames from 'classnames';

import './style.scss';
import Align from '../../components/Align';
import ButtonClose from '../../components/ButtonClose';

export default function Overlay({ children, onClose, opaque }) {
  return (
    <div
      className={classNames('overlay', opaque && 'mod-opaque')}
      onClick={onClose}
    >
      {onClose && (
        <Align type="top-right">
          <ButtonClose onClick={onClose} />
        </Align>
      )}
      <div className="overlay-text">
        {children}
      </div>
    </div>
  );
}
