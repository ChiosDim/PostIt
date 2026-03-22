import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import Nav from "./auth/Nav";
import QueryWrapper from "./auth/QueryWrapper";
import Footer from "./components/Footer";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "PostIt",
  description: "A web app for sending messages",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    images: [
      {
        url: "/og-image.png",
      },
    ],
    title: "PostIt",
    description: "A web app for sending messages",
    url: "https://postit.com",
    siteName: "PostIt",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`mx-4 md:mx-48 xl:mx-96 ${roboto.variable} bg-gray-200 min-h-screen flex flex-col`}
      >
        <QueryWrapper>
          <Nav />
          <main className="grow">{children}</main>
          <Footer />
        </QueryWrapper>
      </body>
    </html>
  );
}
