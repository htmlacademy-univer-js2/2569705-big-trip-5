import dayjs from 'dayjs';

const getDestinationById = (destinations, id) => destinations.find((item) => item.id === id);

const getOfferById = (offers, id) => {
  for (let i = 0; i < offers.length; i++) {
    if (offers[i].id === id) {
      return offers[i];
    }
  }
};

const getFullDate = (date) => dayjs(date).format('DD/MM/YY HH:mm');
const capitalizeWord = (word) => word.charAt(0).toUpperCase() + word.slice(1);

const getDayAndMonth = (date) => dayjs(date).format('D MMM');
const getRouteInfo = (points, destinations, offers) => {
  if (!points || points.length === 0) {
    return {
      dates: ['', ''],
      route: '',
      price: 0,
    };
  }

  const dates = [
    getDayAndMonth(points[points.length - 1].dateFrom),
    getDayAndMonth(points[0].dateTo),
  ];

  const routeNames = points.map((point) =>
    getDestinationById(destinations, point.destination).name
  );
  const route =
    routeNames.length < 4
      ? routeNames.reverse().join(' &mdash; ')
      : `${routeNames[routeNames.length - 1]} &mdash; ... &mdash; ${routeNames[0]}`;

  const price = points.reduce((total, point) => {
    const basePrice = Number(point.basePrice);
    const offersType = getOffersByType(offers, point.type);
    const additionalPrice = point.offers.reduce(
      (sum, offer) => sum + Number(getOfferById(offersType, offer).price),
      0
    );
    return total + basePrice + additionalPrice;
  }, 0);

  return { dates, route, price };
};

function isEscapeKey(evt) {
  return evt.key === 'Escape';
}

function formatDate(date, format) {
  return date ? dayjs(date).format(format) : '';
}

function getOffersByType(offers, type) {
  const offerGroup = offers.find((group) => group.type === type);
  return offerGroup ? offerGroup.offers : [];
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

export {formatDate, getDestinationById, getOffersByType, getDuration,
  isPointFuture, isPointPast, isPointPresent, sortByField, getOfferById,
  getFullDate, capitalizeWord, getRouteInfo, isEscapeKey};

