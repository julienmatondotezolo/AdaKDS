import type { Order } from '@/types';

export const mockOrders: Order[] = [
  // New Orders
  {
    id: '1',
    order_number: '11613',
    restaurant_id: 'demo-restaurant',
    status: 'new',
    station: 'kitchen',
    priority: 'normal',
    items: [
      { id: '1a', name: 'Spaghetti Carbonara', quantity: 2, estimated_time: 12, category: 'pasta' },
      { id: '1b', name: 'Caesar Salad', quantity: 1, estimated_time: 5, category: 'salad', special_requests: 'No croutons' },
      { id: '1c', name: 'Tiramisu', quantity: 2, estimated_time: 2, category: 'dessert' }
    ],
    customer_name: 'Table 5',
    customer_type: 'dine_in',
    order_time: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    estimated_ready_time: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    elapsed_time: 5,
    total_prep_time: 15,
    rush_level: 'low',
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    order_number: '11614',
    restaurant_id: 'demo-restaurant',
    status: 'new',
    station: 'kitchen',
    priority: 'high',
    items: [
      { id: '2a', name: 'Quattro Stagioni Pizza', quantity: 1, estimated_time: 10, category: 'pizza' },
      { id: '2b', name: 'Antipasto Misto', quantity: 1, estimated_time: 8, category: 'appetizer' }
    ],
    customer_name: 'Takeaway',
    customer_type: 'takeaway',
    order_time: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    estimated_ready_time: new Date(Date.now() + 13 * 60 * 1000).toISOString(),
    elapsed_time: 2,
    total_prep_time: 18,
    rush_level: 'moderate',
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 1000).toISOString()
  },

  // Processing Orders
  {
    id: '3',
    order_number: '11612',
    restaurant_id: 'demo-restaurant',
    status: 'preparing',
    station: 'kitchen',
    priority: 'normal',
    items: [
      { id: '3a', name: 'Risotto ai Porcini', quantity: 1, estimated_time: 16, category: 'risotto' },
      { id: '3b', name: 'Bruschetta Tricolore', quantity: 1, estimated_time: 3, category: 'appetizer' },
      { id: '3c', name: 'Panna Cotta', quantity: 1, estimated_time: 1, category: 'dessert' }
    ],
    customer_name: 'Table 7',
    customer_type: 'dine_in',
    order_time: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8 minutes ago
    estimated_ready_time: new Date(Date.now() + 7 * 60 * 1000).toISOString(),
    elapsed_time: 8,
    total_prep_time: 20,
    rush_level: 'moderate',
    created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60 * 1000).toISOString()
  },

  // Ready Orders
  {
    id: '4',
    order_number: '11611',
    restaurant_id: 'demo-restaurant',
    status: 'ready',
    station: 'kitchen',
    priority: 'urgent',
    items: [
      { id: '4a', name: 'Osso Buco alla Milanese', quantity: 1, estimated_time: 25, category: 'meat' },
      { id: '4b', name: 'Risotto alla Milanese', quantity: 1, estimated_time: 18, category: 'risotto' },
      { id: '4c', name: 'Gelato Misto', quantity: 1, estimated_time: 2, category: 'dessert' }
    ],
    customer_name: 'Table 12',
    customer_type: 'dine_in',
    order_time: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 minutes ago
    estimated_ready_time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    elapsed_time: 25,
    total_prep_time: 20,
    rush_level: 'high',
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    order_number: '11610',
    restaurant_id: 'demo-restaurant',
    status: 'ready',
    station: 'kitchen',
    priority: 'normal',
    items: [
      { id: '5a', name: 'Lasagne della Nonna', quantity: 1, estimated_time: 15, category: 'pasta' },
      { id: '5b', name: 'Insalata di Arugula', quantity: 1, estimated_time: 3, category: 'salad' }
    ],
    customer_name: 'Delivery - #15',
    customer_type: 'delivery',
    order_time: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // 20 minutes ago
    estimated_ready_time: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    elapsed_time: 20,
    total_prep_time: 18,
    rush_level: 'low',
    created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 1000).toISOString()
  }
];