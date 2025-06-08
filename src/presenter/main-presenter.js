import Sorting from '../view/sorting-view.js';
import { render, remove, RenderPosition } from '../framework/render.js';
import NoPointsListView from '../view/no-points-view.js';
import { SortTypes, NEW_POINT, filter, UserAction, UpdateType, FilterType, TimeLimit } from '../const.js';
import { sortByField, getDuration, getOffersByType } from '../utils.js';
import RoutePointPresenter from './route-point-presenter.js';
import PointCreationPresenter from './create-point-presenter.js';
import RoutePointList from '../view/route-points-list-view.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';
import LoadingView from '../view/loading-view.js';
import ErrorView from '../view/error-view.js';

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
  #errorComponent = new ErrorView();
  #isLoading = true;
  #uiBlocker = new UiBlocker({
    lowerLimit: TimeLimit.LOWER_LIMIT,
    upperLimit: TimeLimit.UPPER_LIMIT
  });

  constructor({ pointsModel, eventsContainer, pointListComponent, filterModel }) {
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;
    this.#eventsContainer = eventsContainer;
    this.#tripEventsSection = eventsContainer;
    this.#pointListComponent = pointListComponent || new RoutePointList();
    this.#pointsModel.addObserver(this.#handleModelChange);
    this.#filterModel.addObserver(this.#handleModelChange);
    this.#handleUserAction = this.#handleUserAction.bind(this);

    this.#pointCreationPresenter = new PointCreationPresenter({
      filterModel: this.#filterModel,
      pointsModel: this.#pointsModel,
      pointListComponent: this.#pointListComponent,
      point: NEW_POINT,
      favoriteHandler: this.#handleUserAction,
      modeSwitchHandler: this.#handleModeChange.bind(this),
      onAddButtonClick: this.#onAddButtonClick.bind(this)
    });
  }

  #handleUserAction = async (actionType, updateType, update) => {
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
    this.#pointCreationPresenter.destroy();
    if (this.points.length === 0) {
      this.#renderEmptyState();
    }
  };

  async init() {
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
      destinations: this.destinations,
      offers: this.offers,
      favoriteHandler: (p) => {
        this.#handleUserAction(UserAction.UPDATE_POINT, UpdateType.PATCH, {
          ...p,
          isFavorite: !p.isFavorite
        });
      },
      modeSwitchHandler: this.#handleModeChange.bind(this),
      typeOffers: getOffersByType(this.offers, point.type),
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
    this.#pointCreationPresenter.destroy();
  }

  #renderLoading() {
    render(this.#loadingComponent, this.#eventsContainer, RenderPosition.BEFOREEND);
  }

  #renderError() {
    render(this.#errorComponent, this.#eventsContainer, RenderPosition.BEFOREEND);
  }

  #onAddButtonClick() {
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
    this.#currentSortType = SortTypes[0];
  }
}
