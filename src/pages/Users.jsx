import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ShieldCheck, ShieldOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import useUiStore from '../store/uiStore';
import userService from '../services/userService';
import { extractError } from '../utils/helpers';
import { formatDate } from '../utils/dateFormatter';

const BlockButton = ({ userId, isBlocked, onChanged }) => {
  const { t } = useTranslation();
  const { openConfirm } = useUiStore();
  const [loading, setLoading] = useState(false);

  const handleToggle = () => {
    openConfirm({
      title: isBlocked ? t('users.unblock') : t('users.block'),
      message: isBlocked ? t('users.unblockConfirm') : t('users.blockConfirm'),
      onConfirm: async () => {
        setLoading(true);
        try {
          await userService.toggleBlock(userId, !isBlocked);
          onChanged(userId, { isBlocked: !isBlocked });
          toast.success(isBlocked ? 'Blok ochildi' : 'Foydalanuvchi bloklandi');
        } catch (err) {
          toast.error(extractError(err));
        } finally {
          setLoading(false);
        }
      },
      variant: isBlocked ? 'info' : 'danger',
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={isBlocked ? t('users.unblock') : t('users.block')}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${isBlocked
          ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/40'
          : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/40'
        }`}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : isBlocked ? (
        <ShieldOff className="w-3 h-3" />
      ) : (
        <ShieldCheck className="w-3 h-3" />
      )}
      {isBlocked ? t('users.blocked') : t('users.active')}
    </button>
  );
};

const Users = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAll({ limit: 100 });
      setUsers(res.data.data || []);
    } catch (err) {
      toast.error(extractError(err));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const patchUser = (userId, fields) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...fields } : u))
    );
  };

  const filtered = users.filter(
    (u) =>
      !search ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      `${u.name} ${u.surname}`.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'username',
      header: t('users.username'),
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
              {val?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div className="min-w-0">
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
      width: 140,
      render: (val, row) => (
        <BlockButton
          userId={row.id}
          isBlocked={val}
          onChanged={patchUser}
        />
      ),
    },
    {
      key: 'createdAt',
      header: t('common.createdAt'),
      width: 145,
      render: (val) => (
        <span className="text-xs text-gray-400">{formatDate(val)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {t('users.title')}
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({filtered.length})
          </span>
        </h1>
      </div>

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
