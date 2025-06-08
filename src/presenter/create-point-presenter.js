import EditingForm from '../view/editing-form-view.js';
import { render, remove, RenderPosition } from '../framework/render.js';
import { UserAction, UpdateType, FilterType } from '../const.js';
import { getOffersByType, isEscapeKey } from '../utils.js';

export default class PointCreationPresenter {
  #pointListComponent = null;
  #pointEditComponent = null;
  #filterModel = null;
  #pointsModel = null;
  #addButton = document.querySelector('.trip-main__event-add-btn');
  #point = null;
  #favoriteHandler = null;
  #modeSwitchHandler = null;
  #addButtonClickHandler = null;


  constructor({ filterModel, pointsModel, pointListComponent, point, favoriteHandler, modeSwitchHandler, addButtonClickHandler}) {
    this.#filterModel = filterModel;
    this.#pointsModel = pointsModel;
    this.#pointListComponent = pointListComponent;
    this.#point = point;
    this.#favoriteHandler = favoriteHandler;
    this.#modeSwitchHandler = modeSwitchHandler;
    this.#addButtonClickHandler = addButtonClickHandler;
    this.#addButton.removeEventListener('click', this.#addEventClickHandler);
    this.#addEventClickHandler = this.#addEventClickHandler.bind(this);
    this.#addButton.addEventListener('click', this.#addEventClickHandler);
  }

  init() {
    if (this.#pointEditComponent) {
      remove(this.#pointEditComponent);
    }

    this.#pointEditComponent = new EditingForm({
      point: this.#point,
      typeOffers: getOffersByType(this.#pointsModel.offers, this.#point.type),
      offers: this.#pointsModel.offers,
      destinations: this.#pointsModel.destinations,
      formSubmitHandler: this.#formSubmitHandler.bind(this),
      deleteClickHandler: this.destroy
    });

    render(
      this.#pointEditComponent,
      this.#pointListComponent.element,
      RenderPosition.AFTERBEGIN
    );
  }

  #addEventClickHandler = () => {
    this.#addButtonClickHandler();
    this.#modeSwitchHandler();
    document.addEventListener('keydown', this.#escKeydownHandler);
    this.init();
    this.#addButton.disabled = true;
  };

  #formSubmitHandler = (update) => {
    this.#favoriteHandler(
      UserAction.ADD_POINT,
      UpdateType.MAJOR,
      update
    );
    if (update.isSaving) {
      this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
      document.removeEventListener('keydown', this.#escKeydownHandler);
      this.destroy();
    }
  };

  #escKeydownHandler = (evt) => {
    if (isEscapeKey(evt)) {
      evt.preventDefault();
      this.destroy();
      document.removeEventListener('keydown', this.#escKeydownHandler);
    }
  };

  destroy = () => {
    if (this.#pointEditComponent) {
      remove(this.#pointEditComponent);
      this.#pointEditComponent = null;
    }
    this.#addButton.disabled = false;
    document.removeEventListener('keydown', this.#escKeydownHandler);
  };

  setAborting() {
    if (this.#pointEditComponent) {
      this.#pointEditComponent.shake(() => {
        this.#pointEditComponent.updateElement({ isSaving: false, isDisabled: false });
      });
    }
  }

  setSaving() {
    if (this.#pointEditComponent) {
      this.#pointEditComponent.updateElement({ isSaving: true, isDisabled: true });
    }
  }
}
