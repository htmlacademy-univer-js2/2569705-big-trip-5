import AbstractView from '../framework/view/abstract-view.js';
import { NoEventsMessages } from '../const.js';

function createNoPointListTemplate(filterType) {
  return `<p class="trip-events__msg">${NoEventsMessages[filterType.toUpperCase()]}</p>`;
}

export default class NoPointsListView extends AbstractView {
  #filterType = null;

  constructor({filterType}) {
    super();
    this.#filterType = filterType;
  }

  get template() {
    return createNoPointListTemplate(this.#filterType);
  }
}
