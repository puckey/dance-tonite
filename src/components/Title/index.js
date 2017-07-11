/** @jsx h */
import { h } from 'preact';

import './style.scss';

export default ({ children }) => (
  <div className="line-title-text">
    <span>{ children }</span>
  </div>
);
