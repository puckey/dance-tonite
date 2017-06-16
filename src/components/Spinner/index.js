/** @jsx h */
import { h } from 'preact';
import './style.scss';

export default ({ text }) => (
  <div className="cms-spinner">
    <div className="cms-spinner-inner cms-spinner-inner-negative" />
    <div className="cms-spinner-inner" />
    {text && <div className="cms-spinner-text">{text}</div> }
  </div>
);
