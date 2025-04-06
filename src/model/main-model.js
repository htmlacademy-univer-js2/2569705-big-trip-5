import { destinationsMock } from '../mock/destinations-mock';
import { offersMock } from '../mock/offers-mock';
import { pointsMock } from '../mock/points-mock';

export default class MainModel {

  get points() {
    return [...pointsMock];
  }

  get offers() {
    return [...offersMock];
  }

  get destinations() {
    return [...destinationsMock];
  }
}
