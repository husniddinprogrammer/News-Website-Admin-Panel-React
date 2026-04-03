import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { X, Plus, Upload, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';
import TipTapEditor from '../editor/TipTapEditor';
import newsService from '../../services/newsService';
import { getImageUrl, extractError } from '../../utils/helpers';

const schema = z.object({
  title: z.string().min(3, 'validation.minLength').max(255, 'validation.maxLength'),
  shortDescription: z.string().min(10, 'validation.minLength').max(500, 'validation.maxLength'),
  content: z.string().min(10, 'validation.minLength'),
  categoryId: z.string().min(1, 'validation.required'),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  rank: z.coerce.number().int().min(0).max(10),
});

const NewsForm = ({ defaultValues, categories, onSubmit: onSubmitProp, loading, newsId }) => {
  const { t } = useTranslation();

  const [hashtags, setHashtags] = useState(
    defaultValues?.hashtags?.map((h) => h.name) || []
  );
  const [hashtagInput, setHashtagInput] = useState('');
  const [images, setImages] = useState(defaultValues?.images || []);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title || '',
      shortDescription: defaultValues?.shortDescription || '',
      content: defaultValues?.content || '',
      categoryId: defaultValues?.category?.id || defaultValues?.categoryId || '',
      status: defaultValues?.status || 'DRAFT',
      rank: defaultValues?.rank ?? 0,
    },
  });

  const addHashtag = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tag = hashtagInput.trim();
      if (tag && !hashtags.includes(tag) && hashtags.length < 10) {
        setHashtags([...hashtags, tag]);
        setHashtagInput('');
      }
    }
  };

  const removeHashtag = (tag) => {
    setHashtags(hashtags.filter((h) => h !== tag));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || !newsId) return;

    setUploadingImages(true);
    try {
      const res = await newsService.uploadImages(newsId, files);
      const newImgs = res.data.data || [];
      setImages((prev) => [...prev, ...newImgs]);
      toast.success('Rasmlar yuklandi');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (imgId) => {
    setDeletingImageId(imgId);
    try {
      await newsService.deleteImage(imgId);
      setImages((prev) => prev.filter((i) => i.id !== imgId));
      toast.success('Rasm o\'chirildi');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setDeletingImageId(null);
    }
  };

  const onSubmit = (data) => {
    onSubmitProp({ ...data, hashtags });
  };

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  const statusOptions = [
    { value: 'DRAFT', label: t('news.draft') },
    { value: 'PUBLISHED', label: t('news.published') },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main fields — left 2 cols */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <Input
            label={t('news.newsTitle')}
            placeholder={t('news.titlePlaceholder')}
            error={errors.title && t(errors.title.message, { min: 3, max: 255 })}
            {...register('title')}
          />

          {/* Short Description */}
          <Textarea
            label={t('news.shortDescription')}
            placeholder={t('news.shortDescPlaceholder')}
            rows={3}
            error={errors.shortDescription && t(errors.shortDescription.message, { min: 10, max: 500 })}
            {...register('shortDescription')}
          />

          {/* Content — TipTap */}
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <TipTapEditor
                label={t('news.content')}
                value={field.value}
                onChange={field.onChange}
                placeholder={t('news.contentPlaceholder')}
                error={errors.content && t(errors.content.message, { min: 10 })}
              />
            )}
          />
        </div>

        {/* Sidebar — right 1 col */}
        <div className="space-y-5">
          {/* Status */}
          <Select
            label={t('news.status')}
            options={statusOptions}
            error={errors.status?.message}
            {...register('status')}
          />

          {/* Category */}
          <Select
            label={t('news.category')}
            placeholder={t('news.selectCategory')}
            options={categoryOptions}
            error={errors.categoryId && t(errors.categoryId.message)}
            {...register('categoryId')}
          />

          {/* Rank */}
          <div>
            <label className="label">{t('news.rank')} (0–10)</label>
            <input
              type="number"
              min={0}
              max={10}
              className={`input-field ${errors.rank ? 'error' : ''}`}
              {...register('rank')}
            />
            {errors.rank && (
              <p className="mt-1 text-xs text-red-500">{t('validation.required')}</p>
            )}
            <p className="mt-1 text-xs text-gray-400">{t('news.rankTooltip')}</p>
          </div>

          {/* Hashtags */}
          <div>
            <label className="label">{t('news.hashtags')}</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {hashtags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeHashtag(tag)}
                    className="ml-0.5 hover:text-primary-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              onKeyDown={addHashtag}
              placeholder={t('news.addHashtag')}
              className="input-field"
              disabled={hashtags.length >= 10}
            />
            <p className="mt-1 text-xs text-gray-400">{t('news.hashtagHint')}</p>
          </div>

          {/* Images */}
          {newsId && (
            <div>
              <label className="label">{t('news.images')}</label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {images.map((img) => (
                  <div key={img.id} className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 aspect-video bg-gray-100 dark:bg-gray-800">
                    <img
                      src={getImageUrl(img.url)}
                      alt="news"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      disabled={deletingImageId === img.id}
                      className="absolute top-1 right-1 p-1 rounded-md bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {deletingImageId === img.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
              <label className="flex items-center justify-center gap-2 w-full p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 cursor-pointer hover:border-primary-500 dark:hover:border-primary-500 transition-colors text-sm text-gray-500 dark:text-gray-400">
                {uploadingImages ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Yuklanmoqda...</>
                ) : (
                  <><Upload className="w-4 h-4" /> {t('news.uploadImages')}</>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImages}
                />
              </label>
              <p className="mt-1 text-xs text-gray-400">{t('news.uploadHint')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-800">
        <Button type="submit" loading={isSubmitting || loading}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
};

export default NewsForm;
