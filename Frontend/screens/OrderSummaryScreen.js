import React, { useMemo, useContext } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useCart } from '../CartContext';
import { AppSettingsContext } from '../AppSettingsContext';

/**
 * Renders the OrderSummaryScreen component.
 * This screen displays the items in the user's cart and provides a total of the items and their prices.
 * The user can proceed to checkout from this screen.
 */
const OrderSummaryScreen = ({ navigation }) => {
  const { cartItems, cartCount, removeFromCart, addToCart, removeEntireItem } = useCart();
  const { darkMode } = useContext(AppSettingsContext);

  /**
   * Transforms the cart items object to an array of items for easier rendering.
   */
  const cartItemsArray = useMemo(() => {
    return Object.values(cartItems);
  }, [cartItems]);

  /**
   * Calculates the total quantity of items in the cart.
   */
  const totalQuantity = useMemo(() => {
    return cartItemsArray.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItemsArray]);

  /**
   * Calculates the total price of the items in the cart.
   */
  const totalPrice = useMemo(() => {
    return cartItemsArray.reduce((sum, item) => {
      const itemPrice = parseFloat(item.price.replace(/[^\d.]/g, '')) || 0;
      return sum + itemPrice * item.quantity;
    }, 0);
  }, [cartItemsArray]);

  /**
   * Renders individual cart items.
   */
  const renderCartItem = ({ item }) => {
    return (
      <View style={[styles.cartItemContainer, darkMode && styles.darkModeCartItemContainer]}>
        <Image source={{ uri: item.img }} style={[styles.productImage, darkMode && styles.darkModeProductImage]} />
        <View style={[styles.productInfo, darkMode && styles.darkModeProductInfo]}>
          <Text style={[styles.productName, darkMode && styles.darkModeProductName]}>
            {item.name && item.name.length > 20 ? `${item.name.slice(0, 20)}...` : item.name}
          </Text>
          <Text style={[styles.productWeight, darkMode && styles.darkModeProductWeight]}>{item.weight}</Text>
          <Text style={[styles.productPrice, darkMode && styles.darkModeProductPrice]}>{item.price}</Text>
          <View style={[styles.quantityContainer, darkMode && styles.darkModeQuantityContainer]}>
            <TouchableOpacity onPress={() => removeFromCart(item.id)}>
              <Text style={[styles.quantityButton, darkMode && styles.darkModeQuantityButton]}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.quantityText, darkMode && styles.darkModeQuantityText]}>{item.quantity}</Text>
            <TouchableOpacity onPress={() => addToCart(item)}>
              <Text style={[styles.quantityButton, darkMode && styles.darkModeQuantityButton]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={[styles.removeButton, darkMode && styles.darkModeRemoveButton]} onPress={() => removeEntireItem(item.id)}>
          <Text style={[styles.removeButtonText, darkMode && styles.darkModeRemoveButtonText]}>X</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, darkMode ? styles.darkModeContainer : styles.container]}>
      <View style={[styles.header, darkMode ? styles.darkModeHeader : styles.header]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={darkMode ? '#A5F1E9' : '#333'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, darkMode ? styles.darkModeHeaderTitle : styles.headerTitle]}>Order Summary</Text>
        <TouchableOpacity onPress={() => {}}>
          <Icon name="cart-outline" size={24} color={darkMode ? '#A5F1E9' : '#333'} />
          {cartCount > 0 && (
            <View style={[styles.cartBadge, darkMode ? styles.darkModeCartBadge : styles.cartBadge]}>
              <Text style={[styles.cartBadgeText, darkMode ? styles.darkModeCartBadgeText : styles.cartBadgeText]}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Text style={[styles.totalItems, darkMode ? styles.darkModeTotalItems : styles.totalItems]}>
        {cartCount} Product{cartCount !== 1 ? 's' : ''} ({totalQuantity} Item{totalQuantity !== 1 ? 's' : ''})
      </Text>

      <FlatList
        data={cartItemsArray}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[styles.cartList, darkMode ? styles.darkModeCartList : styles.cartList]}
      />

      <View style={[styles.totalContainer, darkMode ? styles.darkModeTotalContainer : styles.totalContainer]}>
        <Text style={[styles.totalText, darkMode ? styles.darkModeTotalText : styles.totalText]}>Total: {totalPrice.toFixed(2)} Dz</Text>
        <TouchableOpacity
          style={[styles.checkoutButton, darkMode ? styles.darkModeCheckoutButton : styles.checkoutButton]}
          onPress={() => navigation.navigate('Live Tracking')}
        >
          <Text style={[styles.checkoutButtonText, darkMode ? styles.darkModeCheckoutButtonText : styles.checkoutButtonText]}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA', // Light mode background
  },
  darkModeContainer: {
    backgroundColor: '#1E2541', // Darker background for better contrast
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingTop: 40,
    backgroundColor: '#E0F7FA', // Light header
  },
  darkModeHeader: {
    backgroundColor: '#1E2541', // Dark mode header
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50', // Default text color for light mode
    textAlign: 'center',
},
darkModeHeaderTitle: {
  color: '#A5F1E9',
},
  totalItems: {
    fontSize: 16,
    color: '#525C68', // Light mode text
    textAlign: 'center',
    marginVertical: 10,
  },
  darkModeTotalItems: {
    color: '#D7DCE2', // Light gray text for dark mode
  },
  cartList: {
    paddingHorizontal: 20,
  },
  darkModeCartList: {
    backgroundColor: '#1E1E2E',
  },
  cartItemContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F4F8', // Light mode card
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  darkModeCartItemContainer: {
    backgroundColor: '#2C2C3B', // Dark mode card
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333A42', // Light mode title
  },
  darkModeProductName: {
    color: '#E5EAF0', // White for dark mode
  },
  productWeight: {
    fontSize: 14,
    color: '#757F8B', // Subdued text for weight
  },
  darkModeProductWeight: {
    color: '#A3A9B5',
  },
  productPrice: {
    fontSize: 18, // Larger for better visibility
    fontWeight: 'bold',
    color: '#1B8A79', // Highlighted price for light mode
  },
  darkModeProductPrice: {
    color: '#5FCDBA', // Softer teal for dark mode
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  quantityButton: {
    fontSize: 22,
    color: '#1B8A79',
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  darkModeQuantityButton: {
    color: '#5FCDBA',
  },
  quantityText: {
    fontSize: 16,
    color: '#333A42',
    paddingHorizontal: 10,
  },
  darkModeQuantityText: {
    color: '#E5EAF0',
  },
  removeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#E63946', // Red for delete
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  totalContainer: {
    position: 'relative', // Changed from 'absolute'
    backgroundColor: '#E3E7ED',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  darkModeTotalContainer: {
    backgroundColor: '#1C1C27',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B8A79',
    marginBottom: 10,
  },
  darkModeTotalText: {
    color: '#5FCDBA',
  },
  checkoutButton: {
    backgroundColor: '#1B8A79', // Dark green for CTA
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  darkModeCheckoutButton: {
    backgroundColor: '#5FCDBA', // Softer green for dark mode
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  darkModeCheckoutButtonText: {
    color: '#1E1E2E',
  },
  cartBadge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: '#E63946', // Red for light mode
    borderRadius: 12,
    minWidth: 20,
    minHeight: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  darkModeCartBadge: {
    backgroundColor: '#FF8787', // Softer red for dark mode
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  darkModeCartBadgeText: {
    color: '#1C1C27',
  },
});


export default OrderSummaryScreen;

