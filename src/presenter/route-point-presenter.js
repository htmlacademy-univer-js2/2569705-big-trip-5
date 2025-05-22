import RoutePoint from '../view/route-point-view.js';
import FormEditing from '../view/editing-form-view.js';
import { render, replace, remove } from '../framework/render.js';

export default class RoutePointPresenter {
  #container = null;
  #dataPoint = null;
  #destinationsData = null;
  #offersData = null;

  #pointView = null;
  #editFormView = null;

  #onFavoriteToggle = null;
  #onModeSwitch = null;

  #currentMode = 'VIEW';

  constructor({ container, destinations, offers, favoriteHandler, modeSwitchHandler }) {
    this.#container = container;
    this.#destinationsData = destinations;
    this.#offersData = offers;
    this.#onFavoriteToggle = favoriteHandler;
    this.#onModeSwitch = modeSwitchHandler;
  }

  clearElements(){
    remove(this.#pointView);
    remove(this.#editFormView);
  }

  init(point) {
    const prevPointView = this.#pointView;
    const prevEditForm = this.#editFormView;

    this.#dataPoint = point;
    this.#pointView = this.#createPointView();
    this.#editFormView = this.#createEditFormView();

    if (!prevPointView || !prevEditForm) {
      render(this.#pointView, this.#container.element);
      return;
    }

    if (this.#currentMode === 'VIEW') {
      replace(this.#pointView, prevPointView);
    } else {
      replace(this.#editFormView, prevEditForm);
    }
    remove(prevPointView);
    remove(prevEditForm);
  }

  resetView() {
    if (this.#currentMode !== 'VIEW') {
      this.#switchToViewMode();
    }
  }

  #switchToEditMode() {
    replace(this.#editFormView, this.#pointView);
    document.addEventListener('keydown', this.#handleEscapeKey);
    this.#onModeSwitch();
    this.#currentMode = 'EDIT';
  }

  #switchToViewMode() {
    replace(this.#pointView, this.#editFormView);
    document.removeEventListener('keydown', this.#handleEscapeKey);
    this.#currentMode = 'VIEW';
  }

  #updateFavoriteStatus() {
    this.#onFavoriteToggle({ ...this.#dataPoint, isFavorite: !this.#dataPoint.isFavorite });
  }

  #handleEscapeKey = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.#switchToViewMode();
      document.removeEventListener('keydown', this.#handleEscapeKey);
    }
  };

  #createPointView() {
    return new RoutePoint({
      point: this.#dataPoint,
      destinations: this.#destinationsData,
      offers: this.#offersData,
      onEditButtonClick: () => this.#switchToEditMode(),
      onFavoriteButtonClick: () => this.#updateFavoriteStatus()
    });
  }

  #createEditFormView() {
    return new FormEditing({
      point: this.#dataPoint,
      destinations: this.#destinationsData,
      offers: this.#offersData,
      onCancelButtonClick: () => this.#handleFormAction('cancel'),
      onSubmitButtonClick: () => this.#handleFormAction('submit')
    });
  }

  #handleFormAction(action) {
    if (['submit', 'cancel'].includes(action)) {
      this.#switchToViewMode();
    }
  }
}
