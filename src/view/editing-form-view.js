import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { formatDate } from '../utils.js';
import { Formats, EventTypes } from '../const.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

export default class FormEditing extends AbstractStatefulView {
  #allOffers = null;
  #allDestinations = null;
  #onSubmitButtonClick = null;
  #onCancelButtonClick = null;
  #datepickerStart = null;
  #datepickerEnd = null;

  constructor({ point, offers, destinations, onSubmitButtonClick, onCancelButtonClick }) {
    super();
    this.#allOffers = offers;
    this.#allDestinations = destinations;
    this.#onSubmitButtonClick = onSubmitButtonClick;
    this.#onCancelButtonClick = onCancelButtonClick;

    this._setState(point);
    this._restoreHandlers();
  }

  get template() {
    return createEditFormTemplate(this._state, this.#allOffers, this.#allDestinations);
  }

  #validateForm() {
    const { price, dateFrom, dateTo } = this._state;

    if (price <= 0) {
      throw new Error('Price must be greater than zero.');
    }

    if (new Date(dateFrom) > new Date(dateTo)) {
      throw new Error('End date cannot be earlier than start date.');
    }
  }

  #handleSubmit = (evt) => {
    evt.preventDefault();
    this.#validateForm();
    this.#onSubmitButtonClick(this._state);
  };

  #handleReset = () => {
    this.#onCancelButtonClick();
  };

  #handleTypeSelection = (evt) => {
    if (!evt.target.closest('input')) {
      return;
    }

    const newType = evt.target.value;
    const currentOffers = this._state.offers;
    const newTypeOffers = this.#allOffers.find((offer) => offer.type === newType);

    const updatedOffers = currentOffers.filter((offerId) =>
      newTypeOffers.offers.some((offer) => offer.id === offerId)
    );

    this.updateElement({
      type: newType,
      offers: updatedOffers
    });
  };

  #handleOfferSelection = (evt) => {
    if (evt.target.checked) {
      this._setState({
        offers: [...this._state.offers, parseInt(evt.target.dataset.id, 10)]
      });
    }
  };

  #handleDestinationUpdate = (evt) => {
    const selectedDestinationName = evt.target.value;
    const newDestination = this.#allDestinations.find((dest) => dest.name === selectedDestinationName);

    if (!newDestination) {
      evt.target.value = '';
      return;
    }

    this.updateElement({
      destination: newDestination.id
    });
  };

  #handlePriceChange = (evt) => {
    this._setState({
      price: evt.target.value
    });
  };

  reset(point) {
    this.updateElement(point);
  }

  #dateFromChangeHandler = ([userDate]) => {
    this._setState({
      point: {
        ...this._state.point,
        dateFrom: userDate,
      }
    });
    this.#datepickerEnd.set('minDate', this._state.point.dateFrom);
  };

  #dateToChangeHandler = ([userDate]) => {
    this._setState({
      point: {
        ...this._state.point,
        dateTo: userDate,
      }
    });
  };

  #setDatepicker() {
    this.#datepickerStart = flatpickr(
      this.element.querySelector('input[name=\'event-start-time\']'),
      {
        dateFormat: 'd/m/y H:i',
        enableTime: true,
        'time_24hr': true,
        defaultDate: this._state.dateFrom,
        onChange: this.#dateFromChangeHandler
      }
    );

    this.#datepickerEnd = flatpickr(
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

  removeElement() {
    super.removeElement();
    if (this.#datepickerStart) {
      this.#datepickerStart.destroy();
      this.#datepickerStart = null;
    }

    if (this.#datepickerEnd) {
      this.#datepickerEnd.destroy();
      this.#datepickerEnd = null;
    }
  }


  _restoreHandlers() {
    this.element.querySelector('form').addEventListener('submit', this.#handleSubmit);
    this.element.querySelector('form').addEventListener('reset', this.#handleReset);
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#handleReset);
    this.element.querySelector('.event__type-group').addEventListener('click', this.#handleTypeSelection);
    this.element.querySelector('.event__available-offers').addEventListener('change', this.#handleOfferSelection);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#handleDestinationUpdate);
    this.element.querySelector('.event__input--price').addEventListener('input', this.#handlePriceChange);
    this.#setDatepicker();
  }
}

function createEventTypeList(currentType) {
  return EventTypes.map((eventType) => `
    <div class="event__type-item">
      <input
        id="event-type-${eventType}-1"
        class="event__type-input visually-hidden"
        type="radio"
        name="event-type"
        value="${eventType}"
        ${eventType === currentType ? 'checked' : ''}>
      <label class="event__type-label event__type-label--${eventType}" for="event-type-${eventType}-1">
        ${eventType.charAt(0).toUpperCase() + eventType.slice(1)}
      </label>
    </div>
  `).join('');
}

function generateAvailableOffers(offersForType, selectedOffers) {
  return offersForType.offers.map((offer) => `
    <div class="event__offer-selector">
      <input
        class="event__offer-checkbox visually-hidden"
        id="event-offer-${offer.title.replace(/\s+/g, '-')}-${offer.id}"
        type="checkbox"
        name="event-offer-${offer.title.replace(/\s+/g, '-')}"
        data-id="${offer.id}"
        ${selectedOffers.includes(offer.id) ? 'checked' : ''}>
      <label class="event__offer-label" for="event-offer-${offer.title.replace(/\s+/g, '-')}-${offer.id}">
        <span class="event__offer-title">${offer.title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${offer.price}</span>
      </label>
    </div>
  `).join('');
}

function createEditFormTemplate(point, allOffers, allDestinations) {
  const {basePrice, dateFrom, dateTo, destination, offers, type} = point;
  const currentTypeOffers = allOffers.find((offer) => offer.type === type);
  const destinationInfo = allDestinations.find((item) => item.id === destination);

  const destinationOptions = allDestinations.map((dest) => `<option value="${dest.name}"></option>`).join('');

  const startDateFormatted = formatDate(dateFrom, Formats.FULL_DATE);
  const endDateFormatted = formatDate(dateTo, Formats.FULL_DATE);
  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox">
            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${createEventTypeList(type)}
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
              type="text"
              name="event-destination"
              value="${destinationInfo.name}"
              list="destination-list-1">
            <datalist id="destination-list-1">
              ${destinationOptions}
            </datalist>
          </div>

          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input
              class="event__input event__input--time"
              id="event-start-time-1"
              type="text"
              name="event-start-time"
              value="${startDateFormatted}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input
              class="event__input event__input--time"
              id="event-end-time-1"
              type="text"
              name="event-end-time"
              value="${endDateFormatted}">
          </div>

          <div class="event__field-group event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input
              class="event__input event__input--price"
              id="event-price-1"
              type="text"
              name="event-price"
              value="${basePrice}">
          </div>

          <button class="event__save-btn btn btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Delete</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>

        <section class="event__details">
          <section class="event__section event__section--offers">
            <h3 class="event__section-title event__section-title--offers">Offers</h3>
            <div class="event__available-offers">
              ${generateAvailableOffers(currentTypeOffers, offers)}
            </div>
          </section>

          <section class="event__section event__section--destination">
            <h3 class="event__section-title event__section-title--destination">Destination</h3>
            <p class="event__destination-description">${destinationInfo.description}</p>
            <div class="event__photos-container">
              <div class="event__photos-tape">
                ${destinationInfo.pictures.map((image) => `<img class="event__photo" src="${image.src}" alt="${image.description}">`).join('')}
              </div>
            </div>
          </section>
        </section>
      </form>
    </li>
  `;
}
