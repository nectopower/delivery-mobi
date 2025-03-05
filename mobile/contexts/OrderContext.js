import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/orders/customer');
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Falha ao carregar pedidos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getOrderById = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (err) {
      console.error('Error fetching order details:', err);
      throw new Error('Falha ao carregar detalhes do pedido');
    }
  };

  const placeOrder = async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      setOrders([response.data, ...orders]);
      return response.data;
    } catch (err) {
      console.error('Error placing order:', err);
      throw new Error('Falha ao realizar pedido. Tente novamente.');
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const response = await api.post(`/orders/${orderId}/cancel`);
      
      // Update the order in the local state
      const updatedOrders = orders.map(order => 
        order.id === orderId ? response.data : order
      );
      
      setOrders(updatedOrders);
      return response.data;
    } catch (err) {
      console.error('Error canceling order:', err);
      throw new Error('Falha ao cancelar pedido. Tente novamente.');
    }
  };

  const rateOrder = async (orderId, rating, comment) => {
    try {
      const response = await api.post(`/orders/${orderId}/rate`, {
        rating,
        comment
      });
      
      // Update the order in the local state
      const updatedOrders = orders.map(order => 
        order.id === orderId ? response.data : order
      );
      
      setOrders(updatedOrders);
      return response.data;
    } catch (err) {
      console.error('Error rating order:', err);
      throw new Error('Falha ao avaliar pedido. Tente novamente.');
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        error,
        fetchOrders,
        getOrderById,
        placeOrder,
        cancelOrder,
        rateOrder
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
