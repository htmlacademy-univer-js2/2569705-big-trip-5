import RoutePointsList from '../view/route-points-list-view.js';
import Filters from '../view/filters-view.js';
import Sorting from '../view/sorting-view.js';
import { render, remove } from '../framework/render.js';
import NoPointsListView from '../view/no-points-view.js';
import { generateFilter } from '../mock/filters-mock.js';
import { updatePointById } from '../utils.js';
import { SortTypes } from '../const.js';
import { sortByField, getDuration } from '../utils.js';
import RoutePointPresenter from './route-point-presenter.js';

export default class Presenter {
  #pointsListContainer = new RoutePointsList();

  #pointsModel = null;
  #offersModel = null;
  #destinationsModel = null;
  #tripEventsSection = null;
  #filtersSection = null;

  #points = [];
  #destinations = [];
  #offers = [];

  #sortComponent = null;
  #currentSortType = SortTypes[0];

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
    this.#points = this.#pointsModel.points.map((point) => ({
      ...point,
      duration: getDuration(point.dateFrom, point.dateTo)
    }));
    this.#offers = this.#offersModel.offers;
    this.#destinations = this.#destinationsModel.destinations;

    const filters = generateFilter(this.#points);
    render(new Filters({ filters }), this.#filtersSection);

    this.#renderRoutePoints();
  }

  #renderRoutePoints() {
    if (this.#points.length === 0) {
      this.#renderEmptyState();
      return;
    }

    this.#renderSorting();
    this.#sortRoutePoints();

    render(this.#pointsListContainer, this.#tripEventsSection);

    this.#points.forEach((point) => this.#renderPoint(point));
  }

  #renderEmptyState() {
    render(new NoPointsListView(), this.#tripEventsSection);
  }

  #renderSorting() {
    this.#sortComponent = new Sorting({
      sortingType: this.#currentSortType,
      onSortingChange: this.#handleSortTypeChange
    });
    render(this.#sortComponent, this.#tripEventsSection);
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

  #sortRoutePoints() {
    switch (this.#currentSortType) {
      case SortTypes[0]:
        this.#points = sortByField(this.#points, 'dateFrom', 'asc');
        break;
      case SortTypes[2]:
        this.#points = sortByField(this.#points, 'duration', 'desc');
        break;
      case SortTypes[3]:
        this.#points = sortByField(this.#points, 'basePrice', 'desc');
        break;
      default:
        throw new Error('Invalid sort type');
    }
  }

  #handleSortTypeChange = (newSortType) => {
    if (this.#currentSortType === newSortType) {
      return;
    }

    this.#currentSortType = newSortType;
    this.#clearPointsList();
    this.#renderRoutePoints();
  };

  #clearPointsList() {
    this.#pointPresenters.forEach((presenter) => presenter.clearElements());
    this.#pointPresenters.clear();
    remove(this.#sortComponent);
    remove(this.#pointsListContainer);
  }
}
