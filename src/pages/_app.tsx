import "@/styles/globals.css";
import "@/lib/i18n";
import { appWithTranslation } from "next-i18next";
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}

export default appWithTranslation(App);
