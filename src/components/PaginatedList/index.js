/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/** @jsx h */
import { h, Component } from 'preact';

import './style.scss';
import ButtonNext from '../ButtonNext';
import ButtonPrevious from '../ButtonPrevious';
import ListChoice from './ListChoice';
import dividerIcon from './icon.svg';
import padNumber from '../../utils/padNumber';

const hasNextPage = (currentPage, totalPages) => totalPages > currentPage + 1;

const hasPrevPage = currentPage => currentPage - 1 > -1;

const getOffset = (page, itemsPerPage) => page * itemsPerPage;

export default class PaginatedList extends Component {
  constructor() {
    super();
    // set initial time:
    this.state = { };
    this.nextPage = this.nextPage.bind(this);
    this.previousPage = this.previousPage.bind(this);
  }

  countPages() {
    const { items, itemsPerPage = 4 } = this.props;
    return Math.ceil(items.length / itemsPerPage);
  }

  get activePage() {
    const { page } = this.state;
    if (page !== undefined) return page;
    const { item, items, itemsPerPage = 4 } = this.props;
    return Math.floor(items.indexOf(item) / itemsPerPage);
  }

  nextPage() {
    this.setState({ page: Math.min(this.countPages() - 1, this.activePage + 1) });
  }

  previousPage() {
    this.setState({ page: Math.max(0, this.activePage - 1) });
  }

  render() {
    let { items } = this.props;
    let { page } = this.state;
    if (!items) return null;
    const {
      item,
      itemsPerPage = 4,
      performChange,
    } = this.props;

    // If page has not yet been defined in state through user interaction,
    // we calculate it by looking at the current playing item:
    if (page == null) {
      page = item
        ? Math.floor(items.indexOf(item) / itemsPerPage)
        : 0;
    }
    const totalPages = this.countPages();
    if (totalPages <= page) page = totalPages - 1;
    const hasPagination = totalPages > 1;
    items = items.slice(
      getOffset(page, itemsPerPage),
      getOffset(page + 1, itemsPerPage),
    );
    const count = items.length;
    return (
      <div className="item-list">
        {
          items.map((listItem, i) =>
            <ListChoice
              onClick={performChange}
              item={listItem}
              active={item === listItem}
              title={listItem.title === '' ? 'Unnamed' : listItem.title}
              className={(!hasPagination && ((i + 1) === count)) ? 'mod-last' : null}
              key={listItem.id}
            />,
          )
        }
        {
          hasPagination &&
            <div className="item-list-navigation">
              <ButtonPrevious
                disabled={!hasPrevPage(page)}
                onClick={this.previousPage}
                page={page}
              />
              <span className="item-list-navigation-pages">
                { padNumber(page + 1, 2) }
                <span className="divider-icon" dangerouslySetInnerHTML={{ __html: dividerIcon }} />
                { padNumber(totalPages, 2) }
              </span>
              <ButtonNext
                disabled={!hasNextPage(page, totalPages)}
                onClick={this.nextPage}
                page={page}
              />
            </div>
        }
      </div>
    );
  }
};
