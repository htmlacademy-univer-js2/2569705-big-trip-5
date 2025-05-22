import { destinationsMock } from '../mock/destinations-mock';

export default class DestinationsModel {
  get destinations() {
    return [...destinationsMock];
  }
}
