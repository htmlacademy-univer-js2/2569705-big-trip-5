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

function getDuration(dateFrom, dateTo){
  const start = dayjs(dateFrom);
  const end = dayjs(dateTo);
  const difference = end.diff(start, 'minute');

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

function isPointPresent(point) {
  return dayjs().isAfter(dayjs(point.dateFrom)) && dayjs().isBefore(dayjs(point.dateTo));
}

function isPointFuture(point) {
  return dayjs().isBefore(dayjs(point.dateFrom));
}

function isPointPast(point) {
  return dayjs().isAfter(dayjs(point.dateTo));
}

export {getRandomArrayElement, formatDate, getDestinationById, getOffersByType, getDuration, isPointFuture, isPointPast, isPointPresent};
