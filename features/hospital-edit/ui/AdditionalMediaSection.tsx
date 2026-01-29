'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/shared/ui';
import { useAdditionalMediaSection } from './additional-media/useAdditionalMediaSection';
import { VideoLinkTab } from './additional-media/VideoLinkTab';
import { ImageUploadTab } from './additional-media/ImageUploadTab';
import { MEDIA_TAB_TYPES, MEDIA_TAB_LABELS } from './additional-media/types';
import type { MediaTabType } from './additional-media/types';
import { ALL_LOCALES } from '@/shared/lib/types/locale';

interface AdditionalMediaSectionProps {
  hospitalId: string;
}

export function AdditionalMediaSection({ hospitalId }: AdditionalMediaSectionProps) {
  const api = useAdditionalMediaSection(hospitalId);

  if (api.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>기타 병원 이미지, 영상링크</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner text='데이터를 불러오는 중...' />
        </CardContent>
      </Card>
    );
  }

  if (api.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>기타 병원 이미지, 영상링크</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-destructive text-sm'>데이터를 불러오는 중 오류가 발생했습니다.</div>
        </CardContent>
      </Card>
    );
  }

  const fileInputRef =
    (tab: MediaTabType, locale: (typeof ALL_LOCALES)[number]) => (el: HTMLInputElement | null) => {
      if (api.fileInputRefs.current[tab]) {
        api.fileInputRefs.current[tab][locale] = el;
      }
    };

  const onSelectClick = (tab: MediaTabType, locale: (typeof ALL_LOCALES)[number]) => () => {
    api.fileInputRefs.current[tab]?.[locale]?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>기타 병원 이미지, 영상링크</CardTitle>
        <p className='text-muted-foreground text-sm'>
          시술상세이미지, 영상썸네일이미지, 영상링크를 언어별로 관리할 수 있습니다.
        </p>
      </CardHeader>
      <CardContent>
        <Tabs
          value={api.activeTab}
          onValueChange={(value) => api.setActiveTab(value as MediaTabType)}
        >
          <TabsList className='grid w-full grid-cols-3'>
            {MEDIA_TAB_TYPES.map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {MEDIA_TAB_LABELS[tab]}
              </TabsTrigger>
            ))}
          </TabsList>

          {MEDIA_TAB_TYPES.map((tab) => {
            const isVideoLink = tab === 'VIDEO';
            const videoImages =
              api.hospitalImages?.filter((img) => img.imageType === 'VIDEO' && img.isActive) ?? [];

            return (
              <TabsContent key={tab} value={tab} className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-medium'>{MEDIA_TAB_LABELS[tab]}</h3>
                </div>

                {isVideoLink ? (
                  <VideoLinkTab
                    videoLinks={api.videoLinks}
                    setVideoLinks={api.setVideoLinks}
                    onSave={api.handleSaveVideoLink}
                    savingVideoLink={api.savingVideoLink}
                    videoImages={videoImages}
                    onDelete={api.handleDelete}
                    isDeleting={api.deleteMutation.isPending}
                  />
                ) : (
                  <ImageUploadTab
                    tab={tab}
                    selectedFiles={api.selectedFiles[tab]}
                    dragOver={api.dragOver}
                    uploading={api.uploading[tab]}
                    hospitalImages={api.hospitalImages}
                    fileInputRef={fileInputRef}
                    onFileSelect={(tab, locale) => (e) => api.handleFileSelect(e, tab, locale)}
                    onDragOver={(tab, locale) => (e) => api.handleDragOver(e, tab, locale)}
                    onDragLeave={api.handleDragLeave}
                    onDrop={(tab, locale) => (e) => api.handleDrop(e, tab, locale)}
                    onRemoveFile={api.removeSelectedFile}
                    onSelectClick={onSelectClick}
                    onUpload={api.handleUpload}
                    onDelete={api.handleDelete}
                    isDeleting={api.deleteMutation.isPending}
                  />
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
