import { Button } from "@headlessui/react";
import { useRouter } from "next/router";

export default function LanguageSwitcher() {
  const router = useRouter();

  const changeLanguage = (lang: string) => {
    router.push(router.pathname, router.pathname, { locale: lang });
  };

  return (
    <div className="flex flex-wrap justify-end gap-2 p-2">
      <Button
        className="flex cursor-pointer items-center justify-center gap-1 px-3 py-1 text-sm sm:text-base bg-gray-100 hover:bg-gray-200 rounded-lg transition min-w-[90px]"
        onClick={() => changeLanguage("en")}
        aria-label="Switch to English"
      >
        🇬🇧 English
      </Button>
      <Button
        className="flex cursor-pointer items-center justify-center gap-1 px-3 py-1 text-sm sm:text-base bg-gray-100 hover:bg-gray-200 rounded-lg transition min-w-[90px]"
        onClick={() => changeLanguage("jp")}
        aria-label="Switch to Japanese"
      >
        🇯🇵 日本語
      </Button>
    </div>
  );
}
