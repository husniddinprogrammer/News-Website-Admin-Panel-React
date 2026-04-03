import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import NewsFilters from '../../components/news/NewsFilters';
import useNews from '../../hooks/useNews';
import useNewsFilters from '../../hooks/useNewsFilters';
import useCategories from '../../hooks/useCategories';
import useHashtags from '../../hooks/useHashtags';
import useUiStore from '../../store/uiStore';
import { formatDate } from '../../utils/dateFormatter';
import { truncate } from '../../utils/helpers';
import { getImageUrl } from '../../utils/helpers';

const NewsList = () => {
  const { t } = useTranslation();
  const { openConfirm } = useUiStore();
  const { categories } = useCategories();
  const { hashtags } = useHashtags({ limit: 100 });

  const { filters, queryParams, hasActiveFilters, setFilter, setPage, resetFilters } =
    useNewsFilters();

  const { data, pagination, loading, deleteNews } = useNews(queryParams);

  const handleDelete = (row) => {
    openConfirm({
      title: t('common.delete'),
      message: t('news.deleteConfirm'),
      onConfirm: () => deleteNews(row.id),
      variant: 'danger',
    });
  };

  const columns = [
    {
      key: 'title',
      header: t('news.newsTitle'),
      render: (val, row) => (
        <div className="flex items-center gap-3">
          {row.images?.[0] ? (
            <img
              src={getImageUrl(row.images[0].url)}
              alt=""
              className="w-10 h-10 rounded-lg object-cover shrink-0 bg-gray-100 dark:bg-gray-800"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0 flex items-center justify-center">
              <Eye className="w-4 h-4 text-gray-400" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[260px]">
              {val}
            </p>
            <p className="text-xs text-gray-400 truncate max-w-[260px]">
              {row.author?.username}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: t('news.category'),
      width: 120,
      render: (val) =>
        val ? (
          <span className="text-xs text-gray-600 dark:text-gray-400">{val.name}</span>
        ) : (
          '—'
        ),
    },
    {
      key: 'status',
      header: t('news.status'),
      width: 110,
      render: (val) => (
        <Badge
          variant={
            val === 'PUBLISHED' ? 'success' : val === 'DRAFT' ? 'warning' : 'danger'
          }
        >
          {t(`news.${val?.toLowerCase()}`)}
        </Badge>
      ),
    },
    {
      key: 'rank',
      header: t('news.rank'),
      width: 70,
      render: (val) => (
        <span className="text-xs font-semibold text-gray-500">{val ?? 0}</span>
      ),
    },
    {
      key: 'viewCount',
      header: t('news.views'),
      width: 80,
      render: (val) => (
        <span className="text-xs text-gray-500">{(val || 0).toLocaleString()}</span>
      ),
    },
    {
      key: 'createdAt',
      header: t('common.createdAt'),
      width: 140,
      render: (val) => (
        <span className="text-xs text-gray-400">{formatDate(val)}</span>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      width: 90,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Link
            to={`/news/${row.id}/edit`}
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={t('common.edit')}
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <button
            onClick={() => handleDelete(row)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title={t('common.delete')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {t('news.title')}
          {pagination && (
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({pagination.total})
            </span>
          )}
        </h1>
        <Link to="/news/create">
          <Button icon={Plus}>{t('news.createNews')}</Button>
        </Link>
      </div>

      {/* Filters */}
      <NewsFilters
        filters={filters}
        onFilterChange={setFilter}
        onReset={resetFilters}
        categories={categories}
        hashtags={hashtags}
        hasActive={hasActiveFilters}
      />

      {/* Table */}
      <div className="card overflow-hidden">
        <Table columns={columns} data={data} loading={loading} skeletonRows={10} />
        {pagination && (
          <div className="border-t border-gray-100 dark:border-gray-800">
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit || filters.limit}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsList;
