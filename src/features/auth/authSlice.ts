import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';
import * as api from '../../app/api';
import { syncCartFromStorage } from '../cart/cartSlice';

// Cố gắng lấy thông tin người dùng từ localStorage khi khởi tạo
const getUserFromStorage = (): User | null => {
  try {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      return JSON.parse(userJson);
    }
    return null;
  } catch (error) {
    console.error('Lỗi khi đọc thông tin người dùng từ localStorage:', error);
    return null;
  }
};

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: getUserFromStorage(),
  loading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue, dispatch }) => {
    try {
      const result = await api.login(email, password);
      // Đồng bộ giỏ hàng sau khi đăng nhập
      dispatch(syncCartFromStorage());
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (
    { name, email, password }: { name: string; email: string; password: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      console.log('AuthSlice: Đang đăng ký...');
      const result = await api.register(name, email, password);
      console.log('AuthSlice: Đăng ký thành công:', result);
      // Đồng bộ giỏ hàng sau khi đăng ký
      dispatch(syncCartFromStorage());
      return result;
    } catch (error: any) {
      console.error('AuthSlice: Lỗi đăng ký:', error);
      // Ghi log chi tiết hơn về lỗi
      if (error.response) {
        console.error('Lỗi response:', {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers,
        });
        return rejectWithValue(error.response.data?.message || `Lỗi server: ${error.response.status}`);
      } else if (error.request) {
        console.error('Lỗi request:', error.request);
        return rejectWithValue('Không thể kết nối đến server');
      } else {
        console.error('Lỗi khác:', error.message);
        return rejectWithValue(`Lỗi đăng ký: ${error.message}`);
      }
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue, dispatch }) => {
  try {
    await api.logout();
    // Đồng bộ giỏ hàng sau khi đăng xuất (để hiển thị giỏ hàng trống)
    dispatch(syncCartFromStorage());
    return null;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Logout failed');
  }
});

export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await api.getUserProfile();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (userData: Partial<User>, { rejectWithValue, dispatch }) => {
    try {
      const result = await api.updateUserProfile(userData);
      // Đồng bộ giỏ hàng sau khi cập nhật profile
      dispatch(syncCartFromStorage());
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      })
      // Get user profile
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer; 