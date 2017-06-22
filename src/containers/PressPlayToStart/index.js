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
        <ButtonPlay onClick={onClick} />
        <a onClick={onClick}><div>Press play to start</div></a>
      </Align>
    </Container>
  );
}
