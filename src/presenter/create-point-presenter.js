import FormEditing from '../view/editing-form-view.js';
import { render, remove, RenderPosition } from '../framework/render.js';
import { UserAction, UpdateType } from '../const.js';
import { getOffersByType } from '../utils.js';

export default class PointCreationPresenter {
  #pointListComponent = null;
  #pointEditComponent = null;
  #filterModel = null;
  #pointsModel = null;
  #addButton = document.querySelector('.trip-main__event-add-btn');
  #point = null;
  #favoriteHandler = null;
  #modeSwitchHandler = null;
  #onAddButtonClick = null;


  constructor({ filterModel, pointsModel, pointListComponent, point, favoriteHandler, modeSwitchHandler, onAddButtonClick}) {
    this.#filterModel = filterModel;
    this.#pointsModel = pointsModel;
    this.#pointListComponent = pointListComponent;
    this.#point = point;
    this.#favoriteHandler = favoriteHandler;
    this.#modeSwitchHandler = modeSwitchHandler;
    this.#onAddButtonClick = onAddButtonClick;
    this.#addButton.removeEventListener('click', this.#handleAddButtonClick);
    this.#handleAddButtonClick = this.#handleAddButtonClick.bind(this);
    this.#addButton.addEventListener('click', this.#handleAddButtonClick);
  }

  init() {
    if (this.#pointEditComponent) {
      remove(this.#pointEditComponent);
    }

    this.#pointEditComponent = new FormEditing({
      point: this.#point,
      typeOffers: getOffersByType(this.#pointsModel.offers, this.#point.type),
      offers: this.#pointsModel.offers,
      destinations: this.#pointsModel.destinations,
      onFormSubmit: this.#handleFormSubmit.bind(this),
      onDeleteClick: this.destroy
    });

    render(
      this.#pointEditComponent,
      this.#pointListComponent.element,
      RenderPosition.AFTERBEGIN
    );
  }

  #handleAddButtonClick = () => {
    this.#onAddButtonClick();
    this.#modeSwitchHandler();
    document.addEventListener('keydown', this.#onEscKeydown);
    this.init();
    this.#addButton.disabled = true;
  };

  #handleFormSubmit = (update) => {
    this.#favoriteHandler(
      UserAction.ADD_POINT,
      UpdateType.MAJOR,
      update
    );
    if (update.isSaving) {
      this.#filterModel.setFilter(UpdateType.MAJOR, 'everything');
      document.removeEventListener('keydown', this.#onEscKeydown);
      this.destroy();
    }
  };

  #onEscKeydown = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.destroy();
      document.removeEventListener('keydown', this.#onEscKeydown);
    }
  };

  destroy = () => {
    if (this.#pointEditComponent) {
      remove(this.#pointEditComponent);
      this.#pointEditComponent = null;
    }
    this.#addButton.disabled = false;
    document.removeEventListener('keydown', this.#onEscKeydown);
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
