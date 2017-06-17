/** @jsx h */
import { h } from 'preact';
import './style.scss';

import audio from '../../audio';

import ButtonNext from '../ButtonNext';
import ButtonPrevious from '../ButtonPrevious';
import ButtonPlay from './ButtonPlay';

const performNext = audio.nextLoop.bind(audio);
const performPrevious = audio.nextLoop.bind(audio);

const AudioControls = () => (
  <div className="audio-controls">
    <ButtonPrevious onClick={performPrevious} />
    <ButtonPlay />
    <ButtonNext onClick={performNext} />
  </div>
);

export default AudioControls;
