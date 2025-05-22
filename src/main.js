import Presenter from './presenter/main-presenter';
import PointsModel from './model/points-model';
import OffersModel from './model/offers-model';
import DestinationsModel from './model/destinations-model';

const pointsModel = new PointsModel();
const offersModel = new OffersModel();
const destinationsModel = new DestinationsModel();

const presenter = new Presenter({pointsModel, offersModel, destinationsModel});

presenter.init();
