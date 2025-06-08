import { isPointFuture, isPointPast, isPointPresent, sortByField } from './utils';
import dayjs from 'dayjs';

const DEFAULT_POINT = {
  type: 'flight',
  destination: '',
  dateFrom: '',
  dateTo: '',
  basePrice: 0,
  offers: [],
  isFavorite: false,
};

const SORT_TYPES = ['day', 'event', 'time', 'price', 'offers'];

const SORT = {
  [SORT_TYPES[0]]: (points) => sortByField(points, 'dateFrom', 'desc'),
  [SORT_TYPES[2]]: (points) => {
    const pointsWithDuration = points.map((point) => ({
      ...point,
      duration: dayjs(point.dateTo).diff(dayjs(point.dateFrom)),
    }));
    return sortByField(pointsWithDuration, 'duration', 'desc');
  },
  [SORT_TYPES[3]]: (points) => sortByField(points, 'basePrice', 'desc'),
};

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

const FILTER = {
  [FilterType.EVERYTHING]: (points) => [...points],
  [FilterType.FUTURE]: (points) => points.filter((point) => isPointFuture(point)),
  [FilterType.PRESENT]: (points) => points.filter((point) => isPointPresent(point)),
  [FilterType.PAST]: (points) => points.filter((point) => isPointPast(point))
};

const ModeType = {
  VIEW: 'VIEW',
  EDIT: 'EDIT'
};

const UserAction = {
  UPDATE_POINT: 'UPDATE_POINT',
  ADD_POINT: 'ADD_POINT',
  DELETE_POINT: 'DELETE_POINT'
};

const UpdateType = {
  PATCH: 'PATCH',
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

const BlockLimit = {
  LOWER_LIMIT: 400,
  UPPER_LIMIT: 800
};

const ServerConfig = {
  END_POINT: 'https://24.objects.htmlacademy.pro/big-trip',
  AUTHORIZATION: 'Basic 742398hjydtuk6'
};

export { Formats, FILTER, SORT_TYPES, DEFAULT_POINT, UserAction, UpdateType, NoEventsMessages, FilterType, Method, BlockLimit, ModeType, ServerConfig, SORT };
