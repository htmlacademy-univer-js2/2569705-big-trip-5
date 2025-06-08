import Observable from '../framework/observable.js';
import { UpdateType } from '../const.js';

export default class PointsModel extends Observable {
  #points = [];
  #allDestinations = [];
  #allOffers = [];
  #pointsApiService = null;
  #isLoading = true;
  constructor({ pointsApiService }) {
    super();
    this.#pointsApiService = pointsApiService;
  }

  get points() {
    return this.#points;
  }

  get destinations() {
    return this.#allDestinations;
  }

  get offers() {
    return this.#allOffers;
  }

  async updatePoint(updateType, update) {
    const pointExists = this.points.some((point) => point.id === update.id);
    if (!pointExists) {
      throw new Error('Cannot update a non-existent point');
    }

    try {
      const response = await this.#pointsApiService.updatePoint(update);
      const updatedPoint = this.#adaptPoint(response);
      this.#points = this.#points.map((point) =>
        point.id === updatedPoint.id ? { ...point, ...updatedPoint } : point
      );
      this._notify(updateType, updatedPoint);
    } catch {
      throw new Error('Can\'t update point');
    }
  }

  async addPoint(updateType, point) {
    try {
      const response = await this.#pointsApiService.addPoint(point);
      const update = this.#adaptPoint(response);
      this.#points = [...this.#points, update];
      this._notify(updateType, update);
    } catch {
      throw new Error('Can\'t add unexiscting point');
    }
  }

  async deletePoint(updateType, update) {
    try {
      await this.#pointsApiService.deletePoint(update);
      this.#points = this.#points.filter((item) => item.id !== update.id);
      this._notify(updateType, update);
    } catch {
      throw new Error('Can\'t delete point');
    }
  }

  get loading() {
    return this.#isLoading;
  }

  async init() {
    let isLoadingFailed = false;
    try {
      const points = await this.#pointsApiService.points;
      this.#points = points.map((point) => this.#adaptPoint(point));
      this.#allDestinations = await this.#pointsApiService.destinations;
      this.#allOffers = await this.#pointsApiService.offers;
      this.#isLoading = false;
    } catch {
      this.#points = [];
      this.#allDestinations = [];
      this.#allOffers = [];
      this.#isLoading = false;
      isLoadingFailed = true;
    }

    this._notify(UpdateType.INIT, { isLoadingFailed });
  }

  #adaptPoint = (point) => {
    const adaptedPoint = {
      ...point,
      basePrice: point['base_price'],
      dateFrom: point['date_from'],
      dateTo: point['date_to'],
      isFavorite: point['is_favorite'],
    };

    delete adaptedPoint['base_price'];
    delete adaptedPoint['date_from'];
    delete adaptedPoint['date_to'];
    delete adaptedPoint['is_favorite'];

    return adaptedPoint;
  };
}
