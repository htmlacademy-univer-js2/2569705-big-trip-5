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
    const previousFilterComponent = this.#filterComponent;

    this.#filterComponent = new Filters({
      filters: filtersData,
      activeFilterType: this.#filterModel.filter,
      onFilterChange: this.#handleFilterTypeChange.bind(this)
    });

    if (!previousFilterComponent) {
      render(this.#filterComponent, this.#filtersContainer);
      return;
    }

    replace(this.#filterComponent, previousFilterComponent);
    remove(previousFilterComponent);
  }

  #handleModelChange = () => {
    this.init();
  };

  #handleFilterTypeChange = (filterType) => {
    if (this.#filterModel.filter === filterType) {
      return;
    }
    this.#filterModel.setFilter(UpdateType.MAJOR, filterType);
  };
}
