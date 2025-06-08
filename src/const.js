import { isPointFuture, isPointPast, isPointPresent } from './utils';

const Formats = {
  TIME: 'HH:mm',
  DAY: 'MMM D',
  FULL_DATE: 'D/MM/YY HH:mm',
  TIME_TAG_VALUE: 'YYYY-MM-DD'
};

const FilterType = {
  EVERYTHING:'everything',
  FUTURE:'future',
  PRESENT: 'present',
  PAST:'past',
};

const filter = {
  [FilterType.EVERYTHING]: (points) => [...points],
  [FilterType.FUTURE]: (points) => points.filter((point) => isPointFuture(point)),
  [FilterType.PRESENT]: (points) => points.filter((point) => isPointPresent(point)),
  [FilterType.PAST]: (points) => points.filter((point) => isPointPast(point))
};

const modeType = {
  VIEW: 'VIEW',
  EDIT: 'EDIT'
};

const SortTypes = ['day', 'event', 'time', 'price', 'offers'];

const NEW_POINT = {
  type: 'flight',
  destination: '',
  dateFrom: '',
  dateTo: '',
  basePrice: 0,
  offers: [],
  isFavorite: false,
};


const UserAction = {
  UPDATE_POINT: 'UPDATE_POINT',
  ADD_POINT: 'ADD_POINT',
  DELETE_POINT: 'DELETE_POINT'
};

const UpdateType = {
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
  DELETE: 'DELETE',
  INIT: 'INIT'
};

const NoEventsMessages = {
  EVERYTHING: 'Click New Event to create your first point',
  PAST: 'There are no past events now',
  PRESENT: 'There are no present events now',
  FUTURE: 'There are no future events now'
};

const Method = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE'
};

const TimeLimit = {
  LOWER_LIMIT: 400,
  UPPER_LIMIT: 800
};

const ServerConfig = {
  END_POINT: 'https://24.objects.htmlacademy.pro/big-trip',
  AUTHORIZATION: 'Basic 742398hjydtuk6'
};

export { Formats, filter, SortTypes, NEW_POINT, UserAction, UpdateType, NoEventsMessages, FilterType, Method, TimeLimit, modeType, ServerConfig };
