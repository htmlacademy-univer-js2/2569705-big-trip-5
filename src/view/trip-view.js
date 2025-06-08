import AbstractView from '../framework/view/abstract-view';
import { SortTypes } from '../const.js';
import { sort, getRouteInfo } from '../utils.js';

function createTripInfoTemplate(points, destinations, offers) {
  const routeInfo = getRouteInfo(points, destinations, offers);

  return `<section class="trip-main__trip-info  trip-info">
            <div class="trip-info__main">
              <h1 class="trip-info__title">${routeInfo.route}</h1>
              <p class="trip-info__dates">${routeInfo.dates[0]}&nbsp;&mdash;&nbsp;${routeInfo.dates[1]}</p>
            </div>
            <p class="trip-info__cost">
              Total: &euro;&nbsp;<span class="trip-info__cost-value">${routeInfo.price}</span>
            </p>
          </section>`;
}

export default class TripView extends AbstractView {
  #points = null;
  #pointsModel = null;

  constructor({ pointsModel }) {
    super();
    this.#pointsModel = pointsModel;
    this.#points = sort[SortTypes[0]](pointsModel.points);
  }

  get template() {
    return createTripInfoTemplate(this.#points, this.#pointsModel.destinations, this.#pointsModel.offers);
  }
}
