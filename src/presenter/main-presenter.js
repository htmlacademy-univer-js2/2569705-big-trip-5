import Sorting from '../view/sorting-view.js';
import { render, remove, RenderPosition } from '../framework/render.js';
import NoPointsListView from '../view/no-points-list-view.js';
import { SORT_TYPES, DEFAULT_POINT, UserAction, UpdateType, FilterType, BlockLimit, FILTER } from '../const.js';
import { sortByField, getDuration, getOffersByType } from '../utils.js';
import RoutePointPresenter from './route-point-presenter.js';
import PointCreationPresenter from './create-point-presenter.js';
import RoutePointList from '../view/route-points-list-view.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';
import LoadingView from '../view/loading-view.js';
import LoadingErrorView from '../view/loading-error-view.js';

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
  #pointPresenters = new Map();
  #loadingComponent = new LoadingView();
  #errorComponent = new LoadingErrorView();
  #isLoading = true;
  #uiBlocker = new UiBlocker({
    lowerLimit: BlockLimit.LOWER_LIMIT,
    upperLimit: BlockLimit.UPPER_LIMIT
  });

  constructor({ pointsModel, eventsContainer, pointListComponent, filterModel }) {
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;
    this.#eventsContainer = eventsContainer;
    this.#tripEventsSection = eventsContainer;
    this.#pointListComponent = pointListComponent || new RoutePointList();
    this.#pointsModel.addObserver(this.#modelChangeHandler);
    this.#filterModel.addObserver(this.#modelChangeHandler);
    this.#userActionHandler = this.#userActionHandler.bind(this);

    this.#pointCreationPresenter = new PointCreationPresenter({
      filterModel: this.#filterModel,
      pointsModel: this.#pointsModel,
      pointListComponent: this.#pointListComponent,
      point: DEFAULT_POINT,
      favoriteHandler: this.#userActionHandler,
      modeSwitchHandler: this.#modeChangeHandler.bind(this),
      addButtonClickHandler: this.#addButtonClickHandler.bind(this)
    });
  }

  #userActionHandler = async (actionType, updateType, update) => {
    const presenter = this.#pointPresenters.get(update.id);

    const handlers = {
      [UserAction.UPDATE_POINT]: async () => {
        presenter.setSaving();
        await this.#pointsModel.updatePoint(updateType, update);
      },
      [UserAction.ADD_POINT]: async () => {
        presenter?.setSaving();
        await this.#pointsModel.addPoint(updateType, update);
      },
      [UserAction.DELETE_POINT]: async () => {
        presenter.setDeleting();
        await this.#pointsModel.deletePoint(updateType, update);
      }
    };

    try {
      this.#uiBlocker.block();
      await handlers[actionType]?.();
    } catch (error) {
      if (actionType === UserAction.ADD_POINT) {
        this.#pointCreationPresenter.setAborting();
      } else {
        presenter?.setAborting();
      }
      return error;
    } finally {
      this.#uiBlocker.unblock();
    }
  };

  #modelChangeHandler = (updateType, update) => {
    const handlers = {
      [UpdateType.PATCH]: () => {
        const presenter = this.#pointPresenters.get(update.id);
        if (presenter) {
          presenter.init(update);
        }
      },
      [UpdateType.MAJOR]: () => {
        this.#clearPointsList();
        this.#renderRoutePoints(true);
      },
      [UpdateType.DELETE]: () => {
        const presenter = this.#pointPresenters.get(update.id);
        if (presenter) {
          presenter.destroy();
          this.#pointPresenters.delete(update.id);
        }
        if (this.points.length === 0) {
          this.#renderEmptyState();
        } else {
          this.#renderRoutePoints();
        }
      },
      [UpdateType.INIT]: () => {
        this.#isLoading = false;
        remove(this.#loadingComponent);
        if (update.isLoadingFailed) {
          this.#renderError();
        } else {
          this.#renderRoutePoints();
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
    if (this.#isLoading) {
      this.#renderLoading();
      return;
    }
    this.#clearPointsList();
    if (isFilterChanged) {
      this.#currentSortType = SORT_TYPES[0];
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

  #modeChangeHandler = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
    this.#pointCreationPresenter.destroy();
    if (this.points.length === 0) {
      this.#renderEmptyState();
    }
  };

  async init() {
    this.#sortChangeHandler(SORT_TYPES[0]);
  }

  #sortChangeHandler(sortTypes) {
    if (this.#currentSortType !== sortTypes) {
      this.#currentSortType = sortTypes;
      this.#renderSorting();
      this.#clearPointsList();
      this.#renderRoutePoints();
    }
  }

  #renderEmptyState() {
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
      sortingChangeHandler: this.#sortTypeChangeHandler.bind(this)
    });
    render(this.#sortComponent, this.#eventsContainer, RenderPosition.AFTERBEGIN);
  }

  #renderPoint(point) {
    const pointPresenter = new RoutePointPresenter({
      container: this.#pointListComponent,
      destinations: this.destinations,
      offers: this.offers,
      favoriteHandler: (p) => {
        this.#userActionHandler(UserAction.UPDATE_POINT, UpdateType.PATCH, {
          ...p,
          isFavorite: !p.isFavorite
        });
      },
      modeSwitchHandler: this.#modeChangeHandler.bind(this),
      typeOffers: getOffersByType(this.offers, point.type),
      actionHandler: this.#userActionHandler,
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
    const filteredPoints = FILTER[this.#filterType](points);

    switch (this.#currentSortType) {
      case SORT_TYPES[3]:
        return sortByField(filteredPoints, 'basePrice', 'desc');
      case SORT_TYPES[2]:
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

  #sortTypeChangeHandler = (newSortType) => {
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
    this.#pointCreationPresenter.destroy();
  }

  #renderLoading() {
    render(this.#loadingComponent, this.#eventsContainer, RenderPosition.BEFOREEND);
  }

  #renderError() {
    render(this.#errorComponent, this.#eventsContainer, RenderPosition.BEFOREEND);
  }

  #addButtonClickHandler() {
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
    this.#currentSortType = SORT_TYPES[0];
  }
}
