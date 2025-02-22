import { createElement } from '../render.js';

export default class RoutePointsList {
  getTemplate() {
    return createRoutePointsListTemplate();
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate());
    }
    return this.element;
  }

  removeElement() {
    this.element = null;
  }
}

function createRoutePointsListTemplate() {
  return '<ul class="trip-events__list"></ul>';
}
