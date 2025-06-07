import RoutePoint from '../view/route-point-view.js';
import FormEditing from '../view/editing-form-view.js';
import { render, replace, remove } from '../framework/render.js';
import { UserAction, UpdateType } from '../const.js';
import { getOffersByType } from '../utils.js';

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
  #onAction = null;

  constructor({ container, destinations, offers, actionHandler, favoriteHandler, modeSwitchHandler, typeOffers }) {
    this.#container = container;
    this.#destinationsData = destinations;
    this.#offersData = offers;
    this.#onAction = actionHandler;
    this.#onFavoriteToggle = favoriteHandler;
    this.#onModeSwitch = modeSwitchHandler;
    this.#typeOffers = typeOffers;
  }

  clearElements(){
    remove(this.#pointView);
    remove(this.#editFormView);
  }

  destroy() {
    this.clearElements();
    document.removeEventListener('keydown', this.#handleEscapeKey);
  }

  init(point) {
    const prevPointView = this.#pointView;
    const prevEditForm = this.#editFormView;

    this.#dataPoint = point; // Обновляем данные
    this.#typeOffers = getOffersByType(this.#offersData, point.type);

    // Полное пересоздание представлений
    this.#pointView = this.#createPointView();
    this.#editFormView = this.#createEditFormView();

    // // Замена старых элементов новыми
    if (prevPointView === null || prevEditForm === null) {
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

  #switchToEditMode = () => {
    this.#onModeSwitch();
    replace(this.#editFormView, this.#pointView);
    document.addEventListener('keydown', this.#handleEscapeKey);
    this.#currentMode = 'EDIT';
  };

  #switchToViewMode() {
    replace(this.#pointView, this.#editFormView);
    document.removeEventListener('keydown', this.#handleEscapeKey);
    this.#currentMode = 'VIEW';
  }

  #updateFavoriteStatus = () => {
    const updatedPoint = {
      ...this.#dataPoint,
      isFavorite: this.#dataPoint.isFavorite
    };
    this.#onFavoriteToggle(updatedPoint); // Передаем обновленные данные
    this.#dataPoint = updatedPoint;
  };

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
      offers: this.#typeOffers,
      onEditButtonClick: this.#switchToEditMode,
      onFavoriteButtonClick: this.#updateFavoriteStatus
    });
  }

  #createEditFormView() {
    return new FormEditing({
      point: this.#dataPoint,
      destinations: this.#destinationsData,
      offers: this.#offersData,
      onFormReset: this.#handleFormCancel.bind(this),
      onFormSubmit: this.#handleFormSubmit.bind(this),
      typeOffers: this.#typeOffers,
      onDeleteClick: this.#handleDeleteButtonClick,
    });
  }

  #handleDeleteButtonClick = (point) => {
    // this.#switchToViewMode();
    this.#onAction(UserAction.DELETE_POINT, UpdateType.DELETE, point);
  };

  #handleFormSubmit = async (updatedPoint) => {
    // Сохраняем ссылки на элементы ДО асинхронной операции
    const pointView = this.#pointView;
    const editFormView = this.#editFormView;

    const e = await this.#onAction(UserAction.UPDATE_POINT, UpdateType.PATCH, updatedPoint);

    // Проверяем, существуют ли ещё элементы
    if (!e && pointView && editFormView) {
      this.#switchToViewMode();
    }
  };

  #handleFormCancel = () => {
    this.#editFormView.reset(this.#dataPoint);
    this.#switchToViewMode();
  };

  setAborting() {
    if (this.#currentMode === 'VIEW') {
      this.#pointView.shake();
      return;
    }

    this.#editFormView.shake(this.#editFormView.updateElement({ isDisabled: false, isSaving: false, isDeleting: false }));
  }

  setSaving() {
    if (this.#currentMode === 'EDIT') {
      this.#editFormView.updateElement({ isDisabled: true, isSaving: true });
    }
  }

  setDeleting() {
    if (this.#currentMode === 'EDIT') {
      this.#editFormView.updateElement({ isDisabled: true, isDeleting: true });
    }
  }
}
