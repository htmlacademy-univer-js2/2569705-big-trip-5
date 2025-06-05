import Sorting from '../view/sorting-view.js';
import { render, remove, RenderPosition } from '../framework/render.js';
import NoPointsListView from '../view/no-points-view.js';
import { SortTypes, NEW_POINT, filter, UserAction, UpdateType, FilterType } from '../const.js';
import { sortByField, getDuration, getAllDestinations, getAllOffers, getOffersByType } from '../utils.js';
import RoutePointPresenter from './route-point-presenter.js';
import PointCreationPresenter from './create-point-presenter.js';
import RoutePointList from '../view/route-points-list-view.js';

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
  #isCreating = false;
  #addButton = null;
  #boundHandleAddButtonClick = null;
  constructor({ pointsModel, eventsContainer, pointListComponent, filterModel }) {
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;
    this.#eventsContainer = eventsContainer;
    this.#tripEventsSection = eventsContainer;
    this.#pointListComponent = pointListComponent || new RoutePointList();
    this.#pointsModel.addObserver(this.#handleModelChange);
    this.#filterModel.addObserver(this.#handleModelChange);
    this.#handleUserAction = this.#handleUserAction.bind(this);
    this.#addButton = document.querySelector('.trip-main__event-add-btn');

    this.#pointCreationPresenter = new PointCreationPresenter({
      filterModel: this.#filterModel,
      pointListComponent: this.#pointListComponent,
      point: NEW_POINT,
      typeOffers: getOffersByType(NEW_POINT),
      offers: this.#offers,
      destinations: this.#destinations,
      favoriteHandler: this.#handleUserAction,
      modeSwitchHandler: this.#handleModeChange.bind(this)
    });
  }

  #handleUserAction = (actionType, updateType, update) => {
    const handlers = {
      [UserAction.UPDATE_POINT]: () => this.#pointsModel.updatePoint(updateType, update),
      [UserAction.ADD_POINT]: () => {
        this.#pointsModel.addPoint(updateType, update);
        this.#isCreating = false;
      },
      [UserAction.DELETE_POINT]: () => {
        this.#pointsModel.deletePoint(UpdateType.DELETE, update.id);
      }
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
        if (!this.#isCreating) {
          this.#clearPointsList();
          this.#renderRoutePoints(true);
        }
      },
      [UpdateType.DELETE]: () => {
        const presenter = this.#pointPresenters.get(update);
        if (presenter) {
          presenter.destroy();
          this.#pointPresenters.delete(update);
        }
        if (this.points.length === 0 && !this.#isCreating) {
          this.#renderEmptyState();
        }
      }
    };
    if (updateType === UpdateType.DELETE) {
      handlers[updateType](update.id);
    } else {
      handlers[updateType]?.();
    }
  };

  #renderRoutePoints = (isFilterChanged = false) => {
    if (this.#isCreating) {
      return;
    }
    this.#clearPointsList();
    if (isFilterChanged) {
      this.#currentSortType = SortTypes[0];
      this.#renderSorting();
    }

    remove(this.#emptyPointListComponent);
    render(this.#pointListComponent, this.#tripEventsSection);
    if (this.points.length === 0) {
      remove(this.#sortComponent);
      this.#renderEmptyState();
      return;
    }
    if (!this.#sortComponent || isFilterChanged) {
      this.#renderSorting();
    }
    this.points.forEach((point) => this.#renderPoint(point));
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
    if (this.#isCreating) {
      this.#pointCreationPresenter.destroy();
      this.#isCreating = false;

      if (this.points.length === 0) {
        this.#renderEmptyState();
      }
    }
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
    if (this.#isCreating) {
      return;
    }
    if (this.#sortComponent !== null) {
      remove(this.#sortComponent);
    }
    remove(this.#emptyPointListComponent);
    const filterType = this.#filterModel.filter;
    this.#emptyPointListComponent = new NoPointsListView({
      filterType: filterType
    });

    render(this.#emptyPointListComponent, this.#tripEventsSection);
  }

  #renderSorting() {
    if (this.#sortComponent !== null) {
      remove(this.#sortComponent);
    }
    this.#sortComponent = new Sorting({
      sortingType: this.#currentSortType,
      onSortingChange: this.#handleSortTypeChange.bind(this)
    });
    render(this.#sortComponent, this.#eventsContainer, RenderPosition.AFTERBEGIN);
  }

  #renderPoint(point) {
    const pointPresenter = new RoutePointPresenter({
      container: this.#pointListComponent,
      destinations: this.#destinations,
      offers: this.#offers,
      favoriteHandler: (p) => {
        this.#handleUserAction(UserAction.UPDATE_POINT, UpdateType.PATCH, {
          ...p,
          isFavorite: !p.isFavorite
        });
      },
      modeSwitchHandler: this.#handleModeChange.bind(this),
      typeOffers: getOffersByType(point),
      actionHandler: this.#handleUserAction,
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
    const filteredPoints = filter[this.#filterType](points);

    switch (this.#currentSortType) {
      case SortTypes[3]:
        return sortByField(filteredPoints, 'basePrice', 'desc');
      case SortTypes[2]:
        return sortByField(filteredPoints, 'duration', 'desc');
      default:
        return sortByField(filteredPoints, 'dateFrom', 'asc');
    }
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
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }

  createPoint() {
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
    this.#currentSortType = SortTypes[0];
    this.#handleModeChange();
    if (this.#emptyPointListComponent) {
      remove(this.#emptyPointListComponent);
      this.#emptyPointListComponent = null;
    }
    if (this.#sortComponent) {
      remove(this.#sortComponent);
      this.#sortComponent = null;
    }
    this.#isCreating = true;
    if (this.#pointCreationPresenter) {
      this.#pointCreationPresenter.destroy();
      this.#pointCreationPresenter = null;
    }
    this.#pointCreationPresenter = new PointCreationPresenter({
      filterModel: this.#filterModel,
      pointListComponent: this.#pointListComponent,
      point: NEW_POINT,
      typeOffers: getOffersByType(NEW_POINT),
      offers: this.#offers,
      destinations: this.#destinations,
      favoriteHandler: this.#handleUserAction,
      modeSwitchHandler: this.#handleModeChange.bind(this)
    });

    const emptyMessages = this.#tripEventsSection.querySelectorAll('.trip-events__msg');
    emptyMessages.forEach((msg) => msg.remove());
    render(this.#pointListComponent, this.#tripEventsSection);
    this.#pointCreationPresenter.init();
  }
}
