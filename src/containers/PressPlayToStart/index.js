/** @jsx h */
import { h } from 'preact';
import './style.scss';

import Container from '../../components/Container';
import Align from '../../components/Align';
import ButtonPlay from '../../components/ButtonPlay';

export default function PressPlayToStart({ onClick }) {
  return (
    <Container>
      <Align type="center">
        <ButtonPlay onClick={onClick} large />
        <a onClick={onClick} className="play-button-label">Press play to Dance Tonite</a>
      </Align>
    </Container>
  );
}
