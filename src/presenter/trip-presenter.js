import { remove, render, RenderPosition } from '../framework/render';
import TripInfoView from '../view/trip-view';

export default class TripInfoPresenter {
  #container = null;
  #pointsModel = null;
  #tripInfoComponent = null;

  constructor({ container, pointsModel }) {
    this.#container = container;
    this.#pointsModel = pointsModel;
    this.#pointsModel.addObserver(this.#handleModelChange);
  }

  init() {
    remove(this.#tripInfoComponent);
    this.#tripInfoComponent = new TripInfoView({ pointsModel: this.#pointsModel });
    render(this.#tripInfoComponent, this.#container, RenderPosition.AFTERBEGIN);
  }

  #handleModelChange = () => {
    this.init();
  };
}
