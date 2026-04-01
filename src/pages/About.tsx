import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/useLanguage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import LanguageToggle from "@/components/LanguageToggle";
import {
  ArrowLeft,
  Map,
  Layers,
  Filter,
  Play,
  UserCircle,
  Code,
  Database,
  ExternalLink,
} from "lucide-react";

const About = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const features = [
    { icon: Map, title: t("aboutFeatureMaps"), desc: t("aboutFeatureMapsDesc") },
    { icon: Layers, title: t("aboutFeatureClustering"), desc: t("aboutFeatureClusteringDesc") },
    { icon: Filter, title: t("aboutFeatureFiltering"), desc: t("aboutFeatureFilteringDesc") },
    { icon: Play, title: t("aboutFeatureMedia"), desc: t("aboutFeatureMediaDesc") },
    { icon: UserCircle, title: t("aboutFeatureAccounts"), desc: t("aboutFeatureAccountsDesc") },
  ];

  const techFrontend = ["React", "TypeScript", "Vite", "Tailwind CSS"];
  const techBackend = ["Lovable Cloud (Auth + Database + Storage)"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-6 sm:py-10 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <ArrowLeft size={18} className="mr-2" />
            {t("back")}
          </Button>
          <LanguageToggle />
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">
            {t("aboutTitle")}
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            {t("aboutSubtitle")}
          </p>
        </div>

        {/* What is this */}
        <Card className="bg-slate-800/60 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-xl">{t("aboutWhatIsTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 leading-relaxed">{t("aboutWhatIsText")}</p>
          </CardContent>
        </Card>

        {/* Features */}
        <h2 className="text-2xl font-bold text-white mb-5">{t("aboutFeaturesTitle")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 mb-10">
          {features.map((f) => (
            <Card key={f.title} className="bg-slate-800/40 border-slate-700 hover:border-orange-500/40 transition-colors">
              <CardContent className="pt-5 pb-4 px-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 shrink-0">
                    <f.icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{f.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="bg-slate-700 mb-10" />

        {/* Tech Stack */}
        <h2 className="text-2xl font-bold text-white mb-5">{t("aboutTechTitle")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 mb-10">
          <Card className="bg-slate-800/40 border-slate-700">
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-center gap-2 mb-3">
                <Code size={18} className="text-blue-400" />
                <h3 className="text-white font-semibold">{t("aboutTechFrontend")}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {techFrontend.map((tech) => (
                  <span key={tech} className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 text-sm border border-blue-500/20">
                    {tech}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/40 border-slate-700">
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-center gap-2 mb-3">
                <Database size={18} className="text-green-400" />
                <h3 className="text-white font-semibold">{t("aboutTechBackend")}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {techBackend.map((tech) => (
                  <span key={tech} className="px-3 py-1 rounded-full bg-green-500/10 text-green-300 text-sm border border-green-500/20">
                    {tech}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="bg-slate-700 mb-10" />

        {/* Author */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-3">{t("aboutAuthorTitle")}</h2>
          <p className="text-slate-300 text-lg mb-3">{t("aboutAuthorName")}</p>
          <a
            href="https://github.com/TruePacifism"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
          >
            <ExternalLink size={16} />
            {t("aboutViewOnGithub")}
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
