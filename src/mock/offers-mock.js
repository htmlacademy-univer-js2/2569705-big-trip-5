import { getRandomArrayElement } from '../utils';

const minPrice = 100;
const maxPrice = 1500;

const offersMock = [
  {
    'type': 'taxi',
    'offers': [
      {
        'id': 'd551ec5f-99b7-4805-9b58-a9f792bc081f',
        'title': 'Upgrade to a business class',
        'price': getRandomArrayElement(minPrice, maxPrice)
      },
      {
        'id': '237b4955-0b7d-4376-ab8d-027f961147c4',
        'title': 'Choose the radio station',
        'price': getRandomArrayElement(minPrice, maxPrice)
      },
      {
        'id': '33d5e44f-003c-4bbc-a277-1870a1b9a63c',
        'title': 'Choose temperature',
        'price': getRandomArrayElement(minPrice, maxPrice)
      },
      {
        'id': 'fe5d43fe-943c-486d-8a96-922977b36d0f',
        'title': 'Drive quickly, I\'m in a hurry',
        'price': getRandomArrayElement(minPrice, maxPrice)
      },
      {
        'id': 'f007fc65-d325-4f96-a206-6ebfcb4ee11d',
        'title': 'Drive slowly',
        'price': getRandomArrayElement(minPrice, maxPrice)
      }
    ]
  },
  {
    'type': 'bus',
    'offers': [
      {
        'id': '270a1d38-ea1a-419f-8e59-2cfce02f981c',
        'title': 'Infotainment system',
        'price': getRandomArrayElement(minPrice, maxPrice)
      },
      {
        'id': 'ee13004d-9874-4051-a913-a7574db76405',
        'title': 'Order meal',
        'price': getRandomArrayElement(minPrice, maxPrice)
      },
      {
        'id': 'd3f26da0-fbab-4ccd-b9cf-d159e352dfad',
        'title': 'Choose seats',
        'price': getRandomArrayElement(minPrice, maxPrice)
      }
    ]
  },
  {
    'type': 'train',
    'offers': [
      {
        'id': 'b727cf17-35b5-4311-8222-51511441fb75',
        'title': 'Book a taxi at the arrival point',
        'price': getRandomArrayElement(minPrice, maxPrice)
      },
      {
        'id': '5c39d774-1a81-4a50-99fd-261b977f675b',
        'title': 'Order a breakfast',
        'price': getRandomArrayElement(minPrice, maxPrice)
      },
      {
        'id': 'a7d13c12-44f9-497a-b70b-0f88bef1400a',
        'title': 'Wake up at a certain time',
        'price': getRandomArrayElement(minPrice, maxPrice)
      }
    ]
  },
  {
    'type': 'flight',
    'offers': [
      {
        'id': 'cbc94730-a3be-4253-8b6d-5c8a9213f190',
        'title': 'Choose meal',
        'price': getRandomArrayElement(minPrice, maxPrice)
      },
      {
        'id': '3f3d8db9-d023-4811-9286-70185e429ca7',
        'title': 'Choose seats',
        'price': getRandomArrayElement(minPrice, maxPrice)
      },
      {
        'id': '80424a24-cbe5-4ff8-9efc-4ac7b77f4f16',
        'title': 'Upgrade to comfort class',
        'price': getRandomArrayElement(minPrice, maxPrice)
      },
      {
        'id': '0a090a58-bc32-44c7-94fe-bc110fe5e871',
        'title': 'Upgrade to business class',
        'price': getRandomArrayElement(minPrice, maxPrice)
      },
      {
        'id': '0f636586-1f91-44d6-afac-cb1a6a78a7de',
        'title': 'Add luggage',
        'price': getRandomArrayElement(minPrice, maxPrice)
      },
      {
        'id': '1a4dca23-96ea-47bc-bc7f-6f4748f0b888',
        'title': 'Business lounge',
        'price': getRandomArrayElement(minPrice, maxPrice)
      }
    ]
  },
  {
    'type': 'check-in',
    'offers': [
      {
        'id': 'cda0b0d2-0b8f-4348-b84c-5df975ea30d1',
        'title': 'Choose the time of check-in',
        'price': getRandomArrayElement(minPrice, maxPrice)
      },
      {
        'id': '0f367e62-8ad0-4cdf-aee4-dbb8935434d6',
        'title': 'Choose the time of check-out',
        'price': getRandomArrayElement(minPrice, maxPrice)
      },
      {
        'id': '3ee37004-3ee2-4862-a619-609cd2024034',
        'title': 'Add breakfast',
        'price': getRandomArrayElement(minPrice, maxPrice)
      },
      {
        'id': 'fdc6eef9-2d6e-4ba2-92b1-c74ef76011ef',
        'title': 'Laundry',
        'price': getRandomArrayElement(minPrice, maxPrice)
      },
      {
        'id': '77560aee-2334-4ad7-8274-6de0ce37b84a',
        'title': 'Order a meal from the restaurant',
        'price': getRandomArrayElement(minPrice, maxPrice)
      }
    ]
  },
  {
    'type': 'sightseeing',
    'offers': []
  },
  {
    'type': 'ship',
    'offers': [
      {
        'id': '3ade6b7e-d0dd-47a0-811d-b5443196154f',
        'title': 'Choose meal',
        'price': getRandomArrayElement(minPrice, maxPrice)
      },
      {
        'id': 'cd7727ef-7af6-46bd-a4d8-82ffb2825ddf',
        'title': 'Choose seats',
        'price': getRandomArrayElement(minPrice, maxPrice)
      },
      {
        'id': '8b48b545-89bb-4fc7-a967-88bc0086d77d',
        'title': 'Upgrade to comfort class',
        'price': getRandomArrayElement(minPrice, maxPrice)
      },
      {
        'id': '99d8d058-4ddd-450d-9f15-06ee9e90d651',
        'title': 'Upgrade to business class',
        'price': getRandomArrayElement(minPrice, maxPrice)
      },
      {
        'id': '76ee6119-a866-4bde-82be-fd8f3f5fd4a1',
        'title': 'Add luggage',
        'price': getRandomArrayElement(minPrice, maxPrice)
      },
      {
        'id': 'b6e1ecf2-d916-403c-9d77-7dcbd3fccd16',
        'title': 'Business lounge',
        'price': getRandomArrayElement(minPrice, maxPrice)
      }
    ]
  },
  {
    'type': 'drive',
    'offers': [
      {
        'id': '0505e081-fc8f-4796-8e7b-6cb0807fa0b6',
        'title': 'With automatic transmission',
        'price': getRandomArrayElement(minPrice, maxPrice)
      },
      {
        'id': '01d82bc2-694d-42d5-b932-04ef4a0d8cad',
        'title': 'With air conditioning',
        'price': getRandomArrayElement(minPrice, maxPrice)
      }
    ]
  },
  {
    'type': 'restaurant',
    'offers': [
      {
        'id': 'fd50e095-0233-4a01-94a3-81797c56aa86',
        'title': 'Choose live music',
        'price': getRandomArrayElement(minPrice, maxPrice)
      },
      {
        'id': 'ffeb6d5c-409d-436a-9ddf-2cfd44efdc92',
        'title': 'Choose VIP area',
        'price': getRandomArrayElement(minPrice, maxPrice)
      }
    ]
  }
];

export {offersMock};
