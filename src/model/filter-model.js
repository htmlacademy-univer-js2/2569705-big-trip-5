import Observable from '../framework/observable';
import { FilterType } from '../const.js';

export default class FilterModel extends Observable {
  #filter = FilterType.EVERYTHING;

  get filter() {
    return this.#filter;
  }

  setFilter(updateType, filter) {
    this.#filter = filter ? filter : this.#filter;
    this._notify(updateType, filter);
  }
}
