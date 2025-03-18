// eslint-disable-next-line @typescript-eslint/no-require-imports
const { i18n } = require("./next-i18next.config");
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  i18n,
  devIndicators: false,
};

export default nextConfig;
