/** @jsx h */
import { h } from 'preact';
import './style.scss';

import Container from '../../components/Container';
import Error from '../../components/Error';
import Align from '../../components/Align';

export default function NotFound({ error }) {
  return (
    <Container>
      <Align type="center" margin>
        <Error>{error || 'Sorry, but the page you requested cannot be found.'}</Error>
        <div style={{ marginTop: '1rem' }}><a href="/">Go home</a></div>
      </Align>
    </Container>
  );
}
