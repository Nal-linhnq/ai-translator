"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Languages, Maximize2, Globe } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import TranslateTab from "@/components/tabs/translate-tab";
import SummarizeTab from "@/components/tabs/summarize-tab";
import ExtractTab from "@/components/tabs/extract-tab";
import { useTranslation } from "next-i18next";
import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import Head from "next/head";

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
});

export default function Home() {
  const [, setActiveTab] = useState("translate");
  const [appLanguage, setAppLanguage] = useState<"en" | "jp">("en");
  const { t } = useTranslation("common");
  const router = useRouter();

  const changeLanguage = (lang: string) => {
    setAppLanguage(lang as "en" | "jp");
    router.push(router.pathname, router.pathname, { locale: lang });
  };

  return (
    <>
      <Head>
        <title>{t("appTitle")}</title>
        <meta name="description" content={t("appDescription")} />
        <meta name="robots" content="noindex" />
      </Head>
      <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
        <div className="w-full max-w-5xl space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {t("languageSwitcher")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm ${
                    appLanguage === "en" ? "font-bold" : ""
                  }`}
                >
                  {t("english")}
                </span>
                <Switch
                  checked={appLanguage === "jp"}
                  onCheckedChange={() =>
                    changeLanguage(appLanguage === "en" ? "jp" : "en")
                  }
                  aria-label="Toggle language"
                />
                <span
                  className={`text-sm ${
                    appLanguage === "jp" ? "font-bold" : ""
                  }`}
                >
                  {t("japanese")}
                </span>
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight pt-3">
              {t("appTitle")}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t("appDescription")}
            </p>
          </div>

          <Tabs
            defaultValue="translate"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger
                value="translate"
                className="flex items-center gap-2"
              >
                <Languages className="h-4 w-4" />
                <span>{t("translate")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="summarize"
                className="flex items-center gap-2"
              >
                <Maximize2 className="h-4 w-4" />
                <span>{t("summarize")}</span>
              </TabsTrigger>
              <TabsTrigger value="extract" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>{t("extract")}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="translate" className="space-y-4 mt-4">
              <TranslateTab />
            </TabsContent>

            <TabsContent value="summarize" className="space-y-4 mt-4">
              <SummarizeTab />
            </TabsContent>

            <TabsContent value="extract" className="space-y-4 mt-4">
              <ExtractTab />
            </TabsContent>
          </Tabs>

          <div className="bg-muted p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">{t("howItWorks")}</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Languages className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">{t("translationFeature")}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("translationDescription")}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Maximize2 className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">{t("summarizationFeature")}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("summarizationDescription")}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">{t("extractionFeature")}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("extractionDescription")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
