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

import './style.scss';
import enterIconSvg from './icons/entervr.svg';
import enterIconDisabledSvg from './icons/x_entervr.svg';

import feature from '../../utils/feature';

import ButtonItem from '../ButtonItem';

export default function ButtonEnterVR({ label, onClick }, { presenting }) {
  return (
    <ButtonItem
      label={label && (
        feature.hasVR
          ? presenting
            ? 'Exit VR'
            : 'Enter VR'
          : 'VR not found'
        )
      }
      onClick={onClick}
      icon={feature.hasVR ? enterIconSvg : enterIconDisabledSvg}
    />
  );
}
