'use client';

import { Fragment } from 'react';
import { Prisma } from '@prisma/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus } from 'lucide-react';
import type { MedicalSpecialty } from '@/lib/queries/medical-specialties';

function getLocalizedText(jsonText: Prisma.JsonValue | null | undefined): string {
  if (!jsonText) return '';
  if (typeof jsonText === 'string') return jsonText;
  if (typeof jsonText === 'object' && jsonText !== null && !Array.isArray(jsonText)) {
    const obj = jsonText as Record<string, unknown>;
    return (
      (obj.ko_KR as string) || (obj.en_US as string) || (obj.th_TH as string) || ''
    );
  }
  return '';
}

interface MedicalSpecialtyTreeProps {
  parentSpecialties: MedicalSpecialty[];
  childrenByParentId: Record<string, MedicalSpecialty[]>;
  onAddSubCategory: (parentId: string) => void;
  onEdit: (specialty: MedicalSpecialty) => void;
  onDelete: (specialty: MedicalSpecialty) => void;
  isDeletePending?: boolean;
}

export function MedicalSpecialtyTree({
  parentSpecialties,
  childrenByParentId,
  onAddSubCategory,
  onEdit,
  onDelete,
  isDeletePending = false,
}: MedicalSpecialtyTreeProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>이름</TableHead>
          <TableHead>설명</TableHead>
          <TableHead>정렬 순서</TableHead>
          <TableHead>상태</TableHead>
          <TableHead className='text-right'>작업</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {parentSpecialties.map((parent) => {
          const children = childrenByParentId[parent.id] ?? [];
          return (
            <Fragment key={parent.id}>
              <TableRow key={parent.id} className='bg-muted/30'>
                <TableCell className='font-semibold'>
                  {getLocalizedText(parent.name)}
                </TableCell>
                <TableCell>{getLocalizedText(parent.description)}</TableCell>
                <TableCell>{parent.order ?? '-'}</TableCell>
                <TableCell>
                  <Badge variant={parent.isActive ? 'default' : 'secondary'}>
                    {parent.isActive ? '활성' : '비활성'}
                  </Badge>
                </TableCell>
                <TableCell className='text-right'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => onAddSubCategory(parent.id)}
                    className='gap-1'
                  >
                    <Plus className='h-3 w-3' />
                    하위 추가
                  </Button>
                </TableCell>
              </TableRow>
              {children.map((child) => (
                <TableRow key={child.id} className='bg-background'>
                  <TableCell className='pl-12 font-normal text-muted-foreground'>
                    └ {getLocalizedText(child.name)}
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {getLocalizedText(child.description)}
                  </TableCell>
                  <TableCell>{child.order ?? '-'}</TableCell>
                  <TableCell>
                    <Badge variant={child.isActive ? 'default' : 'secondary'}>
                      {child.isActive ? '활성' : '비활성'}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => onEdit(child)}
                        aria-label='수정'
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => onDelete(child)}
                        disabled={isDeletePending}
                        aria-label='삭제'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}
