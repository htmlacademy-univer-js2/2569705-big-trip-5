import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { getFullDate, capitalizeWord, getDestinationById } from '../utils.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

export default class EditingForm extends AbstractStatefulView {
  #offers = null;
  #destinations = [];
  #formSubmitHandler = null;
  #formResetHandler = null;
  #startDate = null;
  #endDate = null;
  #editDeleteHandler = null;
  #typeOffers = null;

  constructor({ point, offers, destinations, formSubmitHandler, formResetHandler = null, typeOffers, deleteClickHandler }) {
    super();
    this._setState(EditingForm.parsePointToState(point, point.destination, typeOffers));
    this.#offers = offers;
    this.#destinations = destinations;
    this.#formSubmitHandler = formSubmitHandler;
    this.#formResetHandler = formResetHandler;
    this.#editDeleteHandler = deleteClickHandler;
    this.#typeOffers = typeOffers;
    this._restoreHandlers();
  }

  get template() {
    return createFormEditingTemplate(this._state, this.#destinations, this.#offers, this.#typeOffers);
  }

  #validateForm() {
    const { basePrice, dateFrom, dateTo, destination } = this._state;

    if (basePrice <= 0) {
      throw new Error('Price must be greater than zero.');
    }

    if (new Date(dateFrom) > new Date(dateTo)) {
      throw new Error('End date cannot be earlier than start date.');
    }

    const isValidDestination = this.#destinations.some((dest) => dest.id === destination);
    if (!isValidDestination) {
      throw new Error('Invalid destination.');
    }
  }

  #setDatepicker() {
    this.#startDate = flatpickr(
      this.element.querySelector('input[name=\'event-start-time\']'),
      {
        dateFormat: 'd/m/y H:i',
        enableTime: true,
        'time_24hr': true,
        defaultDate: this._state.dateFrom,
        onChange: this.#dateFromChangeHandler
      }
    );
    this.#endDate = flatpickr(
      this.element.querySelector('input[name=\'event-end-time\']'),
      {
        dateFormat: 'd/m/y H:i',
        enableTime: true,
        'time_24hr': true,
        defaultDate: this._state.dateTo,
        onChange: this.#dateToChangeHandler,
        minDate: this._state.dateFrom
      }
    );
  }

  #submitHandler = async (evt) => {
    evt.preventDefault();
    try {
      this.#validateForm();
      await this.#formSubmitHandler(this._state);
    } catch (error) {
      throw new Error;
    }
  };

  #editDeleteClickHandler = (evt) => {
    const deleteButton = evt.target;
    deleteButton.disabled = true;
    this.#editDeleteHandler(this._state);
  };

  #typeChangeHandler = (evt) => {
    evt.preventDefault();
    const targetType = evt.target.value;
    const typeOfferGroup = this.#offers.find((item) => item.type === targetType);
    this.#typeOffers = typeOfferGroup?.offers || [];
    if (typeOfferGroup) {
      this.updateElement({
        type: targetType,
        offers: []
      });
    }
  };

  #offerChangeHandler = (evt) => {
    const offerId = evt.target.value;
    const isChecked = evt.target.checked;

    this.updateElement({
      offers: isChecked
        ? [...this._state.offers, offerId]
        : this._state.offers.filter((id) => id !== offerId)
    });
  };

  #destinationChangeHandler = (evt) => {
    const newDestination = this.#destinations.find((dest) => dest.name === evt.target.value);
    if (newDestination) {
      this.updateElement({
        destination: newDestination.id
      });
    } else {
      evt.target.value = '';
    }
  };

  #priceChangeHandler = (evt) => {
    evt.preventDefault();
    evt.target.value = Number(evt.target.value.replace(/[^0-9]/g, ''));
    this._setState({
      basePrice: Number(evt.target.value)
    });
  };

  #dateFromChangeHandler = ([userDate]) => {
    this._setState({
      dateFrom: userDate
    });
    this.#endDate.set('minDate', this._state.dateFrom);
  };

  #dateToChangeHandler = ([userDate]) => {
    this._setState({
      dateTo: userDate
    });
  };

  _restoreHandlers() {
    this.element.querySelector('form').addEventListener('submit', this.#submitHandler);
    if (this.#formResetHandler) {
      this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#formResetHandler);
    }
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#editDeleteClickHandler);
    this.element.querySelector('.event__type-list').addEventListener('change', this.#typeChangeHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationChangeHandler);
    this.element.querySelector('.event__input--price').addEventListener('input', this.#priceChangeHandler);
    this.element.querySelectorAll('.event__offer-checkbox').forEach((checkbox) => {
      checkbox.addEventListener('change', this.#offerChangeHandler);
    });
    const typeOffers = this.element.querySelectorAll('.event__offer-checkbox');
    typeOffers.forEach((offer) => offer.addEventListener('change', this.#offerChangeHandler));
    this.#setDatepicker();
  }

  reset(point) {
    this.updateElement(point);
  }

  static parsePointToState(point, destinationInfo) {
    return {
      ...point,
      destination: destinationInfo
    };

  }
}

function generateAvailableOffers(offersForType, selectedOffers, isDisabled) {
  return offersForType.map((offer) => `
    <div class="event__offer-selector">
      <input
        class="event__offer-checkbox visually-hidden"
        id="event-offer-${offer.id}"
        type="checkbox"
        name="event-offer"
        value="${offer.id}"
        ${selectedOffers.includes(offer.id) ? 'checked' : '' } ${isDisabled ? 'disabled' : ''}
      >
      <label class="event__offer-label" for="event-offer-${offer.id}">
        <span class="event__offer-title">${offer.title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${offer.price}</span>
      </label>
    </div>
  `).join('');
}

function createFormEditingTemplate(point, destinations, allOffers, typeOffers) {
  const { basePrice, dateFrom, dateTo, destination, type, isSaving, isDeleting, isDisabled, isPointCreation} = point;
  const pointTypeOffers = typeOffers;
  const destinationInfo = getDestinationById(destinations, destination);
  const eventTypes = Array.from(allOffers.map((item) => item.type));
  const destinationsList = destinations
    .map((dest) => `<option value="${dest.name}"></option>`)
    .join('');
  const isValid = getFullDate(dateFrom) !== 'Invalid Date';
  const startDate = isValid ? getFullDate(dateFrom) : '';
  const endDate = isValid ? getFullDate(dateTo) : '';
  const deleteButtonText = isDeleting ? 'Deleting...' : 'Delete';
  const saveButtonText = isSaving ? 'Saving...' : 'Save';
  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type.toLowerCase()}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox" ${isDisabled ? 'disabled' : ''}>
            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${eventTypes.map((types) => `
                      <div class="event__type-item">
                        <input id="event-type-${types.toLowerCase()}-1" class="event__${types.toLowerCase()}-input ${isDisabled ? 'disabled' : ''} visually-hidden" type="radio" name="event-type" value="${types.toLowerCase()}">
                        <label class="event__type-label event__type-label--${types.toLowerCase()}" for="event-type-${types.toLowerCase()}-1">${capitalizeWord(types)}</label>
                      </div>
                    `).join('')}
              </fieldset>
            </div>
          </div>
          <div class="event__field-group event__field-group--destination">
            <label class="event__label event__type-output" for="event-destination-1">
              ${type}
            </label>
            <input
              class="event__input event__input--destination"
              id="event-destination-1"
              type="text" ${isDisabled ? 'disabled' : ''}
              name="event-destination"
              value="${destinationInfo?.name || ''}"
              list="destination-list-1"
              required
            >
            <datalist id="destination-list-1">
              ${destinationsList}
            </datalist>
          </div>
          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input event__input--time" id="event-start-time-1" type="text" name="event-start-time" ${isDisabled ? 'disabled' : ''} value="${startDate}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input event__input--time" id="event-end-time-1" type="text" name="event-end-time" ${isDisabled ? 'disabled' : ''} value="${endDate}">
          </div>
          <div class="event__field-group event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input event__input--price" id="event-price-1" type="text" name="event-price"  ${isDisabled ? 'disabled' : ''} value="${basePrice}">
          </div>
          <button class="event__save-btn btn btn--blue" type="submit"${isDisabled ? 'disabled' : ''}>${saveButtonText}</button>
          <button class="event__reset-btn" type="reset"${isDisabled ? 'disabled' : ''}>${isPointCreation ? 'Cancel' : deleteButtonText}</button>
          ${isValid ? `
            <button class="event__rollup-btn" type="button">
              <span class="visually-hidden">Open event</span>
            </button>
          ` : ''}
        </header>
        <section class="event__details">
          ${pointTypeOffers.length > 0 ? `
            <section class="event__section event__section--offers">
              <h3 class="event__section-title event__section-title--offers">Offers</h3>
              <div class="event__available-offers">
                ${generateAvailableOffers(pointTypeOffers, point.offers, isDisabled)}
              </div>
            </section>
          ` : ''}
          ${destinationInfo && (destinationInfo.description !== '' || destinationInfo.pictures.length > 0) ? `
            <section class="event__section event__section--destination">
              <h3 class="event__section-title event__section-title--destination">Destination</h3>
              <p class="event__destination-description">${destinationInfo.description}</p>
              <div class="event__photos-container">
                <div class="event__photos-tape">
                  ${destinationInfo.pictures.map((image) => `
                        <img class="event__photo" src="${image.src}" alt="${image.description}">
                      `).join('')}
                </div>
              </div>
            </section>
          ` : ''}
        </section>
      </form>
    </li>
  `;
}
