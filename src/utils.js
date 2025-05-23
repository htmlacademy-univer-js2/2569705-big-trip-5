import dayjs from 'dayjs';
import { offersMock } from './mock/offers-mock';

function getRandomArrayElement(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


function formatDate(date, format) {
  return date ? dayjs(date).format(format) : '';
}

function getDestinationById(id, destinations) {
  return destinations.find((destination) => destination.id === id);
}

function getOffersByType(point) {
  return offersMock.find((offer) => offer.type === point.type).offers;
}

function getDuration(dateFrom, dateTo, format = 'number'){
  const start = dayjs(dateFrom);
  const end = dayjs(dateTo);
  const difference = end.diff(start, 'minute');

  if (format === 'string') {
    if (difference > (60 * 24)) {
      const days = Math.floor(difference / (60 * 24));
      const remainder = difference % (60 * 24);
      const hours = Math.floor(remainder / 60);
      const minutes = remainder % 60;
      return `${String(days).padStart(2,'0')}D ${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M`;
    } else if (difference > 60){
      const hours = Math.floor(difference / 60);
      const minutes = difference % 60;
      return `${String(hours).padStart(2,'0')}H ${String(minutes).padStart(2,'0')}M`;
    } else {
      return `${String(difference).padStart(2,'0')}M`;
    }
  }
  return difference;
}

function isPointPresent(point) {
  return dayjs().isAfter(dayjs(point.dateFrom)) && dayjs().isBefore(dayjs(point.dateTo));
}

function isPointFuture(point) {
  return dayjs().isBefore(dayjs(point.dateFrom));
}

function isPointPast(point) {
  return dayjs().isAfter(dayjs(point.dateTo));
}

function updatePointById(points, updatedPoint) {
  return points.map((point) => point.id === updatedPoint.id ? updatedPoint : point);
}

function sortByField(points, field, order) {
  return points.sort((pointA, pointB) => {
    if (field === 'dateFrom' || field === 'dateTo') {
      const dateA = dayjs(pointA[field]);
      const dateB = dayjs(pointB[field]);

      if (order === 'asc') {
        return dateA.isBefore(dateB) ? -1 : 1;
      } else {
        return dateA.isAfter(dateB) ? -1 : 1;
      }
    } else if (field === 'duration') {
      const durationA = pointA[field];
      const durationB = pointB[field];

      if (order === 'asc') {
        return durationA - durationB;
      } else {
        return durationB - durationA;
      }
    } else {
      const valueA = pointA[field];
      const valueB = pointB[field];

      if (order === 'asc') {
        return valueA - valueB;
      } else {
        return valueB - valueA;
      }
    }
  });
}

export {getRandomArrayElement, formatDate, getDestinationById, getOffersByType, getDuration, isPointFuture, isPointPast, isPointPresent, updatePointById, sortByField};
