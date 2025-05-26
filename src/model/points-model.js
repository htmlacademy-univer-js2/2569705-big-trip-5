import { pointsMock } from '../mock/points-mock';
import Observable from '../framework/observable.js';
import { getAllDestinations, getAllOffers } from '../utils.js';

export default class PointsModel extends Observable {
  #points = pointsMock;
  #allDestinations = getAllDestinations();
  #allOffers = getAllOffers();

  get points() {
    return [...this.#points];
  }

  get destinations() {
    return this.#allDestinations;
  }

  get offers() {
    return this.#allOffers;
  }

  updatePoint(updateType, updatedPoint) {
    const pointExists = this.#points.some((point) => point.id === updatedPoint.id);
    if (!pointExists) {
      throw new Error('Cannot update a non-existent point');
    }

    this.#points = this.#points.map((point) =>
      point.id === updatedPoint.id ? updatedPoint : point
    );

    this._notify(updateType, updatedPoint);
  }

  addPoint(updateType, newPoint) {
    this.#points = [newPoint, ...this.#points];
    this._notify(updateType, newPoint);
  }

  deletePoint(updateType, pointId) {
    const pointExists = this.#points.some((point) => point.id === pointId);
    if (!pointExists) {
      throw new Error('Cannot delete a non-existent point');
    }

    this.#points = this.#points.filter((point) => point.id !== pointId);

    this._notify(updateType, { id: pointId });
  }
}
