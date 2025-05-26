import Sorting from '../view/sorting-view.js';
import { render, remove, RenderPosition } from '../framework/render.js';
import NoPointsListView from '../view/no-points-view.js';
import { SortTypes, NEW_POINT, filter, UserAction, UpdateType } from '../const.js';
import { sortByField, getDuration, getAllDestinations, getAllOffers, getOffersByType } from '../utils.js';
import RoutePointPresenter from './route-point-presenter.js';
import PointCreationPresenter from './create-pount-presenter.js';

export default class Presenter {
  #pointListComponent = null;
  #eventsContainer = null;
  #pointsModel = null;
  #filterModel = null;
  #filterType = null;
  #tripEventsSection = null;
  #emptyPointListComponent = null;
  #sortComponent = null;
  #currentSortType = null;
  #pointCreationPresenter = null;
  #destinations = getAllDestinations();
  #offers = getAllOffers();
  #pointPresenters = new Map();

  constructor({ pointsModel, eventsContainer, pointListComponent, filterModel }) {
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;
    this.#eventsContainer = eventsContainer;
    this.#pointListComponent = pointListComponent;
    this.#pointsModel.addObserver(this.#handleModelChange);
    this.#filterModel.addObserver(this.#handleModelChange);

    this.#pointCreationPresenter = new PointCreationPresenter({
      filterModel: this.#filterModel,
      pointListComponent: this.#pointListComponent,
      point: NEW_POINT,
      typeOffers: getOffersByType(NEW_POINT),
      offers: this.#offers,
      destinations: this.#destinations,
      favoriteHandler: this.#handleUserAction.bind(this),
      modeSwitchHandler: this.#handleModeChange.bind(this)
    });
  }

  #handleUserAction = (actionType, updateType, update) => {
    const handlers = {
      [UserAction.UPDATE_POINT]: () => this.#pointsModel.updatePoint(updateType, update),
      [UserAction.ADD_POINT]: () => this.#pointsModel.addPoint(updateType, update),
      [UserAction.DELETE_POINT]: () => this.#pointsModel.deletePoint(updateType, update)
    };

    handlers[actionType]?.();
  };

  #handleModelChange = (updateType, update) => {
    const handlers = {
      [UpdateType.PATCH]: () => {
        const presenter = this.#pointPresenters.get(update.id);
        if (presenter) {
          presenter.init(update);
        }
      },
      [UpdateType.MINOR]: () => {
        this.#clearPointsList();
        this.#renderRoutePoints();
      },
      [UpdateType.MAJOR]: () => {
        this.#clearPointsList();
        this.#renderRoutePoints(true);
      }
    };
    handlers[updateType]?.();
  };

  #renderRoutePoints = (isFilterChanged = false) => {
    if (isFilterChanged) {
      this.#currentSortType = SortTypes[0];
      this.#renderSorting();
    }

    remove(this.#emptyPointListComponent);
    render(this.#pointListComponent, this.#eventsContainer);

    if (this.points.length === 0) {
      this.#renderEmptyState();
      return;
    }

    this.points.forEach((point) => this.#renderPoint(point));
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
    this.#pointCreationPresenter.clearElements();
  };

  init() {
    this.#onSortChange(SortTypes[0]);
  }

  #onSortChange(sortTypes) {
    if (this.#currentSortType !== sortTypes) {
      this.#currentSortType = sortTypes;
      this.#renderSorting();
      this.#clearPointsList();
      this.#renderRoutePoints();
    }
  }

  #renderEmptyState() {
    this.#emptyPointListComponent = new NoPointsListView({ filterType: this.#filterType });
    render(this.#emptyPointListComponent, this.#tripEventsSection, RenderPosition.AFTERBEGIN);
  }

  #renderSorting() {
    if (this.#sortComponent !== null) {
      remove(this.#sortComponent);
    }
    this.#sortComponent = new Sorting({
      sortingType: this.#currentSortType,
      onSortingChange: this.#handleSortTypeChange.bind(this)
    });
    render(this.#sortComponent, this.#eventsContainer);
  }

  #renderPoint(point) {
    const pointPresenter = new RoutePointPresenter({
      container: this.#pointListComponent, // Новый контейнер
      destinations: this.#destinations,
      offers: this.#offers,
      favoriteHandler: this.#handleUserAction.bind(this), // Обновленный обработчик
      modeSwitchHandler: this.#handleModeChange.bind(this), // Обновленный обработчик
      typeOffers: getOffersByType(point) // Дополнительные опции для текущего типа
    });

    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  get points() {
    this.#filterType = this.#filterModel.filter;
    const points = this.#pointsModel.points.map((point) => ({
      ...point,
      duration: getDuration(point.dateFrom, point.dateTo)
    }));

    switch (this.#currentSortType) {
      case SortTypes[3]:
        sortByField(points, 'basePrice', 'desc');
        break;
      case SortTypes[2]:
        sortByField(points, 'duration', 'desc');
        break;
      default:
        sortByField(points, 'dateFrom', 'asc');
        break;
    }
    return filter[this.#filterType](points);
  }

  get destinations() {
    return this.#pointsModel.destinations;
  }

  get offers() {
    return this.#pointsModel.offers;
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
  }
}
