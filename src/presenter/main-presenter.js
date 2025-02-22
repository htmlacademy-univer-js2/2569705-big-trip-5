import FormCreation from '../view/creation-form-view.js';
import FormEditing from '../view/editing-form-view.js';
import RoutePoint from '../view/route-point-view.js';
import RoutePointsList from '../view/route-points-list-view.js';
import Filters from '../view/filters-view.js';
import Sorting from '../view/sorting-view.js';
import { render } from '../render.js';

const ROUTE_POINTS_COUNT = 3;

export default class Presenter {
  RoutePointsListComponent = new RoutePointsList();

  constructor() {
    this.tripEvents = document.querySelector('.trip-events');
    this.tripControlsFilters = document.querySelector('.trip-controls__filters');
  }

  init() {
    render(new Filters(), this.tripControlsFilters);
    render(new Sorting(), this.tripEvents);
    render(this.RoutePointsListComponent, this.tripEvents);
    render(new FormEditing(), this.RoutePointsListComponent.getElement());

    for (let i = 0; i < ROUTE_POINTS_COUNT; i++) {
      render(new RoutePoint(), this.RoutePointsListComponent.getElement());
    }

    render(new FormCreation(), this.RoutePointsListComponent.getElement());
  }
}
