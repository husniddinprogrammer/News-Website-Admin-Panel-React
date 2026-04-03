import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import { formatDate } from '../utils/dateFormatter';
import api from '../api/axios';

const Users = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', { params: { limit: 100 } });
      setUsers(res.data.data || []);
    } catch (err) {
      // API may not have users endpoint — show empty gracefully
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(
    (u) =>
      !search ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'username',
      header: t('users.username'),
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
              {val?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {row.name} {row.surname}
            </p>
            <p className="text-xs text-gray-400">@{val}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: t('users.email'),
      render: (val) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">{val}</span>
      ),
    },
    {
      key: 'role',
      header: t('users.role'),
      width: 100,
      render: (val) => (
        <Badge variant={val === 'BOSS' ? 'purple' : 'info'}>{val}</Badge>
      ),
    },
    {
      key: 'isBlocked',
      header: t('common.status'),
      width: 100,
      render: (val) => (
        <Badge variant={val ? 'danger' : 'success'}>
          {val ? t('users.blocked') : t('users.active')}
        </Badge>
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
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
        {t('users.title')}
        <span className="ml-2 text-sm font-normal text-gray-400">({filtered.length})</span>
      </h1>

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`${t('users.username')}, ${t('users.email')}...`}
            className="input-field pl-9"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <Table columns={columns} data={filtered} loading={loading} />
      </div>
    </div>
  );
};

export default Users;
