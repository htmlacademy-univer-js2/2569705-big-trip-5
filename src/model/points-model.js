import { pointsMock } from '../mock/points-mock';

export default class PointsModel {
  get points() {
    return [...pointsMock];
  }
}
