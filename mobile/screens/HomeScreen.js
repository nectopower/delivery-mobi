import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useLocation } from '../contexts/LocationContext';
import { useAuth } from '../contexts/AuthContext';

const HomeScreen = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { address } = useLocation();
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [restaurantsResponse, categoriesResponse] = await Promise.all([
        api.get('/restaurant'),
        api.get('/categories')
      ]);
      
      setRestaurants(restaurantsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const renderRestaurantItem = ({ item }) => (
    <TouchableOpacity
      style={styles.restaurantCard}
      onPress={() => navigation.navigate('Restaurant', { restaurantId: item.id })}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.restaurantImage}
      />
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.ratingCount}>({item.ratingCount})</Text>
        </View>
        <Text style={styles.restaurantCategories}>
          {item.categories.map(cat => cat.name).join(' • ')}
        </Text>
        <View style={styles.deliveryInfo}>
          <Text style={styles.deliveryTime}>
            <Ionicons name="time-outline" size={14} color="#666" /> {item.deliveryTime} min
          </Text>
          <Text style={styles.deliveryFee}>
            <Ionicons name="bicycle-outline" size={14} color="#666" /> R$ {item.deliveryFee.toFixed(2)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => navigation.navigate('Search', { categoryId: item.id })}
    >
      <View style={styles.categoryIcon}>
        <Ionicons name="restaurant-outline" size={24} color="#FF4500" />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4500" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {currentUser?.name?.split(' ')[0] || 'Usuário'}</Text>
          <TouchableOpacity style={styles.addressContainer}>
            <Ionicons name="location" size={16} color="#FF4500" />
            <Text style={styles.address} numberOfLines={1}>
              {address?.formattedAddress || 'Carregando endereço...'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Categorias</Text>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.restaurantsContainer}>
        <Text style={styles.sectionTitle}>Restaurantes</Text>
        {restaurants.map((restaurant) => (
          <View key={restaurant.id}>
            {renderRestaurantItem({ item: restaurant })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 4,
    maxWidth: 250,
  },
  categoriesContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF0E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  restaurantsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  restaurantCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  restaurantImage: {
    width: 100,
    height: 100,
  },
  restaurantInfo: {
    flex: 1,
    padding: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  restaurantCategories: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  deliveryInfo: {
    flexDirection: 'row',
    marginTop: 8,
  },
  deliveryTime: {
    fontSize: 12,
    color: '#666',
    marginRight: 12,
  },
  deliveryFee: {
    fontSize: 12,
    color: '#666',
  },
});

export default HomeScreen;
