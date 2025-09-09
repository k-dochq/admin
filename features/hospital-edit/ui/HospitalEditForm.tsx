'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { useHospitalById, useUpdateHospital } from '@/lib/queries/hospital-edit';
import { useDistricts } from '@/lib/queries/districts';
import { HospitalApprovalStatusType } from '@prisma/client';
import { type UpdateHospitalRequest, type LocalizedText } from '@/features/hospital-edit/api';

interface HospitalEditFormProps {
  hospitalId: string;
}

type FormData = {
  name_ko: string;
  name_en: string;
  name_th: string;
  address_ko: string;
  address_en: string;
  address_th: string;
  directions_ko?: string;
  directions_en?: string;
  directions_th?: string;
  phoneNumber?: string;
  description_ko?: string;
  description_en?: string;
  description_th?: string;
  openingHours_ko?: string;
  openingHours_en?: string;
  openingHours_th?: string;
  email?: string;
  subPhoneNumbers?: string;
  lineId?: string;
  memo?: string;
  reviewUrl?: string;
  enableJp: boolean;
  ranking?: number;
  discountRate?: number;
  approvalStatusType: HospitalApprovalStatusType;
  rejectReason?: string;
  districtId?: string;
};

export function HospitalEditForm({ hospitalId }: HospitalEditFormProps) {
  const router = useRouter();
  const { data, isLoading, error } = useHospitalById(hospitalId);
  const { data: districts, isLoading: isLoadingDistricts } = useDistricts();
  const updateHospitalMutation = useUpdateHospital();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset,
  } = useForm<FormData>();

  const enableJp = watch('enableJp');
  const approvalStatusType = watch('approvalStatusType');

  // 병원 데이터가 로드되면 폼에 채우기
  useEffect(() => {
    if (data?.hospital) {
      const hospital = data.hospital;
      const name = hospital.name as LocalizedText;
      const address = hospital.address as LocalizedText;
      const directions = hospital.directions as LocalizedText;
      const description = hospital.description as LocalizedText;
      const openingHours = hospital.openingHours as LocalizedText;
      const subPhoneNumbers = hospital.subPhoneNumbers as string[];

      reset({
        name_ko: name?.ko_KR || '',
        name_en: name?.en_US || '',
        name_th: name?.th_TH || '',
        address_ko: address?.ko_KR || '',
        address_en: address?.en_US || '',
        address_th: address?.th_TH || '',
        directions_ko: directions?.ko_KR || '',
        directions_en: directions?.en_US || '',
        directions_th: directions?.th_TH || '',
        phoneNumber: hospital.phoneNumber || '',
        description_ko: description?.ko_KR || '',
        description_en: description?.en_US || '',
        description_th: description?.th_TH || '',
        openingHours_ko: openingHours?.ko_KR || '',
        openingHours_en: openingHours?.en_US || '',
        openingHours_th: openingHours?.th_TH || '',
        email: hospital.email || '',
        subPhoneNumbers: subPhoneNumbers?.join(', ') || '',
        lineId: hospital.lineId || '',
        memo: hospital.memo || '',
        reviewUrl: hospital.reviewUrl || '',
        enableJp: hospital.enableJp,
        ranking: hospital.ranking || undefined,
        discountRate: hospital.discountRate || undefined,
        approvalStatusType: hospital.approvalStatusType,
        rejectReason: hospital.rejectReason || '',
        districtId: hospital.districtId || '',
      });
    }
  }, [data, reset]);

  const onSubmit = async (formData: FormData) => {
    try {
      const updateData: UpdateHospitalRequest = {
        id: hospitalId,
        name: {
          ko_KR: formData.name_ko,
          en_US: formData.name_en,
          th_TH: formData.name_th,
        },
        address: {
          ko_KR: formData.address_ko,
          en_US: formData.address_en,
          th_TH: formData.address_th,
        },
        directions:
          formData.directions_ko || formData.directions_en || formData.directions_th
            ? {
                ko_KR: formData.directions_ko,
                en_US: formData.directions_en,
                th_TH: formData.directions_th,
              }
            : undefined,
        phoneNumber: formData.phoneNumber,
        description:
          formData.description_ko || formData.description_en || formData.description_th
            ? {
                ko_KR: formData.description_ko,
                en_US: formData.description_en,
                th_TH: formData.description_th,
              }
            : undefined,
        openingHours:
          formData.openingHours_ko || formData.openingHours_en || formData.openingHours_th
            ? {
                ko_KR: formData.openingHours_ko,
                en_US: formData.openingHours_en,
                th_TH: formData.openingHours_th,
              }
            : undefined,
        email: formData.email,
        subPhoneNumbers: formData.subPhoneNumbers
          ? formData.subPhoneNumbers
              .split(',')
              .map((phone) => phone.trim())
              .filter(Boolean)
          : [],
        lineId: formData.lineId,
        memo: formData.memo,
        reviewUrl: formData.reviewUrl,
        enableJp: formData.enableJp,
        ranking: formData.ranking,
        discountRate: formData.discountRate,
        approvalStatusType: formData.approvalStatusType,
        rejectReason: formData.rejectReason,
        districtId: formData.districtId || undefined,
      };

      await updateHospitalMutation.mutateAsync(updateData);
      router.push('/admin/hospitals');
    } catch (error) {
      console.error('Failed to update hospital:', error);
    }
  };

  const getDistrictName = (district: any): string => {
    if (district?.name && typeof district.name === 'object') {
      const localizedName = district.name as LocalizedText;
      return localizedName.ko_KR || localizedName.en_US || localizedName.th_TH || '이름 없음';
    }
    return '이름 없음';
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-destructive'>병원 정보를 불러오는 중 오류가 발생했습니다.</div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Button variant='ghost' size='sm' onClick={() => router.back()}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            뒤로가기
          </Button>
          <h1 className='text-2xl font-bold'>병원 정보 수정</h1>
        </div>
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={!isDirty || updateHospitalMutation.isPending}
        >
          {updateHospitalMutation.isPending ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <Save className='mr-2 h-4 w-4' />
          )}
          저장
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* 병원명 */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <div>
                <Label htmlFor='name_ko'>병원명 (한국어) *</Label>
                <Input
                  id='name_ko'
                  {...register('name_ko', { required: '한국어 병원명은 필수입니다.' })}
                />
                {errors.name_ko && (
                  <p className='text-destructive text-sm'>{errors.name_ko.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor='name_en'>병원명 (영어)</Label>
                <Input id='name_en' {...register('name_en')} />
              </div>
              <div>
                <Label htmlFor='name_th'>병원명 (태국어)</Label>
                <Input id='name_th' {...register('name_th')} />
              </div>
            </div>

            {/* 주소 */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <div>
                <Label htmlFor='address_ko'>주소 (한국어) *</Label>
                <Input
                  id='address_ko'
                  {...register('address_ko', { required: '한국어 주소는 필수입니다.' })}
                />
                {errors.address_ko && (
                  <p className='text-destructive text-sm'>{errors.address_ko.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor='address_en'>주소 (영어)</Label>
                <Input id='address_en' {...register('address_en')} />
              </div>
              <div>
                <Label htmlFor='address_th'>주소 (태국어)</Label>
                <Input id='address_th' {...register('address_th')} />
              </div>
            </div>

            {/* 연락처 정보 */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div>
                <Label htmlFor='phoneNumber'>전화번호</Label>
                <Input id='phoneNumber' {...register('phoneNumber')} />
              </div>
              <div>
                <Label htmlFor='email'>이메일</Label>
                <Input id='email' type='email' {...register('email')} />
              </div>
            </div>

            <div>
              <Label htmlFor='subPhoneNumbers'>추가 전화번호 (쉼표로 구분)</Label>
              <Input
                id='subPhoneNumbers'
                placeholder='02-1234-5678, 010-1234-5678'
                {...register('subPhoneNumbers')}
              />
            </div>

            {/* 지역 선택 */}
            <div>
              <Label htmlFor='districtId'>지역</Label>
              <Select
                value={watch('districtId') || 'none'}
                onValueChange={(value) =>
                  setValue('districtId', value === 'none' ? undefined : value)
                }
                disabled={isLoadingDistricts}
              >
                <SelectTrigger>
                  <SelectValue placeholder='지역을 선택하세요' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='none'>지역 없음</SelectItem>
                  {districts?.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
                      {getDistrictName(district)} ({district.countryCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 상세 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>상세 정보</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* 설명 */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <div>
                <Label htmlFor='description_ko'>병원 설명 (한국어)</Label>
                <Textarea id='description_ko' {...register('description_ko')} />
              </div>
              <div>
                <Label htmlFor='description_en'>병원 설명 (영어)</Label>
                <Textarea id='description_en' {...register('description_en')} />
              </div>
              <div>
                <Label htmlFor='description_th'>병원 설명 (태국어)</Label>
                <Textarea id='description_th' {...register('description_th')} />
              </div>
            </div>

            {/* 운영시간 */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <div>
                <Label htmlFor='openingHours_ko'>운영시간 (한국어)</Label>
                <Textarea id='openingHours_ko' {...register('openingHours_ko')} />
              </div>
              <div>
                <Label htmlFor='openingHours_en'>운영시간 (영어)</Label>
                <Textarea id='openingHours_en' {...register('openingHours_en')} />
              </div>
              <div>
                <Label htmlFor='openingHours_th'>운영시간 (태국어)</Label>
                <Textarea id='openingHours_th' {...register('openingHours_th')} />
              </div>
            </div>

            {/* 길찾기 */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <div>
                <Label htmlFor='directions_ko'>길찾기 정보 (한국어)</Label>
                <Textarea id='directions_ko' {...register('directions_ko')} />
              </div>
              <div>
                <Label htmlFor='directions_en'>길찾기 정보 (영어)</Label>
                <Textarea id='directions_en' {...register('directions_en')} />
              </div>
              <div>
                <Label htmlFor='directions_th'>길찾기 정보 (태국어)</Label>
                <Textarea id='directions_th' {...register('directions_th')} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 기타 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>기타 정보</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <div>
                <Label htmlFor='lineId'>라인 ID</Label>
                <Input id='lineId' {...register('lineId')} />
              </div>
              <div>
                <Label htmlFor='ranking'>랭킹</Label>
                <Input
                  id='ranking'
                  type='number'
                  {...register('ranking', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor='discountRate'>할인율 (%)</Label>
                <Input
                  id='discountRate'
                  type='number'
                  step='0.1'
                  {...register('discountRate', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor='reviewUrl'>리뷰 URL</Label>
              <Input id='reviewUrl' type='url' {...register('reviewUrl')} />
            </div>

            <div>
              <Label htmlFor='memo'>메모</Label>
              <Textarea id='memo' {...register('memo')} />
            </div>

            {/* 승인 상태 */}
            <div>
              <Label htmlFor='approvalStatusType'>승인 상태</Label>
              <Select
                value={approvalStatusType}
                onValueChange={(value) =>
                  setValue('approvalStatusType', value as HospitalApprovalStatusType)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='PENDING'>대기중</SelectItem>
                  <SelectItem value='APPROVED'>승인됨</SelectItem>
                  <SelectItem value='REJECTED'>거부됨</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {approvalStatusType === 'REJECTED' && (
              <div>
                <Label htmlFor='rejectReason'>거부 사유</Label>
                <Textarea id='rejectReason' {...register('rejectReason')} />
              </div>
            )}

            {/* 일본 서비스 활성화 */}
            <div className='flex items-center space-x-2'>
              <Switch
                id='enableJp'
                checked={enableJp}
                onCheckedChange={(checked) => setValue('enableJp', checked)}
              />
              <Label htmlFor='enableJp'>일본 서비스 활성화</Label>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
