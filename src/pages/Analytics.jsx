import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, ThumbsUp, MessageSquare, TrendingUp, BarChart2, Award } from 'lucide-react';
import newsService from '../services/newsService';
import categoryService from '../services/categoryService';
import StatCard from '../components/ui/StatCard';
import { TableSkeleton } from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import { truncate } from '../utils/helpers';

const Analytics = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [topViewed, setTopViewed] = useState([]);
  const [topLiked, setTopLiked] = useState([]);
  const [topCommented, setTopCommented] = useState([]);
  const [topRanked, setTopRanked] = useState([]);
  const [stats, setStats] = useState({ views: 0, likes: 0, comments: 0 });

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [viewedRes, likedRes, commentedRes, rankedRes] = await Promise.all([
          newsService.getAll({ sort: 'most_viewed', limit: 10, status: 'PUBLISHED' }),
          newsService.getAll({ sort: 'most_liked', limit: 10, status: 'PUBLISHED' }),
          newsService.getAll({ sort: 'most_commented', limit: 10, status: 'PUBLISHED' }),
          newsService.getAll({ sort: 'rank_desc', limit: 10, status: 'PUBLISHED' }),
        ]);

        const viewed = viewedRes.data.data || [];
        const liked = likedRes.data.data || [];
        const commented = commentedRes.data.data || [];
        const ranked = rankedRes.data.data || [];

        setTopViewed(viewed);
        setTopLiked(liked);
        setTopCommented(commented);
        setTopRanked(ranked);

        const totalViews = viewed.reduce((s, n) => s + (n.viewCount || 0), 0);
        const totalLikes = liked.reduce((s, n) => s + (n.likeCount || 0), 0);
        const totalComments = commented.reduce((s, n) => s + (n.commentCount || 0), 0);
        setStats({ views: totalViews, likes: totalLikes, comments: totalComments });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const TopList = ({ items, valueKey, icon: Icon, label }) => (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <Icon className="w-4 h-4 text-primary-500" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</h3>
      </div>
      {loading ? (
        <div className="p-4"><TableSkeleton rows={5} cols={2} /></div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {items.slice(0, 8).map((item, i) => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                i === 0 ? 'bg-yellow-100 text-yellow-700' :
                i === 1 ? 'bg-gray-100 text-gray-600' :
                i === 2 ? 'bg-orange-100 text-orange-600' :
                'bg-gray-50 text-gray-400'
              }`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                  {item.title}
                </p>
                <p className="text-xs text-gray-400">{item.category?.name}</p>
              </div>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 shrink-0">
                {(item[valueKey] || 0).toLocaleString()}
              </span>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">{t('common.noData')}</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {t('analytics.title')}
        </h1>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Eye} label={t('dashboard.totalViews')} value={stats.views.toLocaleString()} color="blue" loading={loading} />
        <StatCard icon={ThumbsUp} label={t('dashboard.totalLikes')} value={stats.likes.toLocaleString()} color="green" loading={loading} />
        <StatCard icon={MessageSquare} label={t('dashboard.totalComments')} value={stats.comments.toLocaleString()} color="purple" loading={loading} />
      </div>

      {/* Top lists grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopList
          items={topViewed}
          valueKey="viewCount"
          icon={Eye}
          label={t('news.mostViewed')}
        />
        <TopList
          items={topLiked}
          valueKey="likeCount"
          icon={ThumbsUp}
          label={t('news.mostLiked')}
        />
        <TopList
          items={topCommented}
          valueKey="commentCount"
          icon={MessageSquare}
          label={t('news.mostCommented')}
        />
        <TopList
          items={topRanked}
          valueKey="rank"
          icon={Award}
          label={t('news.rankDesc')}
        />
      </div>
    </div>
  );
};

export default Analytics;
