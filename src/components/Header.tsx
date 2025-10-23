import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <header className="border-b bg-card/50 backdrop-blur">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <Home className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">{t('brand.name')}</span>
          </div>
          <nav className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              {t('header.dashboard')}
            </Button>
            <LanguageSwitcher />
          </nav>
        </div>
      </div>
    </header>
  );
};
