import express from 'express';
import cors from 'cors';
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Mock data
const restaurants = [
  {
    id: '1',
    name: 'Restaurante Brasileiro',
    imageUrl: 'https://via.placeholder.com/150',
    rating: 4.7,
    ratingCount: 253,
    deliveryTime: 30,
    deliveryFee: 5.99,
    categories: [{ id: '1', name: 'Brasileira' }, { id: '2', name: 'Tradicional' }]
  },
  {
    id: '2',
    name: 'Pizza Express',
    imageUrl: 'https://via.placeholder.com/150',
    rating: 4.5,
    ratingCount: 187,
    deliveryTime: 25,
    deliveryFee: 4.99,
    categories: [{ id: '3', name: 'Pizza' }, { id: '4', name: 'Italiana' }]
  },
  {
    id: '3',
    name: 'Sushi Delícia',
    imageUrl: 'https://via.placeholder.com/150',
    rating: 4.8,
    ratingCount: 312,
    deliveryTime: 40,
    deliveryFee: 7.99,
    categories: [{ id: '5', name: 'Japonesa' }, { id: '6', name: 'Sushi' }]
  }
];

const categories = [
  { id: '1', name: 'Brasileira' },
  { id: '2', name: 'Tradicional' },
  { id: '3', name: 'Pizza' },
  { id: '4', name: 'Italiana' },
  { id: '5', name: 'Japonesa' },
  { id: '6', name: 'Sushi' },
  { id: '7', name: 'Lanches' },
  { id: '8', name: 'Vegetariana' }
];

const dishes = [
  {
    id: '1',
    restaurantId: '1',
    name: 'Feijoada Completa',
    description: 'Feijoada tradicional com arroz, couve, farofa e laranja',
    price: 35.90,
    imageUrl: 'https://via.placeholder.com/150'
  },
  {
    id: '2',
    restaurantId: '1',
    name: 'Moqueca de Peixe',
    description: 'Moqueca de peixe com arroz e pirão',
    price: 42.90,
    imageUrl: 'https://via.placeholder.com/150'
  },
  {
    id: '3',
    restaurantId: '2',
    name: 'Pizza Margherita',
    description: 'Molho de tomate, mussarela, manjericão fresco',
    price: 39.90,
    imageUrl: 'https://via.placeholder.com/150'
  },
  {
    id: '4',
    restaurantId: '2',
    name: 'Pizza Pepperoni',
    description: 'Molho de tomate, mussarela, pepperoni',
    price: 45.90,
    imageUrl: 'https://via.placeholder.com/150'
  },
  {
    id: '5',
    restaurantId: '3',
    name: 'Combo Sushi (30 peças)',
    description: 'Mix de sushis e sashimis variados',
    price: 89.90,
    imageUrl: 'https://via.placeholder.com/150'
  }
];

const orders = [
  {
    id: '1',
    customerId: '1',
    restaurantId: '1',
    items: [
      { id: '1', name: 'Feijoada Completa', price: 35.90, quantity: 2 }
    ],
    status: 'DELIVERED',
    total: 71.80,
    deliveryFee: 5.99,
    createdAt: '2023-06-10T14:30:00Z',
    deliveredAt: '2023-06-10T15:15:00Z'
  },
  {
    id: '2',
    customerId: '1',
    restaurantId: '2',
    items: [
      { id: '3', name: 'Pizza Margherita', price: 39.90, quantity: 1 },
      { id: '4', name: 'Pizza Pepperoni', price: 45.90, quantity: 1 }
    ],
    status: 'IN_PROGRESS',
    total: 85.80,
    deliveryFee: 4.99,
    createdAt: '2023-06-15T19:45:00Z'
  }
];

// Auth routes
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock authentication
  if (email === 'user@example.com' && password === 'password') {
    res.json({
      id: '1',
      name: 'Usuário Teste',
      email: 'user@example.com',
      phone: '(11) 98765-4321',
      token: 'mock-jwt-token'
    });
  } else {
    res.status(401).json({ message: 'Email ou senha incorretos' });
  }
});

app.post('/auth/register', (req, res) => {
  const { name, email, phone, password } = req.body;
  
  // Mock registration
  res.status(201).json({
    id: '2',
    name,
    email,
    phone,
    token: 'mock-jwt-token'
  });
});

// Restaurant routes
app.get('/restaurant', (req, res) => {
  res.json(restaurants);
});

app.get('/restaurant/:id', (req, res) => {
  const restaurant = restaurants.find(r => r.id === req.params.id);
  
  if (restaurant) {
    // Add dishes to restaurant
    const restaurantDishes = dishes.filter(d => d.restaurantId === req.params.id);
    res.json({ ...restaurant, dishes: restaurantDishes });
  } else {
    res.status(404).json({ message: 'Restaurante não encontrado' });
  }
});

// Categories routes
app.get('/categories', (req, res) => {
  res.json(categories);
});

// Orders routes
app.get('/orders/customer', (req, res) => {
  res.json(orders);
});

app.get('/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  
  if (order) {
    // Add restaurant info
    const restaurant = restaurants.find(r => r.id === order.restaurantId);
    res.json({ ...order, restaurant });
  } else {
    res.status(404).json({ message: 'Pedido não encontrado' });
  }
});

app.post('/orders', (req, res) => {
  const { restaurantId, items, deliveryAddress } = req.body;
  
  // Mock order creation
  const newOrder = {
    id: (orders.length + 1).toString(),
    customerId: '1',
    restaurantId,
    items,
    status: 'PENDING',
    total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    deliveryFee: restaurants.find(r => r.id === restaurantId)?.deliveryFee || 0,
    deliveryAddress,
    createdAt: new Date().toISOString()
  };
  
  orders.push(newOrder);
  res.status(201).json(newOrder);
});

app.post('/orders/:id/cancel', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  
  if (order) {
    order.status = 'CANCELLED';
    res.json(order);
  } else {
    res.status(404).json({ message: 'Pedido não encontrado' });
  }
});

app.post('/orders/:id/rate', (req, res) => {
  const { rating, comment } = req.body;
  const order = orders.find(o => o.id === req.params.id);
  
  if (order) {
    order.rating = rating;
    order.comment = comment;
    res.json(order);
  } else {
    res.status(404).json({ message: 'Pedido não encontrado' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Test server running at http://localhost:${port}`);
});
