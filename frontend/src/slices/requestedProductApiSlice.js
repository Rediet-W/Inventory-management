import { apiSlice } from "./apiSlice";
const REQUESTED_PRODUCTS_URL = "/api/requested-products";

export const requestedProductApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRequestedProducts: builder.query({
      query: () => ({
        url: REQUESTED_PRODUCTS_URL,
        method: "GET",
      }),
      providesTags: ["RequestedProduct"],
    }),
    createRequestedProduct: builder.mutation({
      query: (data) => ({
        url: REQUESTED_PRODUCTS_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["RequestedProduct"],
    }),
    deleteRequestedProduct: builder.mutation({
      query: (id) => ({
        url: `${REQUESTED_PRODUCTS_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["RequestedProduct"],
    }),
  }),
});

export const {
  useGetRequestedProductsQuery,
  useCreateRequestedProductMutation,
  useDeleteRequestedProductMutation,
} = requestedProductApiSlice;
