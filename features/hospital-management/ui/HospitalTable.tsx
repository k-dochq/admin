'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Building2, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import {
  type GetHospitalsResponse,
  type HospitalWithDistrict,
  type LocalizedText,
} from '@/features/hospital-management/api';
import { LoadingSpinner } from '@/shared/ui';
import { useDeleteHospital } from '@/lib/mutations/hospital-delete';
import { toast } from 'sonner';
import { getFirstAvailableText, parseLocalizedText } from '@/shared/lib/utils/locale-utils';

interface HospitalTableProps {
  data?: GetHospitalsResponse;
  isLoading: boolean;
  isFetching: boolean;
  page: number;
  onPageChange: (page: number) => void;
  returnToListPath: string;
}

export function HospitalTable({
  data,
  isLoading,
  isFetching,
  page,
  onPageChange,
  returnToListPath,
}: HospitalTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hospitalToDelete, setHospitalToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const deleteHospitalMutation = useDeleteHospital();

  const handleDeleteClick = (hospital: HospitalWithDistrict) => {
    setHospitalToDelete({
      id: hospital.id,
      name: getHospitalName(hospital.name),
    });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!hospitalToDelete) return;

    try {
      await deleteHospitalMutation.mutateAsync({ id: hospitalToDelete.id });
      toast.success('병원이 성공적으로 삭제되었습니다.');
      setDeleteDialogOpen(false);
      setHospitalToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '병원 삭제에 실패했습니다.');
    }
  };
  const getMedicalParts = (
    hospitalSpecialties?: Array<{
      id: string;
      medicalSpecialty: {
        id: string;
        name: unknown;
        specialtyType: string;
        order: number | null;
      };
    }>,
  ): string[] => {
    if (!hospitalSpecialties || hospitalSpecialties.length === 0) return [];

    const parts: string[] = [];
    hospitalSpecialties.forEach((hospitalSpecialty) => {
      if (
        hospitalSpecialty.medicalSpecialty.name &&
        typeof hospitalSpecialty.medicalSpecialty.name === 'object' &&
        !Array.isArray(hospitalSpecialty.medicalSpecialty.name)
      ) {
        const localizedText = parseLocalizedText(hospitalSpecialty.medicalSpecialty.name);
        const name = getFirstAvailableText(localizedText);
        if (name) {
          parts.push(name);
        }
      }
    });

    return parts.slice(0, 5); // 최대 5개
  };

  const getHospitalName = (name: unknown): string => {
    const localizedText = parseLocalizedText(name as Prisma.JsonValue);
    const text = getFirstAvailableText(localizedText);
    return text || '이름 없음';
  };

  const getDistrictName = (district: HospitalWithDistrict['district']): string => {
    if (!district) return '-';
    const localizedText = parseLocalizedText(district.name);
    const text = getFirstAvailableText(localizedText);
    return text || '-';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center'>
          <Building2 className='mr-2 h-5 w-5' />
          병원 목록 ({data?.total || 0}개)
          {isFetching && <Loader2 className='text-muted-foreground ml-2 h-4 w-4 animate-spin' />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 로딩 중이고 데이터가 없을 때만 테이블 스켈레톤 표시 */}
        {isLoading && !data ? (
          <LoadingSpinner size='sm' text='데이터를 새로고침하는 중...' />
        ) : (
          <div className={`rounded-md border transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>병원명</TableHead>
                  <TableHead>지역</TableHead>
                  <TableHead>노출레벨</TableHead>
                  <TableHead>승인상태</TableHead>
                  <TableHead>진료부위</TableHead>
                  <TableHead>랭킹 / 추천순위</TableHead>
                  <TableHead>등록일</TableHead>
                  <TableHead className='text-right'>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.hospitals.map((hospital) => (
                  <TableRow key={hospital.id}>
                    <TableCell className='font-medium'>{getHospitalName(hospital.name)}</TableCell>
                    <TableCell>{getDistrictName(hospital.district)}</TableCell>
                    <TableCell>{hospital.isActive ? 'Public' : 'Hidden'}</TableCell>
                    <TableCell>{hospital.approvalStatusType ?? '-'}</TableCell>
                    <TableCell>
                      <div className='flex flex-wrap gap-1'>
                        {getMedicalParts(hospital.hospitalSpecialties).map((part, index) => (
                          <Badge key={index} variant='outline' className='text-xs'>
                            {part}
                          </Badge>
                        ))}
                        {(!hospital.hospitalSpecialties ||
                          hospital.hospitalSpecialties.length === 0) && (
                          <span className='text-muted-foreground text-xs'>-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2'>
                        {hospital.ranking ? (
                          <Badge variant='secondary' className='bg-blue-100 text-blue-800'>
                            랭킹 {hospital.ranking}위
                          </Badge>
                        ) : (
                          <span className='text-muted-foreground text-xs'>랭킹 없음</span>
                        )}
                        {hospital.recommendedRanking != null && (
                          <Badge variant='outline' className='border-orange-200 bg-orange-50 text-orange-700 text-xs'>
                            추천 {hospital.recommendedRanking}위
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(hospital.createdAt).toLocaleDateString('ko-KR')}
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end space-x-2'>
                        <Button variant='ghost' size='sm' title='상세보기'>
                          <Eye className='h-4 w-4' />
                        </Button>
                        <Button variant='ghost' size='sm' asChild title='수정하기'>
                          <Link
                            href={`/admin/hospitals/${hospital.id}/edit?returnTo=${encodeURIComponent(returnToListPath)}`}
                          >
                            <Edit className='h-4 w-4' />
                          </Link>
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-destructive'
                          title='삭제하기'
                          onClick={() => handleDeleteClick(hospital)}
                          disabled={deleteHospitalMutation.isPending}
                        >
                          {deleteHospitalMutation.isPending &&
                          hospitalToDelete?.id === hospital.id ? (
                            <Loader2 className='h-4 w-4 animate-spin' />
                          ) : (
                            <Trash2 className='h-4 w-4' />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* 페이지네이션 */}
        {data && data.total > 20 && (
          <div className='flex items-center justify-between pt-4'>
            <div className='text-muted-foreground text-sm'>
              {(page - 1) * 20 + 1}-{Math.min(page * 20, data.total)} / {data.total}개
            </div>
            <div className='flex space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1 || isFetching}
              >
                이전
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => onPageChange(page + 1)}
                disabled={page * 20 >= data.total || isFetching}
              >
                다음
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>병원 삭제 확인</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 <strong>{hospitalToDelete?.name}</strong> 병원을 삭제하시겠습니까?
              <br />
              <br />
              <span className='text-destructive font-medium'>
                ⚠️ 이 작업은 되돌릴 수 없으며, 병원과 관련된 모든 데이터(의사, 리뷰, 이미지 등)가
                함께 삭제됩니다.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteHospitalMutation.isPending}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteHospitalMutation.isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleteHospitalMutation.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  삭제 중...
                </>
              ) : (
                '삭제'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
