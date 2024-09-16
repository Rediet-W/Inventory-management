import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import { apiSlice } from "./slices/apiSlice";
import { productApiSlice } from "./slices/productApiSlice";
import { requestedProductApiSlice } from "./slices/requestedProductApiSlice";
import { salesApiSlice } from "./slices/salesApiSlice"; // Import salesApiSlice
import { summaryApiSlice } from "./slices/summaryApiSlice";
import { purchaseApiSlice } from "./slices/purchaseApiSlice";

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    [productApiSlice.reducerPath]: productApiSlice.reducer,
    [requestedProductApiSlice.reducerPath]: requestedProductApiSlice.reducer,
    [salesApiSlice.reducerPath]: salesApiSlice.reducer,
    [summaryApiSlice.reducerPath]: summaryApiSlice.reducer,
    [purchaseApiSlice.reducerPath]: purchaseApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      apiSlice.middleware,
      productApiSlice.middleware,
      requestedProductApiSlice.middleware,
      salesApiSlice.middleware,
      summaryApiSlice.middleware,
      purchaseApiSlice.middleware
    ),
  devTools: true,
});

export default store;
