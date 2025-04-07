import AbstractView from '../framework/view/abstract-view.js';

function createNoPointsListTemplate() {
  return '<p class="trip-events__msg">Click New Event to create your first point</p>';
}

export default class NoPointsListView extends AbstractView{
  get template() {
    return createNoPointsListTemplate();
  }
}
