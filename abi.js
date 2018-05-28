module.exports = [
  {
    constant: true,
    inputs: [],
    name: 'getSenderRank',
    outputs: [
      {
        name: '',
        type: 'uint8',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_addr',
        type: 'address',
      },
    ],
    name: 'getRank',
    outputs: [
      {
        name: '',
        type: 'uint8',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_addr',
        type: 'address',
      },
      {
        name: '_rank',
        type: 'uint8',
      },
    ],
    name: 'setRank',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function',
  },
];
