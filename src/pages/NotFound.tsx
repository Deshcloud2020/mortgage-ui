import { useTranslation } from "react-i18next";

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{t('notFound.title')}</h1>
        <p className="mb-4 text-xl text-gray-600">{t('notFound.message')}</p>
        <a href="/" className="text-blue-500 underline hover:text-blue-700">
          {t('notFound.link')}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
