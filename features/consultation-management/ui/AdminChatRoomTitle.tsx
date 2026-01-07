'use client';

import { getKoreanText, type LocalizedText } from '@/lib/types/consultation';
import { type MedicalSpecialtyType } from '@prisma/client';

interface AdminChatRoomTitleProps {
  hospitalName: string;
  medicalSpecialties?: Array<{
    id: string;
    specialtyType: MedicalSpecialtyType;
    name: LocalizedText;
  }>;
}

export function AdminChatRoomTitle({ hospitalName, medicalSpecialties }: AdminChatRoomTitleProps) {
  const specialtiesText = medicalSpecialties
    ?.map((specialty) => getKoreanText(specialty.name))
    .filter(Boolean)
    .slice(0, 3) // 최대 3개까지만 표시
    .join(', ');

  return (
    <div className='min-w-0 space-y-0.5 sm:space-y-1'>
      <h3 className='text-foreground truncate text-base font-semibold sm:text-lg'>
        {hospitalName}
      </h3>
      {specialtiesText && (
        <p className='text-muted-foreground truncate text-xs sm:text-sm'>{specialtiesText}</p>
      )}
    </div>
  );
}
