const { format } = require('date-fns');

const seedData = [
  // April 2025 Records
  {
    id: '1-apr',
    name: 'John Doe',
    batch: 'Freestyle-Senior',
    feesMonth: '2025-04',
    amount: 5000,
    status: 'Unpaid',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2-apr',
    name: 'Jane Smith',
    batch: 'Freestyle-Advanced',
    feesMonth: '2025-04',
    amount: 4500,
    status: 'Paid',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3-apr',
    name: 'Mike Johnson',
    batch: 'Hip-Hop-Basic',
    feesMonth: '2025-04',
    amount: 3500,
    status: 'Unpaid',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4-apr',
    name: 'Sarah Williams',
    batch: 'Freestyle-Toddler',
    feesMonth: '2025-04',
    amount: 3000,
    status: 'Unpaid',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5-apr',
    name: 'David Brown',
    batch: 'Freestyle-Senior',
    feesMonth: '2025-04',
    amount: 5000,
    status: 'Paid',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // March 2025 Records
  {
    id: '1-mar',
    name: 'John Doe',
    batch: 'Freestyle-Senior',
    feesMonth: '2025-03',
    amount: 5000,
    status: 'Paid',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2-mar',
    name: 'Jane Smith',
    batch: 'Freestyle-Advanced',
    feesMonth: '2025-03',
    amount: 4500,
    status: 'Paid',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3-mar',
    name: 'Mike Johnson',
    batch: 'Hip-Hop-Basic',
    feesMonth: '2025-03',
    amount: 3500,
    status: 'Unpaid',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4-mar',
    name: 'Sarah Williams',
    batch: 'Freestyle-Toddler',
    feesMonth: '2025-03',
    amount: 3000,
    status: 'Paid',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5-mar',
    name: 'David Brown',
    batch: 'Freestyle-Senior',
    feesMonth: '2025-03',
    amount: 5000,
    status: 'Paid',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // February 2025 Records
  {
    id: '1-feb',
    name: 'John Doe',
    batch: 'Freestyle-Senior',
    feesMonth: '2025-02',
    amount: 5000,
    status: 'Paid',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2-feb',
    name: 'Jane Smith',
    batch: 'Freestyle-Advanced',
    feesMonth: '2025-02',
    amount: 4500,
    status: 'Paid',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3-feb',
    name: 'Mike Johnson',
    batch: 'Hip-Hop-Basic',
    feesMonth: '2025-02',
    amount: 3500,
    status: 'Paid',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4-feb',
    name: 'Sarah Williams',
    batch: 'Freestyle-Toddler',
    feesMonth: '2025-02',
    amount: 3000,
    status: 'Paid',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5-feb',
    name: 'David Brown',
    batch: 'Freestyle-Senior',
    feesMonth: '2025-02',
    amount: 5000,
    status: 'Paid',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

module.exports = seedData; 