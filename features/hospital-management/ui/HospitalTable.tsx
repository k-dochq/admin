'use client';

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
import { Building2, Eye, Edit, Trash2, Star, Loader2 } from 'lucide-react';
import { Prisma } from '@prisma/client';
import {
  type GetHospitalsResponse,
  type HospitalWithDistrict,
  type LocalizedText,
} from '@/features/hospital-management/api';
import { HospitalTableSkeleton } from './HospitalTableSkeleton';

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
  const getApprovalStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Badge variant='default' className='bg-green-100 text-green-800'>
            승인됨
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge variant='secondary' className='bg-yellow-100 text-yellow-800'>
            대기중
          </Badge>
        );
      case 'REJECTED':
        return <Badge variant='destructive'>거부됨</Badge>;
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
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
          <HospitalTableSkeleton />
        ) : (
          <div className={`rounded-md border transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>병원명</TableHead>
                  <TableHead>지역</TableHead>
                  <TableHead>전화번호</TableHead>
                  <TableHead>평점</TableHead>
                  <TableHead>리뷰수</TableHead>
                  <TableHead>승인상태</TableHead>
                  <TableHead>일본서비스</TableHead>
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
                      <div className='flex items-center'>
                        <Star className='mr-1 h-4 w-4 text-yellow-500' />
                        {hospital.rating.toFixed(1)}
                      </div>
                    </TableCell>
                    <TableCell>{hospital.reviewCount}</TableCell>
                    <TableCell>{getApprovalStatusBadge(hospital.approvalStatusType)}</TableCell>
                    <TableCell>
                      {hospital.enableJp ? (
                        <Badge variant='outline' className='bg-blue-100 text-blue-800'>
                          활성화
                        </Badge>
                      ) : (
                        <Badge variant='outline'>비활성화</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(hospital.createdAt).toLocaleDateString('ko-KR')}
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end space-x-2'>
                        <Button variant='ghost' size='sm'>
                          <Eye className='h-4 w-4' />
                        </Button>
                        <Button variant='ghost' size='sm'>
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button variant='ghost' size='sm' className='text-destructive'>
                          <Trash2 className='h-4 w-4' />
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
    </Card>
  );
}
