import { offersMock } from '../mock/offers-mock';

export default class OffersModel {
  get offers() {
    return [...offersMock];
  }
}
