import { destinationsMock } from '../mock/destinations-mock';
import { offersMock } from '../mock/offers-mock';
import { pointsMock } from '../mock/points-mock';

export default class MainModel {
  points = [...pointsMock];
  offers = [...offersMock];
  destinations = [...destinationsMock];

  getPoints() {
    return this.points;
  }

  getOffers() {
    return this.offers;
  }

  getDestinations() {
    return this.destinations;
  }
}
