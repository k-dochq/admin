'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useHospitalImages, useDeleteHospitalImage } from '@/lib/queries/hospital-images';
import { uploadHospitalImageClient, deleteHospitalImageClient } from '@/shared/lib/supabase-client';
import type { LocalizedText } from '@/shared/lib/types/locale';
import { ALL_LOCALES } from '@/shared/lib/types/locale';
import type { HospitalImageType, HospitalImage } from '../../api/entities/types';
import type { HospitalLocale } from '../LanguageTabs';
import {
  type MediaTabType,
  type FileWithPreview,
  createInitialSelectedFiles,
  createInitialVideoLinks,
  createInitialVideoTitles,
  createInitialUploading,
  createInitialSavingVideoLink,
  createInitialFileInputRefs,
  jsonToLocaleStringRecord,
} from './types';

export function useAdditionalMediaSection(hospitalId: string) {
  const [activeTab, setActiveTab] = useState<MediaTabType>('PROCEDURE_DETAIL');
  const [selectedFiles, setSelectedFiles] = useState(createInitialSelectedFiles());
  const [videoLinks, setVideoLinks] = useState(createInitialVideoLinks());
  const [videoTitles, setVideoTitles] = useState(createInitialVideoTitles());
  const [dragOver, setDragOver] = useState<{
    tab: MediaTabType;
    locale: HospitalLocale;
  } | null>(null);
  const [uploading, setUploading] = useState(createInitialUploading());
  const [savingVideoLink, setSavingVideoLink] = useState(createInitialSavingVideoLink());
  const fileInputRefs = useRef(createInitialFileInputRefs());

  const { data: hospitalImages, isLoading, error, refetch } = useHospitalImages(hospitalId);
  const deleteMutation = useDeleteHospitalImage();

  // 저장된 첫 번째 VIDEO가 있으면 입력란에 기본값으로 동기화
  useEffect(() => {
    const videoImages =
      hospitalImages?.filter(
        (img): img is HospitalImage => img.imageType === 'VIDEO' && img.isActive,
      ) ?? [];
    if (videoImages.length > 0) {
      const first = videoImages[0];
      setVideoLinks(
        jsonToLocaleStringRecord(first.localizedLinks as Record<string, string> | null),
      );
      setVideoTitles(jsonToLocaleStringRecord(first.title as Record<string, string> | null));
    } else {
      setVideoLinks(createInitialVideoLinks());
      setVideoTitles(createInitialVideoTitles());
    }
  }, [hospitalImages]);

  const validateFile = useCallback((file: File): string | null => {
    if (!file) return '파일이 없습니다.';
    if (!file.name) return '파일 이름이 없습니다.';
    if (file.size === 0) return '파일 크기가 0입니다.';
    if (!file.type.startsWith('image/')) return '이미지 파일만 업로드할 수 있습니다.';
    if (file.size > 500 * 1024) return '파일 크기가 500KB를 초과합니다.';
    return null;
  }, []);

  const createFileWithPreview = useCallback(
    (file: File): FileWithPreview => {
      const err = validateFile(file);
      return Object.assign(file, {
        id: crypto.randomUUID(),
        preview: URL.createObjectURL(file),
        error: err || undefined,
      }) as FileWithPreview;
    },
    [validateFile],
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, tab: MediaTabType, locale: HospitalLocale) => {
      const files = Array.from(event.target.files || []).filter(
        (file) => file && file.name && file.size > 0,
      );
      if (files.length === 0) return;
      const filesToAdd = files.map(createFileWithPreview);
      setSelectedFiles((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          [locale]: [...prev[tab][locale], ...filesToAdd],
        },
      }));
      event.target.value = '';
    },
    [createFileWithPreview],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent, tab: MediaTabType, locale: HospitalLocale) => {
      event.preventDefault();
      setDragOver({ tab, locale });
    },
    [],
  );

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(null);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent, tab: MediaTabType, locale: HospitalLocale) => {
      event.preventDefault();
      setDragOver(null);
      const files = Array.from(event.dataTransfer.files).filter(
        (file) => file && file.name && file.size > 0,
      );
      if (files.length === 0) return;
      const filesToAdd = files.map(createFileWithPreview);
      setSelectedFiles((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          [locale]: [...prev[tab][locale], ...filesToAdd],
        },
      }));
    },
    [createFileWithPreview],
  );

  const removeSelectedFile = useCallback(
    (tab: MediaTabType, locale: HospitalLocale, fileId: string) => {
      setSelectedFiles((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          [locale]: prev[tab][locale].filter((file) => {
            if (file.id === fileId) {
              URL.revokeObjectURL(file.preview);
              return false;
            }
            return true;
          }),
        },
      }));
    },
    [],
  );

  const handleUpload = useCallback(
    async (tab: MediaTabType) => {
      const allFiles: Array<{ file: FileWithPreview; locale: HospitalLocale }> = [];
      ALL_LOCALES.forEach((locale) => {
        selectedFiles[tab][locale]
          .filter((file) => !file.error)
          .forEach((file) => allFiles.push({ file, locale }));
      });
      if (allFiles.length === 0) return;

      setUploading((prev) => ({
        ...prev,
        [tab]: Object.fromEntries(ALL_LOCALES.map((l) => [l, true])) as Record<
          HospitalLocale,
          boolean
        >,
      }));

      try {
        const uploadResults = await Promise.all(
          allFiles.map(async ({ file, locale }) => {
            if (!file?.name || file.size === 0) throw new Error('유효하지 않은 파일입니다.');
            const result = await uploadHospitalImageClient({
              file,
              hospitalId,
              imageType: tab as HospitalImageType,
            });
            if (!result.success) throw new Error(result.error || '업로드 실패');
            return { locale, uploadResult: result };
          }),
        );

        const localizedLinks: LocalizedText = Object.fromEntries(
          ALL_LOCALES.map((l) => [l, undefined]),
        ) as LocalizedText;
        uploadResults.forEach(({ locale, uploadResult }) => {
          if (uploadResult.imageUrl) localizedLinks[locale] = uploadResult.imageUrl;
        });

        const hasAnyLink = Object.values(localizedLinks).some((url) => url);
        if (!hasAnyLink) throw new Error('업로드된 이미지가 없습니다.');

        const fallbackUrl =
          localizedLinks.en_US ||
          localizedLinks.ko_KR ||
          localizedLinks.th_TH ||
          localizedLinks.zh_TW ||
          localizedLinks.ja_JP ||
          localizedLinks.hi_IN ||
          localizedLinks.tl_PH ||
          localizedLinks.ar_SA ||
          '';

        const response = await fetch(`/api/admin/hospitals/${hospitalId}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageType: tab as HospitalImageType,
            imageUrl: fallbackUrl,
            localizedLinks,
          }),
        });

        if (!response.ok) {
          await Promise.all(
            uploadResults.map(({ uploadResult }) =>
              uploadResult.path ? deleteHospitalImageClient(uploadResult.path) : Promise.resolve(),
            ),
          );
          throw new Error('데이터베이스 저장 실패');
        }

        ALL_LOCALES.forEach((locale) => {
          selectedFiles[tab][locale].forEach((file) => URL.revokeObjectURL(file.preview));
        });
        setSelectedFiles((prev) => ({
          ...prev,
          [tab]: Object.fromEntries(ALL_LOCALES.map((l) => [l, []])) as unknown as Record<
            HospitalLocale,
            FileWithPreview[]
          >,
        }));
        refetch();
      } catch (err) {
        console.error('Upload failed:', err);
        alert(err instanceof Error ? err.message : '업로드 중 오류가 발생했습니다.');
      } finally {
        setUploading((prev) => ({
          ...prev,
          [tab]: Object.fromEntries(ALL_LOCALES.map((l) => [l, false])) as Record<
            HospitalLocale,
            boolean
          >,
        }));
      }
    },
    [selectedFiles, hospitalId, refetch],
  );

  const handleSaveVideoLink = useCallback(async () => {
    if (!Object.values(videoLinks).some((link) => link.trim())) {
      alert('최소 하나의 언어에 영상 링크를 입력해주세요.');
      return;
    }
    for (const locale of ALL_LOCALES) {
      const link = videoLinks[locale].trim();
      if (link) {
        try {
          new URL(link);
        } catch {
          alert(`${locale}의 URL이 유효하지 않습니다.`);
          return;
        }
      }
    }

    setSavingVideoLink(
      Object.fromEntries(ALL_LOCALES.map((l) => [l, true])) as Record<HospitalLocale, boolean>,
    );

    try {
      const localizedLinks: LocalizedText = Object.fromEntries(
        ALL_LOCALES.map((locale) => [locale, videoLinks[locale].trim() || undefined]),
      ) as LocalizedText;

      const localizedTitles: LocalizedText = Object.fromEntries(
        ALL_LOCALES.map((locale) => [
          locale,
          videoTitles[locale].trim() ? videoTitles[locale].trim() : undefined,
        ]),
      ) as LocalizedText;
      const hasAnyTitle = Object.values(localizedTitles).some((t) => t);
      const titleToSend = hasAnyTitle ? localizedTitles : undefined;

      const fallbackUrl =
        localizedLinks.en_US ||
        localizedLinks.ko_KR ||
        localizedLinks.th_TH ||
        localizedLinks.zh_TW ||
        localizedLinks.ja_JP ||
        localizedLinks.hi_IN ||
        localizedLinks.tl_PH ||
        localizedLinks.ar_SA ||
        '';

      const response = await fetch(`/api/admin/hospitals/${hospitalId}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageType: 'VIDEO',
          imageUrl: fallbackUrl,
          localizedLinks,
          ...(titleToSend && { title: titleToSend }),
        }),
      });

      if (!response.ok) throw new Error('영상 링크 저장 실패');

      refetch();
    } catch (err) {
      console.error('Save video link failed:', err);
      alert(err instanceof Error ? err.message : '영상 링크 저장 중 오류가 발생했습니다.');
    } finally {
      setSavingVideoLink(createInitialSavingVideoLink());
    }
  }, [videoLinks, videoTitles, hospitalId, refetch]);

  const handleDelete = useCallback(
    async (imageId: string) => {
      if (!confirm('삭제하시겠습니까?')) return;
      try {
        const response = await fetch(`/api/admin/hospitals/${hospitalId}/images/${imageId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('삭제 실패');
        const result = await response.json();
        if (result.storagePath) await deleteHospitalImageClient(result.storagePath);
        refetch();
      } catch (err) {
        console.error('Delete failed:', err);
        alert(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.');
      }
    },
    [hospitalId, refetch],
  );

  return {
    activeTab,
    setActiveTab,
    selectedFiles,
    setSelectedFiles,
    setVideoLinks,
    videoLinks,
    setVideoTitles,
    videoTitles,
    dragOver,
    uploading,
    savingVideoLink,
    fileInputRefs,
    hospitalImages,
    isLoading,
    error,
    deleteMutation,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeSelectedFile,
    handleUpload,
    handleSaveVideoLink,
    handleDelete,
  };
}
