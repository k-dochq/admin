'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Link as LinkIcon } from 'lucide-react';
import { ALL_LOCALES, HOSPITAL_LOCALE_FLAGS, HOSPITAL_LOCALE_LABELS } from '@/shared/lib/types/locale';
import type { HospitalLocale } from '../LanguageTabs';
import { SavedVideoLinksList } from './SavedVideoLinksList';
import type { HospitalImage } from '../../api/entities/types';

interface VideoLinkTabProps {
  videoLinks: Record<HospitalLocale, string>;
  setVideoLinks: React.Dispatch<React.SetStateAction<Record<HospitalLocale, string>>>;
  videoTitles: Record<HospitalLocale, string>;
  setVideoTitles: React.Dispatch<React.SetStateAction<Record<HospitalLocale, string>>>;
  onSave: () => void;
  savingVideoLink: Record<HospitalLocale, boolean>;
  videoImages: HospitalImage[];
  onDelete: (imageId: string) => void;
  isDeleting: boolean;
}

export function VideoLinkTab({
  videoLinks,
  setVideoLinks,
  videoTitles,
  setVideoTitles,
  onSave,
  savingVideoLink,
  videoImages,
  onDelete,
  isDeleting,
}: VideoLinkTabProps) {
  const hasAnyLink = Object.values(videoLinks).some((link) => link.trim());
  const isSaving = Object.values(savingVideoLink).some(Boolean);

  return (
    <div className='space-y-4'>
      <div className='space-y-4'>
        <label className='text-sm font-medium'>영상 제목 (언어별)</label>
        <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
          {ALL_LOCALES.map((locale) => (
            <div key={locale} className='space-y-1.5'>
              <label className='text-muted-foreground flex items-center gap-1 text-xs'>
                <span>{HOSPITAL_LOCALE_FLAGS[locale]}</span>
                <span>
                  {HOSPITAL_LOCALE_LABELS[locale]} ({locale})
                </span>
              </label>
              <Input
                type='text'
                placeholder='영상 제목'
                value={videoTitles[locale]}
                onChange={(e) =>
                  setVideoTitles((prev) => ({ ...prev, [locale]: e.target.value }))
                }
                className='text-sm'
              />
            </div>
          ))}
        </div>
        <label className='text-sm font-medium'>영상 링크 URL (언어별)</label>
        <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
          {ALL_LOCALES.map((locale) => (
            <div key={locale} className='space-y-1.5'>
              <label className='text-muted-foreground flex items-center gap-1 text-xs'>
                <span>{HOSPITAL_LOCALE_FLAGS[locale]}</span>
                <span>
                  {HOSPITAL_LOCALE_LABELS[locale]} ({locale})
                </span>
              </label>
              <Input
                type='url'
                placeholder={`https://example.com/video-${locale.slice(0, 2)}`}
                value={videoLinks[locale]}
                onChange={(e) =>
                  setVideoLinks((prev) => ({ ...prev, [locale]: e.target.value }))
                }
                className='text-sm'
              />
            </div>
          ))}
        </div>
        <Button
          onClick={onSave}
          disabled={!hasAnyLink || isSaving}
          className='w-full'
        >
          {isSaving ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              저장 중...
            </>
          ) : (
            <>
              <LinkIcon className='mr-2 h-4 w-4' />
              저장
            </>
          )}
        </Button>
      </div>

      {videoImages.length > 0 && (
        <SavedVideoLinksList
          images={videoImages}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
