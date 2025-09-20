'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreHorizontal, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDeleteDoctor } from '@/lib/queries/doctors';
import {
  type GetDoctorsResponse,
  parseJsonValueToString,
} from '@/features/doctor-management/api/entities/types';

interface DoctorTableProps {
  data?: GetDoctorsResponse;
  isFetching: boolean;
  page: number;
  onPageChange: (page: number) => void;
}

export function DoctorTable({ data, isFetching, page, onPageChange }: DoctorTableProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<string | null>(null);

  const deleteDoctor = useDeleteDoctor();

  const handleEdit = (doctorId: string) => {
    router.push(`/admin/doctors/${doctorId}/edit`);
  };

  const handleView = (doctorId: string) => {
    router.push(`/admin/doctors/${doctorId}`);
  };

  const handleDeleteClick = (doctorId: string) => {
    setDoctorToDelete(doctorId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!doctorToDelete) return;

    try {
      await deleteDoctor.mutateAsync(doctorToDelete);
      setDeleteDialogOpen(false);
      setDoctorToDelete(null);
    } catch (error) {
      console.error('의사 삭제 실패:', error);
    }
  };

  const getApprovalStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: '대기', variant: 'secondary' as const },
      APPROVED: { label: '승인', variant: 'default' as const },
      REJECTED: { label: '거부', variant: 'destructive' as const },
      WAITING_APPROVAL: { label: '승인대기', variant: 'outline' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: 'secondary' as const,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getGenderBadge = (gender: string) => {
    return (
      <Badge variant='outline'>
        {gender === 'MALE' ? '남성' : gender === 'FEMALE' ? '여성' : gender}
      </Badge>
    );
  };

  const getStatusBadge = (stopped: boolean) => {
    return <Badge variant={stopped ? 'destructive' : 'default'}>{stopped ? '중단' : '활성'}</Badge>;
  };

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>의사 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-muted-foreground py-8 text-center'>데이터를 불러오는 중...</div>
        </CardContent>
      </Card>
    );
  }

  const { doctors, total, totalPages } = data;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>의사 목록</span>
            <span className='text-muted-foreground text-sm font-normal'>총 {total}명</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {doctors.length === 0 ? (
            <div className='text-muted-foreground py-8 text-center'>등록된 의사가 없습니다.</div>
          ) : (
            <>
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>이름</TableHead>
                      <TableHead>직책</TableHead>
                      <TableHead>성별</TableHead>
                      <TableHead>병원</TableHead>
                      <TableHead>면허번호</TableHead>
                      <TableHead>승인상태</TableHead>
                      <TableHead>활동상태</TableHead>
                      <TableHead>등록일</TableHead>
                      <TableHead className='text-right'>작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctors.map((doctor) => (
                      <TableRow key={doctor.id} className={isFetching ? 'opacity-50' : ''}>
                        <TableCell className='font-medium'>
                          {parseJsonValueToString(doctor.name)}
                        </TableCell>
                        <TableCell>
                          {doctor.position ? parseJsonValueToString(doctor.position) : '-'}
                        </TableCell>
                        <TableCell>{getGenderBadge(doctor.genderType)}</TableCell>
                        <TableCell>{parseJsonValueToString(doctor.hospital.name)}</TableCell>
                        <TableCell>{doctor.licenseNumber || '-'}</TableCell>
                        <TableCell>{getApprovalStatusBadge(doctor.approvalStatusType)}</TableCell>
                        <TableCell>{getStatusBadge(doctor.stop)}</TableCell>
                        <TableCell>
                          {new Date(doctor.createdAt).toLocaleDateString('ko-KR')}
                        </TableCell>
                        <TableCell className='text-right'>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' className='h-8 w-8 p-0'>
                                <MoreHorizontal className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem onClick={() => handleView(doctor.id)}>
                                <Eye className='mr-2 h-4 w-4' />
                                보기
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(doctor.id)}>
                                <Edit className='mr-2 h-4 w-4' />
                                수정
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(doctor.id)}
                                className='text-destructive'
                              >
                                <Trash2 className='mr-2 h-4 w-4' />
                                삭제
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className='mt-4 flex items-center justify-between'>
                  <div className='text-muted-foreground text-sm'>
                    {total}개 중 {(page - 1) * 20 + 1}-{Math.min(page * 20, total)}개 표시
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => onPageChange(page - 1)}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className='h-4 w-4' />
                      이전
                    </Button>
                    <div className='text-sm'>
                      {page} / {totalPages}
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => onPageChange(page + 1)}
                      disabled={page >= totalPages}
                    >
                      다음
                      <ChevronRight className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>의사 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 의사를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              disabled={deleteDoctor.isPending}
            >
              {deleteDoctor.isPending ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
