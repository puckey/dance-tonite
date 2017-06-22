/** @jsx h */
import { h } from 'preact';
import './style.scss';

export default ({ text }) => (
  <div className="spinner">
    <div className="spinner-inner spinner-inner-negative" />
    <div className="spinner-inner" />
    { text
      ? <div className="spinner-text">{text}</div>
      : null
    }
  </div>
);
