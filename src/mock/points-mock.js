import { getRandomArrayElement } from '../utils';

const minPrice = 200;
const maxPrice = 10000;

const pointsMock = [
  {
    'id': 'c36f89d5-d102-4e7d-94f9-8cfe70ba4d63',
    'basePrice': getRandomArrayElement(minPrice, maxPrice),
    'dateFrom': '2025-04-24T14:18:12.270Z',
    'dateTo': '2025-04-26T08:51:12.270Z',
    'destination': 'c2a294fa-3f37-4f10-9d63-3489742e1ac4',
    'isFavorite': false,
    'offers': [
      'b727cf17-35b5-4311-8222-51511441fb75',
      'a7d13c12-44f9-497a-b70b-0f88bef1400a'
    ],
    'type': 'train'
  },
  {
    'id': '3f83ce6b-8db3-460b-8408-5c5328de1118',
    'basePrice': getRandomArrayElement(minPrice, maxPrice),
    'dateFrom': '2025-04-28T02:08:12.270Z',
    'dateTo': '2025-04-28T15:02:12.270Z',
    'destination': '53834f26-a3d2-46a1-b84a-db07d6791f07',
    'isFavorite': true,
    'offers': [],
    'type': 'drive'
  },
  {
    'id': '8de640c8-efec-486b-9bcc-d22c5995aaa2',
    'basePrice': getRandomArrayElement(minPrice, maxPrice),
    'dateFrom': '2025-05-01T03:51:12.270Z',
    'dateTo': '2025-05-01T19:29:12.270Z',
    'destination': '59987bad-1f4c-4a5c-bbbd-6191552fbe23',
    'isFavorite': false,
    'offers': [],
    'type': 'sightseeing'
  },
  {
    'id': '12c00444-6e3b-49ec-896e-0c4e4b12fe22',
    'basePrice': getRandomArrayElement(minPrice, maxPrice),
    'dateFrom': '2025-05-06T18:16:12.270Z',
    'dateTo': '2025-05-08T00:34:12.270Z',
    'destination': 'a2479cc7-10bf-42b3-b937-e8447477e0ef',
    'isFavorite': true,
    'offers': [
      '8b48b545-89bb-4fc7-a967-88bc0086d77d'
    ],
    'type': 'ship'
  },
  {
    'id': '0bb2978a-22dd-489c-9270-0b9a7ed5d3f1',
    'basePrice': getRandomArrayElement(minPrice, maxPrice),
    'dateFrom': '2025-05-09T05:52:12.270Z',
    'dateTo': '2025-05-11T05:00:12.270Z',
    'destination': 'b7fb13be-e8a2-4283-9f32-b44618094e63',
    'isFavorite': false,
    'offers': [
      '270a1d38-ea1a-419f-8e59-2cfce02f981c',
      'ee13004d-9874-4051-a913-a7574db76405',
      'd3f26da0-fbab-4ccd-b9cf-d159e352dfad'
    ],
    'type': 'bus'
  },
  {
    'id': '939d2033-abe0-4c5c-b528-4c71182c306f',
    'basePrice': getRandomArrayElement(minPrice, maxPrice),
    'dateFrom': '2025-06-04T21:32:12.270Z',
    'dateTo': '2025-06-05T11:36:12.270Z',
    'destination': 'baedac68-2c53-44e3-b891-3db3e709653d',
    'isFavorite': false,
    'offers': [],
    'type': 'check-in'
  },
  {
    'id': '3e0eb21e-fc7b-4167-a4bf-d176fc15a049',
    'basePrice': getRandomArrayElement(minPrice, maxPrice),
    'dateFrom': '2025-06-23T00:13:12.270Z',
    'dateTo': '2025-06-23T10:45:12.270Z',
    'destination': '59987bad-1f4c-4a5c-bbbd-6191552fbe23',
    'isFavorite': true,
    'offers': [
      'ee13004d-9874-4051-a913-a7574db76405',
      'd3f26da0-fbab-4ccd-b9cf-d159e352dfad'
    ],
    'type': 'bus'
  }
];

export {pointsMock};
