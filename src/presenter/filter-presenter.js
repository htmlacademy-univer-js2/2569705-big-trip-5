import { render, remove, replace } from '../framework/render.js';
import { FilterType, UpdateType, filter } from '../const.js';
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
    this.#filterModel.addObserver(this.#handleModelChange);
    this.#pointsModel.addObserver(this.#handleModelChange);
  }

  get filters() {
    const points = this.#pointsModel.points;

    return Object.values(FilterType).map((type) => ({
      type,
      points: filter[type](points)
    }));
  }

  init() {
    const filtersData = this.filters;
    const prevFilterComponent = this.#filterComponent;
    this.#filterComponent = new Filters({
      filters: filtersData,
      activeFilterType: this.#filterModel.filter,
      onFilterTypeChange: this.#handleFilterTypeChange
    });

    if (!prevFilterComponent) {
      render(this.#filterComponent, this.#filtersContainer);
      return;
    }

    replace(this.#filterComponent, prevFilterComponent);
    remove(prevFilterComponent);
  }

  #handleModelChange = () => {
    this.init();
  };

  #handleFilterTypeChange = (filterType) => {
    if (this.#filterModel.filter === filterType || this.filters.some((item) => item.type === filterType && item.points.length === 0)) {
      return;
    }
    this.#filterModel.setFilter(UpdateType.MAJOR, filterType);
  };
}
