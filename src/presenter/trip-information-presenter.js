import { remove, render, RenderPosition } from '../framework/render';
import TripInformation from '../view/trip-information-view';

export default class TripPresenter {
  #container = null;
  #pointsModel = null;
  #tripComponent = null;

  constructor({ container, pointsModel }) {
    this.#container = container;
    this.#pointsModel = pointsModel;
    this.#pointsModel.addObserver(this.#modelChangeHandler);
  }

  init() {
    remove(this.#tripComponent);
    this.#tripComponent = new TripInformation({ pointsModel: this.#pointsModel });
    render(this.#tripComponent, this.#container, RenderPosition.AFTERBEGIN);
  }

  #modelChangeHandler = () => {
    this.init();
  };
}
