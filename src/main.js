import Presenter from './presenter/main-presenter';
import PointsModel from './model/points-model';
import FilterPresenter from './presenter/filter-presenter.js';
import RoutePointList from './view/route-points-list-view.js';
import FilterModel from './model/filter-model.js';

const pointsModel = new PointsModel();
const filterModel = new FilterModel();
const pointListComponent = new RoutePointList();

const eventsContainer = document.querySelector('.trip-events');
const filtersContainer = document.querySelector('.trip-controls__filters');

const presenter = new Presenter({
  eventsContainer: eventsContainer,
  pointListComponent: pointListComponent,
  pointsModel: pointsModel,
  filterModel: filterModel
});

const filterPresenter = new FilterPresenter({
  filtersContainer: filtersContainer,
  filterModel: filterModel,
  pointsModel: pointsModel
});

presenter.init();
filterPresenter.init();
