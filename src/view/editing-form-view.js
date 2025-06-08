import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { getFullDate, capitalizeWord, getDestinationById } from '../utils.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

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
  setTimeout(() => {
    notificationElement.remove();
  }, 5000);
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
  const { basePrice, dateFrom, dateTo, destination, type, isSaving, isDeleting, isDisabled} = point;
  const pointTypeOffers = typeOffers;
  const destinationInfo = getDestinationById(destinations, destination);
  const eventTypes = Array.from(allOffers.map((item) => item.type));
  const renderDestinationsList = destinations
    .map((dest) => `<option value="${dest.name}"></option>`)
    .join('');
  const isValid = getFullDate(dateFrom) !== 'Invalid Date';
  const startDate = isValid ? getFullDate(dateFrom) : '';
  const endDate = isValid ? getFullDate(dateTo) : '';
  const deleteText = isDeleting ? 'Deleting...' : 'Delete';
  const saveText = isSaving ? 'Saving...' : 'Save';
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
              ${renderDestinationsList}
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
          <button class="event__save-btn btn btn--blue" type="submit"${isDisabled ? 'disabled' : ''}>${saveText}</button>
          <button class="event__reset-btn" type="reset"${isDisabled ? 'disabled' : ''}>${deleteText}</button>
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

export default class FormEditing extends AbstractStatefulView {
  #offers = null;
  #destinations = [];
  #handleFormSubmit = null;
  #handleFormReset = null;
  #datepickerStart = null;
  #datepickerEnd = null;
  #handleEditDelete = null;
  #typeOffers = null;

  constructor({ point, offers, destinations, onFormSubmit, onFormReset = null, typeOffers, onDeleteClick }) {
    super();
    this._setState(FormEditing.parsePointToState(point, point.destination, typeOffers));
    this.#offers = offers;
    this.#destinations = destinations;
    this.#handleFormSubmit = onFormSubmit;
    this.#handleFormReset = onFormReset;
    this.#handleEditDelete = onDeleteClick;
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

  #handleSubmit = async (evt) => {
    evt.preventDefault();
    try {
      this.#validateForm();
      await this.#handleFormSubmit(this._state);
    } catch (error) {
      showNotification(error.message, 'error', document.body);
    }
  };

  #handleReset = (evt) => {
    evt.preventDefault();
    this.#handleFormReset();
  };

  #handleEditDeleteClick = (evt) => {
    const deleteButton = evt.target;
    deleteButton.disabled = true;
    this.#handleEditDelete(this._state);
  };

  #handleTypeChange = (evt) => {
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

  #handleOfferChange = (evt) => {
    const offerId = evt.target.value;
    const isChecked = evt.target.checked;

    this.updateElement({
      offers: isChecked
        ? [...this._state.offers, offerId]
        : this._state.offers.filter((id) => id !== offerId)
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
    evt.preventDefault();
    evt.target.value = Number(evt.target.value.replace(/[^0-9]/g, ''));
    this._setState({
      basePrice: Number(evt.target.value)
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
      this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#handleFormReset);
    }
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#handleEditDeleteClick);
    this.element.querySelector('.event__type-list').addEventListener('change', this.#handleTypeChange);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#handleDestinationChange);
    this.element.querySelector('.event__input--price').addEventListener('input', this.#handlePriceChange);
    this.element.querySelectorAll('.event__offer-checkbox').forEach((checkbox) => {
      checkbox.addEventListener('change', this.#handleOfferChange);
    });
    const typeOffers = this.element.querySelectorAll('.event__offer-checkbox');
    typeOffers.forEach((offer) => offer.addEventListener('change', this.#handleOfferChange));
    this.#setDatepicker();
  }

  static parsePointToState(point, destinationInfo) {
    return {
      ...point,
      destination: destinationInfo
    };

  }
}
