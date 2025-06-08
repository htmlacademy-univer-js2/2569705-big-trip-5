import AbstractView from '../framework/view/abstract-view.js';
import { SORT_TYPES } from '../const.js';

export default class Sorting extends AbstractView {
  #currentSorting = null;
  #sortingChangeHandler = null;

  constructor({ sortingType, sortingChangeHandler }) {
    super();
    this.#currentSorting = sortingType;
    this.#sortingChangeHandler = sortingChangeHandler;
    this.element.addEventListener('change', this.#sortChangeHandler);
  }

  get template() {
    return createSortingTemplate(this.#currentSorting);
  }

  #sortChangeHandler = (event) => {
    event.preventDefault();
    const selectedSortingType = event.target.dataset.sortType;

    if (selectedSortingType && this.#sortingChangeHandler) {
      this.#sortingChangeHandler(selectedSortingType);
    }
  };
}

function createSortingTemplate(currentSorting) {
  return `
    <form class="trip-events__trip-sort trip-sort" action="#" method="get">
      ${SORT_TYPES.map((type) => `
        <div class="trip-sort__item trip-sort__item--${type}">
          <input
            id="sort-${type}"
            class="trip-sort__input visually-hidden"
            data-sort-type="${type}"
            type="radio"
            name="trip-sort"
            value="sort-${type}"
            ${type === currentSorting ? 'checked' : ''}
            ${type === 'event' || type === 'offers' ? 'disabled' : ''}
          >
          <label class="trip-sort__btn" for="sort-${type}">
            ${type.charAt(0).toUpperCase() + type.slice(1)}
          </label>
        </div>
      `).join('')}
    </form>
  `;
}
