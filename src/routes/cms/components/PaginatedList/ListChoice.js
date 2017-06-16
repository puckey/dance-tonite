/** @jsx h */
import { h, Component } from 'preact';
import classNames from 'classnames';

export default class ListChoice extends Component {
  constructor() {
    super();
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.props.onClick(this.props.item);
  }

  render() {
    const { title, active, className } = this.props;
    return (
      <a
        className={classNames('paginated-list-item-link')}
        onClick={!active && this.onClick}
      >
        <div
          className={classNames(
            'paginated-list-item',
            active && 'mod-active',
            className
          )}
        >
          <div className="paginated-list-item-name-container">
            <div className="paginated-list-item-name">{title}</div>
          </div>
        </div>
      </a>
    );
  }
}
