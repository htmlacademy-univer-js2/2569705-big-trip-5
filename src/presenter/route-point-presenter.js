import RoutePoint from '../view/route-point-view.js';
import EditingForm from '../view/editing-form-view.js';
import { render, replace, remove } from '../framework/render.js';
import { UserAction, UpdateType, ModeType } from '../const.js';
import { getOffersByType, isEscapeKey } from '../utils.js';

export default class RoutePointPresenter {
  #container = null;
  #dataPoint = null;
  #destinationsData = null;
  #offersData = null;

  #pointView = null;
  #editFormView = null;

  #favoriteToggleHandler = null;
  #modeSwitchHandler = null;

  #currentMode = ModeType.VIEW;
  #typeOffers = null;
  #actionHandler = null;

  constructor({ container, destinations, offers, actionHandler, favoriteHandler, modeSwitchHandler, typeOffers }) {
    this.#container = container;
    this.#destinationsData = destinations;
    this.#offersData = offers;
    this.#actionHandler = actionHandler;
    this.#favoriteToggleHandler = favoriteHandler;
    this.#modeSwitchHandler = modeSwitchHandler;
    this.#typeOffers = typeOffers;
  }

  clearElements(){
    remove(this.#pointView);
    remove(this.#editFormView);
  }

  destroy() {
    this.clearElements();
    document.removeEventListener('keydown', this.#escapeKeyHandler);
  }

  init(point) {
    const prevPointView = this.#pointView;
    const prevEditForm = this.#editFormView;

    this.#dataPoint = point;
    this.#typeOffers = getOffersByType(this.#offersData, point.type);

    this.#pointView = this.#createPointView();
    this.#editFormView = this.#createEditFormView();

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
    if (this.#currentMode !== ModeType.VIEW) {
      this.#editFormView.reset(this.#dataPoint);
      this.#switchToViewMode();
    }
  }

  #switchToEditMode = () => {
    this.#modeSwitchHandler();
    replace(this.#editFormView, this.#pointView);
    document.addEventListener('keydown', this.#escapeKeyHandler);
    this.#currentMode = ModeType.EDIT;
  };

  #switchToViewMode() {
    replace(this.#pointView, this.#editFormView);
    document.removeEventListener('keydown', this.#escapeKeyHandler);
    this.#currentMode = ModeType.VIEW;
  }

  #updateFavoriteStatus = () => {
    const updatedPoint = {
      ...this.#dataPoint,
      isFavorite: this.#dataPoint.isFavorite
    };
    this.#favoriteToggleHandler(updatedPoint);
    this.#dataPoint = updatedPoint;
  };

  #escapeKeyHandler = (evt) => {
    if (isEscapeKey(evt)) {
      evt.preventDefault();
      this.#editFormView.reset(this.#dataPoint);
      this.#switchToViewMode();
      document.removeEventListener('keydown', this.#escapeKeyHandler);
    }
  };

  #createPointView() {
    return new RoutePoint({
      point: this.#dataPoint,
      destinations: this.#destinationsData,
      offers: this.#typeOffers,
      editButtonClickHandler: this.#switchToEditMode,
      favoriteButtonClickHandler: this.#updateFavoriteStatus
    });
  }

  #createEditFormView() {
    return new EditingForm({
      point: this.#dataPoint,
      destinations: this.#destinationsData,
      offers: this.#offersData,
      formResetHandler: this.#formCancelHandler.bind(this),
      formSubmitHandler: this.#formSubmitHandler.bind(this),
      typeOffers: this.#typeOffers,
      deleteClickHandler: this.#deleteButtonClickHandler,
    });
  }

  #deleteButtonClickHandler = (point) => {
    this.#actionHandler(UserAction.DELETE_POINT, UpdateType.DELETE, point);
  };

  #formSubmitHandler = async (updatedPoint) => {
    const pointView = this.#pointView;
    const editFormView = this.#editFormView;

    const updateResult = await this.#actionHandler(UserAction.UPDATE_POINT, UpdateType.PATCH, updatedPoint);
    if (!updateResult && pointView && editFormView) {
      this.#switchToViewMode();
    }
  };

  #formCancelHandler = () => {
    this.#editFormView.reset(this.#dataPoint);
    this.#switchToViewMode();
  };

  setAborting() {
    if (this.#currentMode === ModeType.VIEW) {
      this.#pointView.shake();
      return;
    }

    this.#editFormView.shake(this.#editFormView.updateElement({ isDisabled: false, isSaving: false, isDeleting: false }));
  }

  setSaving() {
    if (this.#currentMode === ModeType.EDIT) {
      this.#editFormView.updateElement({ isDisabled: true, isSaving: true });
    }
  }

  setDeleting() {
    if (this.#currentMode === ModeType.EDIT) {
      this.#editFormView.updateElement({ isDisabled: true, isDeleting: true });
    }
  }
}
