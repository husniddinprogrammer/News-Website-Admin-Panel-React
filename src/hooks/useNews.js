import { useState, useEffect, useCallback } from 'react';
import newsService from '../services/newsService';
import toast from 'react-hot-toast';
import { extractError } from '../utils/helpers';

const useNews = (queryParams) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await newsService.getAll(queryParams);
      const items = res.data.data || [];
      setData(items);
      setPagination(res.data.pagination || null);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(queryParams)]); // eslint-disable-line

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const deleteNews = async (id) => {
    try {
      await newsService.delete(id);
      toast.success('Yangilik o\'chirildi');
      fetchNews();
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  return { data, pagination, loading, refetch: fetchNews, deleteNews };
};

export default useNews;
