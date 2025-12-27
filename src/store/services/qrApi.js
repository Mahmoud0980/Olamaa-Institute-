import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiConfig } from "./baseApi";

export const qrApi = createApi({
  reducerPath: "qrApi",
  ...baseApiConfig,
  endpoints: (builder) => ({
    scanQr: builder.mutation({
      query: (qrContent) => ({
        url: "/enrollments/scan-qr",
        method: "POST",
        // ✅ مع axiosBaseQuery استخدم data (أو body بعد ما عدّلنا baseApi)
        data: { qr_content: qrContent },
      }),
    }),
  }),
});

export const { useScanQrMutation } = qrApi;
