import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { getFullDate, capitalizeWord, getDestinationById, getOfferById } from '../utils.js';
import { EventTypes } from '../const.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

// Функция для создания всплывающего уведомления
function showNotification(message, type = 'error', container) {
  const notificationElement = document.createElement('div');
  notificationElement.className = `notification notification--${type}`;
  notificationElement.textContent = message;
  notificationElement.style.position = 'fixed';
  notificationElement.style.top = '20px';
  notificationElement.style.right = '20px';
  notificationElement.style.padding = '10px 20px';
  notificationElement.style.backgroundColor = type === 'error' ? '#ff4d4d' : '#4caf50';
  notificationElement.style.color = '#fff';
  notificationElement.style.borderRadius = '5px';
  notificationElement.style.zIndex = '1000';
  container.appendChild(notificationElement);

  // Автоматическое удаление уведомления через 5 секунд
  setTimeout(() => {
    notificationElement.remove();
  }, 5000);
}

function createFormEditingTemplate(point, destinations) {
  const { basePrice, dateFrom, dateTo, destination, typeOffers, type } = point;
  const pointTypeOffers = typeOffers.map((id) => getOfferById(id));
  const destinationInfo = getDestinationById(destination);
  const renderDestinationsList = destinations
    .map((dest) => `<option value="${dest.name}"></option>`)
    .join('');
  const isValid = getFullDate(dateFrom) !== 'Invalid Date';
  const startDate = isValid ? getFullDate(dateFrom) : '';
  const endDate = isValid ? getFullDate(dateTo) : '';

  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type.toLowerCase()}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox">
            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${EventTypes.map((types) => `
                      <div class="event__type-item">
                        <input id="event-type-${types.toLowerCase()}-1" class="event__${types.toLowerCase()}-input visually-hidden" type="radio" name="event-type" value="${types.toLowerCase()}">
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
              type="text"
              name="event-destination"
              value="${destinationInfo?.name || ''}"
              list="destination-list-1"
              required
            >
            <datalist id="destination-list-1">
              ${renderDestinationsList}
            </datalist>
          </div>
          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${startDate}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${endDate}">
          </div>
          <div class="event__field-group event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice}">
          </div>
          <button class="event__save-btn btn btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Delete</button>
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
                ${pointTypeOffers.map((offer) => `
                      <div class="event__offer-selector">
                        <input class="event__offer-checkbox visually-hidden" id="event-offer-${offer.title.toLowerCase()}-1" type="checkbox" name="event-offer-${offer.title.toLowerCase()}">
                        <label class="event__offer-label" for="event-offer-${offer.title.toLowerCase()}-1">
                          <span class="event__offer-title">${offer.title}</span>
                          &plus;&euro;&nbsp;
                          <span class="event__offer-price">${offer.price}</span>
                        </label>
                      </div>
                    `).join('')}
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

export default class FormEditing extends AbstractStatefulView {
  #point = null;
  #offers = null;
  #destinations = [];
  #handleFormSubmit = null;
  #handleFormReset = null;
  #datepickerStart = null;
  #datepickerEnd = null;
  #handleEditDelete = null;

  constructor({ point, offers, destinations, onFormSubmit, onFormReset = null, typeOffers, onDeleteClick }) {
    super();
    this.#point = point;
    this._setState(FormEditing.parsePointToState(point, point.destination, typeOffers));
    this.#offers = offers;
    this.#destinations = destinations;
    this.#handleFormSubmit = onFormSubmit;
    this.#handleFormReset = onFormReset;
    this.#handleEditDelete = onDeleteClick;
    this._restoreHandlers();
  }

  get template() {
    return createFormEditingTemplate(this._state, this.#destinations);
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

  #handleSubmit = (evt) => {
    evt.preventDefault();
    try {
      this.#validateForm();
      this.#handleFormSubmit(this._state);
      showNotification('Form submitted successfully!', 'success', document.body);
    } catch (error) {
      showNotification(error.message, 'error', document.body);
    }
  };

  #handleReset = (evt) => {
    evt.preventDefault();
    this.#handleFormReset();
  };

  #handleEditDeleteClick = (evt) => {
    evt.preventDefault();
    this.#handleEditDelete(this.#point);
  };

  #handleTypeChange = (evt) => {
    const targetType = evt.target.value;
    const typeOffers = this.#offers.find((item) => item.type === targetType).offers.map((offer) => offer.id);
    this.updateElement({
      type: targetType,
      typeOffers: typeOffers,
      offers: typeOffers
    });
  };

  #handleDestinationChange = (evt) => {
    const newDestination = this.#destinations.find((dest) => dest.name === evt.target.value);
    if (newDestination) {
      this.updateElement({
        destination: newDestination.id
      });
    } else {
      evt.target.value = '';
      showNotification('Please select a valid destination.', 'error', document.body);
    }
  };

  #handlePriceChange = (evt) => {
    const price = Number(evt.target.value.replace(/[^0-9]/g, ''));
    if (price <= 0) {
      evt.target.style.borderColor = 'red';
      showNotification('Price must be greater than zero.', 'error', document.body);
    } else {
      evt.target.style.borderColor = '';
    }
    this._setState({
      basePrice: price
    });
  };

  reset(point) {
    this.updateElement(point);
  }

  #dateFromChangeHandler = ([userDate]) => {
    this._setState({
      dateFrom: userDate
    });
    this.#datepickerEnd.set('minDate', this._state.dateFrom);
  };

  #dateToChangeHandler = ([userDate]) => {
    this._setState({
      dateTo: userDate
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

  _restoreHandlers() {
    this.element.querySelector('form').addEventListener('submit', this.#handleSubmit);
    if (this.#handleFormReset) {
      this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#handleReset);
    }
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#handleEditDeleteClick);
    this.element.querySelector('.event__type-group').addEventListener('change', this.#handleTypeChange);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#handleDestinationChange);
    this.element.querySelector('.event__input--price').addEventListener('input', this.#handlePriceChange);
    this.#setDatepicker();
  }

  static parsePointToState(point, destinationInfo, typeOffers) {
    return {
      ...point,
      destination: destinationInfo,
      typeOffers
    };
  }
}
