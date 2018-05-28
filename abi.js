module.exports = [
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
];
