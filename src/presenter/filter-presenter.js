import { render, remove, replace } from '../framework/render.js';
import { FILTER, FilterType, UpdateType } from '../const.js';
import Filters from '../view/filters-view.js';

export default class FilterPresenter {
  #filtersContainer = null;
  #filterModel = null;
  #pointsModel = null;
  #filterComponent = null;

  constructor({filtersContainer, filterModel, pointsModel}) {
    this.#filtersContainer = filtersContainer;
    this.#filterModel = filterModel;
    this.#pointsModel = pointsModel;
    this.#filterModel.addObserver(this.#modelChangeHandler);
    this.#pointsModel.addObserver(this.#modelChangeHandler);
  }

  get filters() {
    const points = this.#pointsModel.points;

    return Object.values(FilterType).map((type) => ({
      type,
      points: FILTER[type](points)
    }));
  }

  init() {
    const filtersData = this.filters;
    const prevFilterComponent = this.#filterComponent;
    this.#filterComponent = new Filters({
      filters: filtersData,
      activeFilterType: this.#filterModel.filter,
      filterTypeChangeHandler: this.#filterTypeChangeHandler.bind()
    });

    if (!prevFilterComponent) {
      render(this.#filterComponent, this.#filtersContainer);
      return;
    }

    replace(this.#filterComponent, prevFilterComponent);
    remove(prevFilterComponent);
  }

  #modelChangeHandler = () => {
    this.init();
  };

  #filterTypeChangeHandler = (filterType) => {
    if (this.#filterModel.filter === filterType || this.filters.some((item) => item.type === filterType && item.points.length === 0)) {
      return;
    }
    this.#filterModel.setFilter(UpdateType.MAJOR, filterType);
  };
}
