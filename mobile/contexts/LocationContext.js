import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Location from 'expo-location';

const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permissão para acessar localização foi negada');
          setLoading(false);
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        
        // Get address from coordinates
        if (currentLocation) {
          const addressResponse = await Location.reverseGeocodeAsync({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude
          });
          
          if (addressResponse && addressResponse.length > 0) {
            const addressData = addressResponse[0];
            setAddress({
              street: addressData.street,
              number: addressData.name,
              district: addressData.district,
              city: addressData.city,
              region: addressData.region,
              country: addressData.country,
              postalCode: addressData.postalCode,
              formattedAddress: `${addressData.street}, ${addressData.name}, ${addressData.district}, ${addressData.city}`
            });
          }
        }
      } catch (error) {
        console.error('Error getting location:', error);
        setErrorMsg('Não foi possível obter sua localização');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateLocation = async (newLocation) => {
    try {
      setLoading(true);
      
      // If newLocation is coordinates
      if (newLocation.latitude && newLocation.longitude) {
        setLocation({
          coords: {
            latitude: newLocation.latitude,
            longitude: newLocation.longitude
          }
        });
        
        // Get address from coordinates
        const addressResponse = await Location.reverseGeocodeAsync({
          latitude: newLocation.latitude,
          longitude: newLocation.longitude
        });
        
        if (addressResponse && addressResponse.length > 0) {
          const addressData = addressResponse[0];
          setAddress({
            street: addressData.street,
            number: addressData.name,
            district: addressData.district,
            city: addressData.city,
            region: addressData.region,
            country: addressData.country,
            postalCode: addressData.postalCode,
            formattedAddress: `${addressData.street}, ${addressData.name}, ${addressData.district}, ${addressData.city}`
          });
        }
      } 
      // If newLocation is an address string
      else if (typeof newLocation === 'string') {
        const geocodeResponse = await Location.geocodeAsync(newLocation);
        
        if (geocodeResponse && geocodeResponse.length > 0) {
          const { latitude, longitude } = geocodeResponse[0];
          
          setLocation({
            coords: { latitude, longitude }
          });
          
          // Get full address details
          const addressResponse = await Location.reverseGeocodeAsync({
            latitude,
            longitude
          });
          
          if (addressResponse && addressResponse.length > 0) {
            const addressData = addressResponse[0];
            setAddress({
              street: addressData.street,
              number: addressData.name,
              district: addressData.district,
              city: addressData.city,
              region: addressData.region,
              country: addressData.country,
              postalCode: addressData.postalCode,
              formattedAddress: newLocation
            });
          } else {
            setAddress({
              formattedAddress: newLocation
            });
          }
        }
      }
    } catch (error) {
      console.error('Error updating location:', error);
      setErrorMsg('Não foi possível atualizar sua localização');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        address,
        errorMsg,
        loading,
        updateLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
