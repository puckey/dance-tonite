/** @jsx h */
import { h } from 'preact';
import router from '../../router';
import ButtonItem from '../ButtonItem';

import './style.scss';

const navigateToSubmissions = () => router.navigate('/submissions/');

export default () => (
  <ButtonItem onClick={navigateToSubmissions} text>Submissions</ButtonItem>
);
