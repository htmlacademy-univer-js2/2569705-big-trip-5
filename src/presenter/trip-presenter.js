import { remove, render, RenderPosition } from '../framework/render';
import TripView from '../view/trip-view';

export default class TripPresenter {
  #container = null;
  #pointsModel = null;
  #tripComponent = null;

  constructor({ container, pointsModel }) {
    this.#container = container;
    this.#pointsModel = pointsModel;
    this.#pointsModel.addObserver(this.#handleModelChange);
  }

  init() {
    remove(this.#tripComponent);
    this.#tripComponent = new TripView({ pointsModel: this.#pointsModel });
    render(this.#tripComponent, this.#container, RenderPosition.AFTERBEGIN);
  }

  #handleModelChange = () => {
    this.init();
  };
}
