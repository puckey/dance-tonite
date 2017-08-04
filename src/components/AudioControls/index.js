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

import audio from '../../audio';

import ButtonNext from '../ButtonNext';
import ButtonPrevious from '../ButtonPrevious';
import ButtonPlay from './ButtonPlay';

const performNext = audio.nextLoop.bind(audio);
const performPrevious = audio.previousLoop.bind(audio);

export default function AudioControls() {
  return (
    <div className="audio-controls">
      <ButtonPrevious onClick={performPrevious} />
      <ButtonPlay />
      <ButtonNext onClick={performNext} />
    </div>
  );
}
