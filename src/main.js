import Presenter from './presenter/main-presenter.js';
import MainModel from './model/main-model.js';

const mainModel = new MainModel();
const presenter = new Presenter({mainModel});


presenter.init();
