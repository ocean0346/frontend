import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, ShippingAddress } from '../../types';

interface CartState {
  cartItems: CartItem[];
  shippingAddress: ShippingAddress | null;
  paymentMethod: string;
  loading: boolean;
}

// Get cart items from localStorage
const cartItemsFromStorage: CartItem[] = localStorage.getItem('cartItems')
  ? JSON.parse(localStorage.getItem('cartItems') || '[]')
  : [];

// Get shipping address from localStorage
const shippingAddressFromStorage: ShippingAddress | null = localStorage.getItem(
  'shippingAddress'
)
  ? JSON.parse(localStorage.getItem('shippingAddress') || 'null')
  : null;

// Get payment method from localStorage
const paymentMethodFromStorage: string = localStorage.getItem('paymentMethod')
  ? JSON.parse(localStorage.getItem('paymentMethod') || '""')
  : '';

const initialState: CartState = {
  cartItems: cartItemsFromStorage,
  shippingAddress: shippingAddressFromStorage,
  paymentMethod: paymentMethodFromStorage,
  loading: false,
};

// Helper để lưu giỏ hàng theo userId
const saveCartForUser = (cartItems: CartItem[]) => {
  const userJson = localStorage.getItem('user');
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      if (user._id) {
        console.log('Lưu giỏ hàng cho user:', user._id, 'Số lượng sản phẩm:', cartItems.length);
        localStorage.setItem(`cartItems_${user._id}`, JSON.stringify(cartItems));
        return true;
      } else {
        console.warn('User không có ID');
      }
    } catch (error) {
      console.error('Lỗi khi lưu giỏ hàng theo user:', error);
    }
  } else {
    console.log('Không có user đăng nhập, không lưu giỏ hàng theo user');
  }
  return false;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      state.loading = true;
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x._id === item._id);

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x._id === existItem._id ? item : x
        );
      } else {
        state.cartItems = [...state.cartItems, item];
      }

      // Save to localStorage
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
      // Lưu theo userId nếu đã đăng nhập
      saveCartForUser(state.cartItems);
      
      state.loading = false;
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
      
      // Save to localStorage
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
      // Lưu theo userId nếu đã đăng nhập
      saveCartForUser(state.cartItems);
      
      state.loading = false;
    },
    saveShippingAddress: (state, action: PayloadAction<ShippingAddress>) => {
      state.shippingAddress = action.payload;
      
      // Save to localStorage
      localStorage.setItem('shippingAddress', JSON.stringify(action.payload));
      
      // Lưu địa chỉ theo user (nếu đã đăng nhập)
      const userJson = localStorage.getItem('user');
      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          if (user._id) {
            localStorage.setItem(`shippingAddress_${user._id}`, JSON.stringify(action.payload));
          }
        } catch (error) {
          console.error('Lỗi khi lưu địa chỉ giao hàng theo user:', error);
        }
      }
    },
    savePaymentMethod: (state, action: PayloadAction<string>) => {
      state.paymentMethod = action.payload;
      
      // Save to localStorage
      localStorage.setItem('paymentMethod', JSON.stringify(action.payload));
      
      // Lưu phương thức thanh toán theo user (nếu đã đăng nhập)
      const userJson = localStorage.getItem('user');
      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          if (user._id) {
            localStorage.setItem(`paymentMethod_${user._id}`, JSON.stringify(action.payload));
          }
        } catch (error) {
          console.error('Lỗi khi lưu phương thức thanh toán theo user:', error);
        }
      }
    },
    clearCartItems: (state) => {
      state.cartItems = [];
      localStorage.removeItem('cartItems');
      
      // Xóa giỏ hàng theo user (nếu đã đăng nhập)
      const userJson = localStorage.getItem('user');
      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          if (user._id) {
            localStorage.removeItem(`cartItems_${user._id}`);
          }
        } catch (error) {
          console.error('Lỗi khi xóa giỏ hàng theo user:', error);
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    // Đồng bộ giỏ hàng từ localStorage (sau khi đăng nhập/đăng xuất)
    syncCartFromStorage: (state) => {
      try {
        console.log('Đồng bộ giỏ hàng từ localStorage');
        const cartItemsJson = localStorage.getItem('cartItems');
        const shippingAddressJson = localStorage.getItem('shippingAddress');
        const paymentMethodJson = localStorage.getItem('paymentMethod');
        
        console.log('Dữ liệu giỏ hàng từ localStorage:', cartItemsJson);
        
        const cartItemsFromStorage = cartItemsJson 
          ? JSON.parse(cartItemsJson) 
          : [];
          
        const shippingAddressFromStorage = shippingAddressJson
          ? JSON.parse(shippingAddressJson)
          : null;
          
        const paymentMethodFromStorage = paymentMethodJson
          ? JSON.parse(paymentMethodJson)
          : '';
          
        console.log('Số lượng sản phẩm trong giỏ hàng:', cartItemsFromStorage.length);
          
        state.cartItems = cartItemsFromStorage;
        state.shippingAddress = shippingAddressFromStorage;
        state.paymentMethod = paymentMethodFromStorage;
      } catch (error) {
        console.error('Lỗi khi đồng bộ giỏ hàng:', error);
        // Nếu có lỗi, đặt về mảng rỗng để tránh crash
        state.cartItems = [];
      }
    }
  },
});

export const {
  addToCart,
  removeFromCart,
  saveShippingAddress,
  savePaymentMethod,
  clearCartItems,
  setLoading,
  syncCartFromStorage
} = cartSlice.actions;

export default cartSlice.reducer; 