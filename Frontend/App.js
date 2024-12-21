import React, { useEffect, useState } from 'react';
import { AuthProvider } from './AuthContext';
import { AppSettingsProvider } from './AppSettingsContext';
import { CartProvider } from './CartContext';
import { FavoritesProvider } from './FavoritesContext';
import MainNavigator from './navigation/MainNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
const App = () => {
  const [isReady, setIsReady] = useState(false);

  // Simulate loading logic (e.g., fetching user session or initializing app)
  useEffect(() => {
    const timeout = setTimeout(() => setIsReady(true), 3000); // 3 seconds
    return () => clearTimeout(timeout);
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppSettingsProvider>
          <CartProvider>
            <FavoritesProvider>
              <MainNavigator />
            </FavoritesProvider>
          </CartProvider>
        </AppSettingsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;

