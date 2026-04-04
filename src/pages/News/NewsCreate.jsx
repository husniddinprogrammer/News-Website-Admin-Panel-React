import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import NewsForm from '../../components/news/NewsForm';
import newsService from '../../services/newsService';
import useCategories from '../../hooks/useCategories';
import { extractError } from '../../utils/helpers';

const NewsCreate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { categories } = useCategories();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await newsService.create(data);
      toast.success(t('news.createSuccess'));
      navigate('/news');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/news" className="btn-ghost p-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {t('news.createNews')}
        </h1>
      </div>

      <div className="card p-6">
        <NewsForm
          categories={categories}
          onSubmit={handleSubmit}
          loading={loading}
          newsId={null}
        />
      </div>
    </div>
  );
};

export default NewsCreate;
