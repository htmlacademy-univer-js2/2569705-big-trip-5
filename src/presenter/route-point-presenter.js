import RoutePoint from '../view/route-point-view.js';
import FormEditing from '../view/editing-form-view.js';
import { render, replace, remove } from '../framework/render.js';
import { UserAction, UpdateType } from '../const.js';

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
  #typeOffers = null;

  constructor({ container, destinations, offers, favoriteHandler, modeSwitchHandler, typeOffers }) {
    this.#container = container;
    this.#destinationsData = destinations;
    this.#offersData = offers;
    this.#onFavoriteToggle = favoriteHandler;
    this.#onModeSwitch = modeSwitchHandler;
    this.#typeOffers = typeOffers;
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

    if (this.#container.element.contains(prevPointView.element)) {
      replace(this.#pointView, prevPointView);
    }

    if (this.#container.element.contains(prevEditForm.element)) {
      replace(this.#editFormView, prevEditForm);
    }

    remove(prevPointView);
    remove(prevEditForm);
  }

  resetView() {
    if (this.#currentMode !== 'VIEW') {
      this.#editFormView.reset(this.#dataPoint);
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
      this.#editFormView.reset(this.#dataPoint);
      this.#switchToViewMode();
      document.removeEventListener('keydown', this.#handleEscapeKey);
    }
  };

  #createPointView() {
    return new RoutePoint({
      point: this.#dataPoint,
      destinations: this.#destinationsData,
      onEditButtonClick: this.#switchToEditMode.bind(this),
      onFavoriteButtonClick: this.#updateFavoriteStatus()
    });
  }

  #createEditFormView() {
    return new FormEditing({
      point: this.#dataPoint,
      destinations: this.#destinationsData,
      offers: this.#offersData,
      onCancelButtonClick: () => this.#handleFormAction('cancel'),
      onSubmitButtonClick: () => this.#handleFormAction('submit'),
      typeOffers: this.#typeOffers,
      onDeleteClick: this.#handleDeleteButtonClick
    });
  }

  #handleDeleteButtonClick = (point) => {
    this.#onModeSwitch(UserAction.DELETE_POINT, UpdateType.MINOR, point);
  };

  #handleFormAction = (action) => {
    if (action === 'submit') {
      this.#onModeSwitch(UserAction.UPDATE_POINT, UpdateType.MINOR, this.#dataPoint);
    } else if (action === 'cancel') {
      this.#editFormView.reset(this.#dataPoint);
    }

    this.#switchToViewMode();
    document.removeEventListener('keydown', this.#handleEscapeKey);
  };
}
