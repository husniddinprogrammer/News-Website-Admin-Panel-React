import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import Button from '../ui/Button';
import { SORT_OPTIONS, TIME_OPTIONS, STATUS_OPTIONS } from '../../utils/helpers';

const NewsFilters = ({ filters, onFilterChange, onReset, categories, hashtags, hasActive }) => {
  const { t } = useTranslation();

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('news.searchPlaceholder')}
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="input-field pl-9"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={filters.sort}
          onChange={(e) => onFilterChange('sort', e.target.value)}
          className="input-field w-auto"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {t(o.label)}
            </option>
          ))}
        </select>

        {/* Time */}
        <select
          value={filters.time}
          onChange={(e) => onFilterChange('time', e.target.value)}
          className="input-field w-auto"
        >
          {TIME_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {t(o.label)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Category */}
        <select
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
          className="input-field w-auto"
        >
          <option value="">{t('news.selectCategory')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className="input-field w-auto"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {t(o.label)}
            </option>
          ))}
        </select>

        {/* Rank */}
        <select
          value={filters.rank}
          onChange={(e) => onFilterChange('rank', e.target.value)}
          className="input-field w-auto"
        >
          <option value="">{t('news.rank')}</option>
          {Array.from({ length: 11 }, (_, i) => (
            <option key={i} value={i}>
              Rank {i}
            </option>
          ))}
        </select>

        {/* Reset */}
        {hasActive && (
          <Button variant="ghost" size="sm" icon={X} onClick={onReset}>
            {t('common.reset')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default NewsFilters;
