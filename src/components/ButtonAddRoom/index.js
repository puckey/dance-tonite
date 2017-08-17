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
import icon from './icon.svg';

import ButtonItem from '../ButtonItem';
import settings from '../../settings';

// Recording url for random room, ignoring first and last room:
const randomRoom = () => {
  const room = Math.floor(Math.random() * (settings.roomCount - 2)) + 2;
  return room;
};

// Random room, ignoring first and last rooms:
export default (props) => (
  <ButtonItem
    {...props}
    icon={icon}
    label="Add your dance"
    navigate={`/record/${randomRoom()}/head=yes/`}
  />
);
