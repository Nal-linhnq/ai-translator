import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  fallbackLng: "en",
  supportedLngs: ["en", "jp"],
  interpolation: { escapeValue: false },
  backend: {
    loadPath: "/locales/{{lng}}/common.json",
  },
});

export default i18n;
