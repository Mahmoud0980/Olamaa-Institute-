import "./globals.css";
import Providers from "./Providers";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Olamaa Dashboard",
  description: "Olamaa Management Dashboard",
  icons: {
    icon: "/logo.svg",
  },
};
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="rtl">
      <body className="overflow-hidden">
        <Providers>{children}</Providers>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontSize: "14px",
              direction: "rtl",
            },
          }}
        />
      </body>
    </html>
  );
}
