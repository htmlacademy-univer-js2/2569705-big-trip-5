import FormEditing from '../view/editing-form-view.js';
import RoutePoint from '../view/route-point-view.js';
import RoutePointsList from '../view/route-points-list-view.js';
import Filters from '../view/filters-view.js';
import Sorting from '../view/sorting-view.js';
import { render, replace } from '../framework/render.js';
import NoPointsListView from '../view/no-points-view.js';
import { generateFilter } from '../mock/filters-mock.js';

export default class Presenter {
  #RoutePointListComponent = new RoutePointsList();

  #mainModel = null;
  #tripEvents = null;
  #tripControlFilters = null;
  #points = null;
  #destinations = null;
  #offers = null;

  constructor({mainModel}) {
    this.#mainModel = mainModel;
    this.#tripEvents = document.querySelector('.trip-events');
    this.#tripControlFilters = document.querySelector('.trip-controls__filters');
  }

  init() {
    this.#points = this.#mainModel.points;
    this.#offers = this.#mainModel.offers;
    this.#destinations = this.#mainModel.destinations;

    const filters = generateFilter(this.#points);

    if (this.#points.length > 0) {
      render(new Filters({filters}), this.#tripControlFilters);
      render(new Sorting(), this.#tripEvents);
      render(this.#RoutePointListComponent, this.#tripEvents);

      this.#points.forEach((point) => {
        this.#renderPoint(point);
      });
    } else {
      render(new NoPointsListView(), this.#tripEvents);
    }
  }

  #renderPoint(point) {
    const escKeyHandler = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        replaceEditFormToPoint();
        document.removeEventListener('keydown', escKeyHandler);
      }
    };

    const editForm = new FormEditing({point, destinations: this.#destinations, offers: this.#offers,
      onSubmitClick: () => {
        replaceEditFormToPoint();
        document.removeEventListener('keydown', escKeyHandler);
      },
      onRollButtonClick: () => {
        replaceEditFormToPoint();
        document.removeEventListener('keydown', escKeyHandler);
      }
    });

    const pointItem = new RoutePoint({point, destinations: this.#destinations, offers: this.#offers,
      onRollButtonClick: () => {
        replacePointToEditForm();
        document.addEventListener('keydown', escKeyHandler);
      }
    });

    function replacePointToEditForm() {
      replace(editForm, pointItem);
    }

    function replaceEditFormToPoint() {
      replace(pointItem, editForm);
    }

    render(pointItem, this.#RoutePointListComponent.element);
  }
}
