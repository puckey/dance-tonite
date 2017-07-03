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
