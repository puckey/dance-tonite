/** @jsx h */
import { h } from 'preact';
import './style.scss';
import icon from './icon.svg';

import ButtonItem from '../ButtonItem';
import router from '../../router';
import settings from '../../settings';

const navigateToRecord = () => {
  router.navigate(`/record/${Math.floor(Math.random() * settings.loopCount)}/head=yes/`);
};

export default (props) => (
  <ButtonItem
    {...props}
    icon={icon}
    label="Add your dance"
    onClick={navigateToRecord}
  />
);
