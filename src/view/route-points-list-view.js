import AbstractView from '../framework/view/abstract-view.js';

export default class RoutePointList extends AbstractView {
  get template() {
    return createRoutePointsListTemplate();
  }
}

function createRoutePointsListTemplate() {
  return '<ul class="trip-events__list"></ul>';
}
