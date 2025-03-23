import FormCreation from '../view/creation-form-view.js';
import FormEditing from '../view/editing-form-view.js';
import RoutePoint from '../view/route-point-view.js';
import RoutePointsList from '../view/route-points-list-view.js';
import Filters from '../view/filters-view.js';
import Sorting from '../view/sorting-view.js';
import { render } from '../render.js';

export default class Presenter {
  RoutePointsListComponent = new RoutePointsList();

  constructor({mainModel}) {
    this.mainModel = mainModel;
    this.tripEvents = document.querySelector('.trip-events');
    this.tripControlFilters = document.querySelector('.trip-controls__filters');
  }

  init() {
    this.points = this.mainModel.getPoints();
    this.offers = this.mainModel.getOffers();
    this.destinations = this.mainModel.getDestinations();

    render(new Filters(), this.tripControlFilters);
    render(new Sorting(), this.tripEvents);
    render(this.RoutePointsListComponent, this.tripEvents);
    render(new FormEditing({point: this.points[0], destinations: this.destinations}), this.RoutePointsListComponent.getElement());

    this.points.forEach((point) => {
      render(new RoutePoint({point, destinations: this.destinations}), this.RoutePointsListComponent.getElement());
    });

    render(new FormCreation(), this.RoutePointsListComponent.getElement());
  }
}
