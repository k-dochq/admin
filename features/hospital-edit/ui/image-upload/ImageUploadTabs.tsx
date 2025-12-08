'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  type BasicHospitalImageType,
  type HospitalImageType,
  type HospitalImage,
  IMAGE_TYPE_LIMITS,
  IMAGE_TYPE_LABELS,
} from '../../api/entities/types';
import { type FileWithPreview } from './types';

interface ImageUploadTabsProps {
  activeTab: BasicHospitalImageType;
  onTabChange: (value: BasicHospitalImageType) => void;
  selectedFiles: Record<BasicHospitalImageType, FileWithPreview[]>;
  imagesByType: Record<HospitalImageType, HospitalImage[]>;
  children: React.ReactNode;
}

const BASIC_IMAGE_TYPES: BasicHospitalImageType[] = [
  'MAIN',
  'THUMBNAIL',
  'PROMOTION',
  'DETAIL',
  'INTERIOR',
  'LOGO',
];

export function ImageUploadTabs({
  activeTab,
  onTabChange,
  selectedFiles,
  imagesByType,
  children,
}: ImageUploadTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as BasicHospitalImageType)}>
      <TabsList className='grid w-full grid-cols-6'>
        {BASIC_IMAGE_TYPES.map((type) => {
          const existingCount = imagesByType[type]?.length || 0;
          const selectedCount = selectedFiles[type].length;
          const limit = IMAGE_TYPE_LIMITS[type];

          return (
            <TabsTrigger key={type} value={type} className='text-xs'>
              <div className='flex flex-col items-center'>
                <span>{IMAGE_TYPE_LABELS[type]}</span>
                <Badge variant='secondary' className='text-xs'>
                  {existingCount + selectedCount}/{limit}
                </Badge>
              </div>
            </TabsTrigger>
          );
        })}
      </TabsList>
      {children}
    </Tabs>
  );
}
