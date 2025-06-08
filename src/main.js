import Presenter from './presenter/main-presenter';
import PointsModel from './model/points-model';
import FilterPresenter from './presenter/filter-presenter.js';
import RoutePointList from './view/route-points-list-view.js';
import FilterModel from './model/filter-model.js';
import PointsApiService from './server/points-api-service.js';
import TripPresenter from './presenter/trip-presenter.js';
import { ServerConfig } from './const.js';

const pointsModel = new PointsModel({pointsApiService: new PointsApiService(ServerConfig.END_POINT, ServerConfig.AUTHORIZATION)});
const filterModel = new FilterModel();
const pointListComponent = new RoutePointList();

const tripEventsElement = document.querySelector('.trip-events');
const filtersContainer = document.querySelector('.trip-controls__filters');
const tripContainer = document.querySelector('.trip-main');

const presenter = new Presenter({
  eventsContainer: tripEventsElement,
  pointListComponent: pointListComponent,
  pointsModel: pointsModel,
  filterModel: filterModel
});

const filterPresenter = new FilterPresenter({
  filtersContainer: filtersContainer,
  filterModel: filterModel,
  pointsModel: pointsModel
});

new TripPresenter({
  container: tripContainer,
  pointsModel: pointsModel
});

presenter.init();
pointsModel.init();
filterPresenter.init();
