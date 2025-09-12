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
import { Prisma } from '@prisma/client';
import {
  type GetHospitalsResponse,
  type HospitalWithDistrict,
  type LocalizedText,
} from '@/features/hospital-management/api';
import { LoadingSpinner } from '@/shared/ui';
import { useDeleteHospital } from '@/lib/mutations/hospital-delete';
import { toast } from 'sonner';

interface HospitalTableProps {
  data?: GetHospitalsResponse;
  isLoading: boolean;
  isFetching: boolean;
  page: number;
  onPageChange: (page: number) => void;
}

export function HospitalTable({
  data,
  isLoading,
  isFetching,
  page,
  onPageChange,
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
        name: Prisma.JsonValue;
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
        const nameObj = hospitalSpecialty.medicalSpecialty.name as LocalizedText;
        const name = nameObj.ko_KR || nameObj.en_US || nameObj.th_TH;
        if (name && typeof name === 'string') {
          parts.push(name);
        }
      }
    });

    return parts.slice(0, 5); // 최대 5개
  };

  const getHospitalName = (name: Prisma.JsonValue): string => {
    if (typeof name === 'object' && name !== null && !Array.isArray(name)) {
      const localizedName = name as LocalizedText;
      return localizedName.ko_KR || localizedName.en_US || localizedName.th_TH || '이름 없음';
    }
    return '이름 없음';
  };

  const getDistrictName = (district: HospitalWithDistrict['district']): string => {
    if (!district) return '-';
    if (
      typeof district.name === 'object' &&
      district.name !== null &&
      !Array.isArray(district.name)
    ) {
      const localizedName = district.name as LocalizedText;
      return localizedName.ko_KR || localizedName.en_US || localizedName.th_TH || '-';
    }
    return '-';
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
                  <TableHead>전화번호</TableHead>
                  <TableHead>진료부위</TableHead>
                  <TableHead>랭킹</TableHead>
                  <TableHead>등록일</TableHead>
                  <TableHead className='text-right'>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.hospitals.map((hospital) => (
                  <TableRow key={hospital.id}>
                    <TableCell className='font-medium'>{getHospitalName(hospital.name)}</TableCell>
                    <TableCell>{getDistrictName(hospital.district)}</TableCell>
                    <TableCell>{hospital.phoneNumber || '-'}</TableCell>
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
                      {hospital.ranking ? (
                        <Badge variant='secondary' className='bg-blue-100 text-blue-800'>
                          {hospital.ranking}위
                        </Badge>
                      ) : (
                        '-'
                      )}
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
                          <Link href={`/admin/hospitals/${hospital.id}/edit`}>
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
