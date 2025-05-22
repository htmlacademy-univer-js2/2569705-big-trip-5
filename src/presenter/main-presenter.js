import RoutePointsList from '../view/route-points-list-view.js';
import Filters from '../view/filters-view.js';
import Sorting from '../view/sorting-view.js';
import { render } from '../framework/render.js';
import NoPointsListView from '../view/no-points-view.js';
import { generateFilter } from '../mock/filters-mock.js';
import { updatePointById } from '../utils.js';
import RoutePointPresenter from './route-point-presenter.js';


export default class Presenter {
  #pointsListContainer = new RoutePointsList();

  #pointsModel = null;
  #offersModel = null;
  #destinationsModel = null;
  #tripEventsSection = null;
  #filtersSection = null;
  #points = null;
  #destinations = null;
  #offers = null;

  #pointPresenters = new Map();

  constructor({ pointsModel, offersModel, destinationsModel }) {
    this.#pointsModel = pointsModel;
    this.#offersModel = offersModel;
    this.#destinationsModel = destinationsModel;
    this.#tripEventsSection = document.querySelector('.trip-events');
    this.#filtersSection = document.querySelector('.trip-controls__filters');
  }

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #handlePointUpdate = (updatedPoint) => {
    this.#points = updatePointById(this.#points, updatedPoint);
    this.#pointPresenters.get(updatedPoint.id)?.init(updatedPoint);
  };

  init() {
    this.#points = this.#pointsModel.points;
    this.#offers = this.#offersModel.offers;
    this.#destinations = this.#destinationsModel.destinations;

    const filters = generateFilter(this.#points);

    render(new Filters({ filters }), this.#filtersSection);
    render(new Sorting(), this.#tripEventsSection);

    if (this.#points.length > 0) {
      this.#renderPointsList();
    } else {
      this.#renderEmptyState();
    }
  }

  #renderPointsList() {
    render(this.#pointsListContainer, this.#tripEventsSection);
    this.#points.forEach((point) => this.#renderPoint(point));
  }

  #renderEmptyState() {
    render(new NoPointsListView(), this.#tripEventsSection);
  }

  #renderPoint(point) {
    const pointPresenter = new RoutePointPresenter({
      container: this.#pointsListContainer,
      destinations: this.#destinations,
      offers: this.#offers,
      favoriteHandler: this.#handlePointUpdate,
      modeSwitchHandler: this.#handleModeChange
    });

    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }
}
