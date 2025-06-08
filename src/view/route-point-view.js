import AbstractView from '../framework/view/abstract-view.js';
import { formatDate, getDestinationById, getDuration, getOfferById } from '../utils';
import { Formats } from '../const';

export default class RoutePoint extends AbstractView {
  #point = null;
  #destinations = null;
  #offers = null;
  constructor({ point, destinations, offers, onEditButtonClick, onFavoriteButtonClick }) {
    super();

    this.#point = point;
    this.#destinations = destinations;
    this.#offers = offers;

    this.#addEventListeners(onEditButtonClick, onFavoriteButtonClick);
  }

  #addEventListeners(onEditButtonClick, onFavoriteButtonClick) {
    const rollupButton = this.element.querySelector('.event__rollup-btn');
    const favoriteButton = this.element.querySelector('.event__favorite-btn');

    if (rollupButton) {
      rollupButton.addEventListener('click', (event) => {
        event.preventDefault();
        onEditButtonClick();
      });
    }

    if (favoriteButton) {
      favoriteButton.addEventListener('click', (event) => {
        event.preventDefault();
        onFavoriteButtonClick();
      });
    }
  }

  get template() {
    return createRoutePointTemplate(this.#point, this.#destinations, this.#offers);
  }
}

function createRoutePointTemplate(point, destinations, allOffers) {
  const {basePrice, dateFrom, dateTo, destination, isFavorite, type, offers} = point;

  const dayValue = formatDate(dateFrom, Formats.TIME_TAG_VALUE);
  const day = formatDate(dateFrom, Formats.DAY);
  const timeStart = formatDate(dateFrom, Formats.TIME);
  const timeEnd = formatDate(dateTo, Formats.TIME);

  const destinationById = getDestinationById(destinations, destination);
  const duration = getDuration(dateFrom, dateTo, 'string');
  const offersObject = offers.map((id) => getOfferById(allOffers, id));
  const selectedOffers = offersObject ? offersObject
    .map((offer) => `
      <li class="event__offer">
        <span class="event__offer-title">${offer.title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${offer.price}</span>
      </li>
    `)
    .join('') : '';

  const favorite = isFavorite ? 'event__favorite-btn--active' : '';

  return `<li class="trip-events__item">
            <div class="event">
              <time class="event__date" datetime=""${dayValue}">${day}</time>
              <div class="event__type">
                <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
              </div>
              <h3 class="event__title">${type} ${destinationById.name}</h3>
              <div class="event__schedule">
                <p class="event__time">
                  <time class="event__start-time" datetime="${dateFrom}">${timeStart}</time>
                  &mdash;
                  <time class="event__end-time" datetime="${dateTo}">${timeEnd}</time>
                </p>
                <p class="event__duration">${duration}</p>
              </div>
              <p class="event__price">
                &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
              </p>
              <h4 class="visually-hidden">Offers:</h4>
              <ul class="event__selected-offers">
                ${selectedOffers}
              </ul>
              <button class="event__favorite-btn ${favorite}" type="button">
                <span class="visually-hidden">Add to favorite</span>
                <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
                  <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
                </svg>
              </button>
              <button class="event__rollup-btn" type="button">
                <span class="visually-hidden">Open event</span>
              </button>
            </div>
          </li>`;
}
