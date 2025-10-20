'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/shared/ui';
import { ClockIcon } from 'lucide-react';
import {
  type ReservationCategory,
  type ReservationLanguage,
  type CreateReservationRequest,
} from '../api/entities/types';

interface AdminCreateReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateReservationRequest) => void;
  hospitalId: string;
  userId: string;
  hospitalName: string;
  isLoading?: boolean;
}

export function AdminCreateReservationModal({
  isOpen,
  onClose,
  onSubmit,
  hospitalId,
  userId,
  hospitalName,
  isLoading = false,
}: AdminCreateReservationModalProps) {
  // 폼 상태
  const [formData, setFormData] = useState<CreateReservationRequest>({
    hospitalId,
    userId,
    category: 'PROCEDURE',
    language: 'ko_KR',
    procedureName: '',
    reservationDate: '',
    reservationTime: '',
    depositAmount: 1, // 1 USD (달러 단위로 변경)
    currency: 'USD',
    paymentDeadline: '',
    customGuideText: '',
    customDetails: '',
    customNotice: '',
    buttonText: '',
  });

  // 날짜 선택 상태
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedDeadline, setSelectedDeadline] = useState<Date | undefined>(undefined);

  // 폼 데이터 업데이트
  const updateFormData = (field: keyof CreateReservationRequest, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 날짜를 문자열로 변환하는 함수
  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 날짜 변경 처리
  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      updateFormData('reservationDate', formatDateToString(date));
    }
  };

  // 입금 기한 변경 처리
  const handleDeadlineChange = (date: Date | undefined) => {
    setSelectedDeadline(date);
    if (date) {
      updateFormData('paymentDeadline', date.toISOString());
    }
  };

  // 과거 날짜 비활성화 함수
  const disablePastDates = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // 언어를 DatePicker locale로 변환
  const getDatePickerLocale = (language: ReservationLanguage): 'ko' | 'en' | 'th' => {
    switch (language) {
      case 'ko_KR':
        return 'ko';
      case 'en_US':
        return 'en';
      case 'th_TH':
        return 'th';
      default:
        return 'ko';
    }
  };

  // 폼 제출 처리
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 기본 검증
    if (!formData.procedureName.trim()) {
      alert('시술명을 입력해주세요.');
      return;
    }
    if (!formData.reservationDate) {
      alert('예약 날짜를 선택해주세요.');
      return;
    }
    if (!formData.reservationTime) {
      alert('예약 시간을 입력해주세요.');
      return;
    }
    if (!formData.paymentDeadline) {
      alert('입금 기한을 선택해주세요.');
      return;
    }

    onSubmit(formData);
  };

  // 모달 닫기 처리
  const handleClose = () => {
    // 폼 초기화
    setFormData({
      hospitalId,
      userId,
      category: 'PROCEDURE',
      language: 'ko_KR',
      procedureName: '',
      reservationDate: '',
      reservationTime: '',
      depositAmount: 100,
      currency: 'USD',
      paymentDeadline: '',
      customGuideText: '',
      customDetails: '',
      customNotice: '',
      buttonText: '',
    });
    setSelectedDate(undefined);
    setSelectedDeadline(undefined);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-h-[90vh] max-w-none overflow-y-auto sm:max-w-6xl'>
        <DialogHeader>
          <DialogTitle>예약 생성</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='w-full space-y-6'>
          {/* 기본 정보 섹션 */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>기본 정보</h3>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='hospitalName'>병원명</Label>
                <Input id='hospitalName' value={hospitalName} disabled className='bg-gray-50' />
              </div>

              <div>
                <Label htmlFor='category'>예약 카테고리</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: ReservationCategory) => updateFormData('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='PROCEDURE'>시술</SelectItem>
                    <SelectItem value='LIMOUSINE'>리무진</SelectItem>
                    <SelectItem value='OTHER'>기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor='language'>언어</Label>
              <Select
                value={formData.language}
                onValueChange={(value: ReservationLanguage) => updateFormData('language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ko_KR'>한국어</SelectItem>
                  <SelectItem value='en_US'>영어</SelectItem>
                  <SelectItem value='th_TH'>태국어</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor='procedureName'>시술명 *</Label>
              <Input
                id='procedureName'
                value={formData.procedureName}
                onChange={(e) => updateFormData('procedureName', e.target.value)}
                placeholder='예: 실리프팅, 보톡스 등'
                required
              />
            </div>
          </div>

          {/* 예약 정보 섹션 */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>예약 정보</h3>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <DatePicker
                  label='예약 날짜'
                  value={selectedDate}
                  onChange={handleDateChange}
                  locale={getDatePickerLocale(formData.language)}
                  placeholder='날짜를 선택해주세요'
                  disabled={disablePastDates}
                  required={true}
                  yearRange={{ from: new Date().getFullYear(), to: new Date().getFullYear() + 5 }}
                />
              </div>

              <div>
                <Label htmlFor='reservationTime'>예약 시간 *</Label>
                <div className='relative'>
                  <ClockIcon className='absolute top-3 left-3 h-4 w-4 text-gray-400' />
                  <Input
                    id='reservationTime'
                    type='time'
                    value={formData.reservationTime}
                    onChange={(e) => updateFormData('reservationTime', e.target.value)}
                    className='pl-10'
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 결제 정보 섹션 */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>결제 정보</h3>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='depositAmount'>예약금 (USD) *</Label>
                <Input
                  id='depositAmount'
                  type='number'
                  min='1'
                  step='0.01'
                  value={formData.depositAmount}
                  onChange={(e) => updateFormData('depositAmount', parseFloat(e.target.value))}
                  required
                />
              </div>

              <div>
                <DatePicker
                  label='입금 기한'
                  value={selectedDeadline}
                  onChange={handleDeadlineChange}
                  locale={getDatePickerLocale(formData.language)}
                  placeholder='기한을 선택해주세요'
                  disabled={disablePastDates}
                  required={true}
                  yearRange={{ from: new Date().getFullYear(), to: new Date().getFullYear() + 5 }}
                />
              </div>
            </div>
          </div>

          {/* 버튼 섹션 */}
          <div className='flex justify-end space-x-2 pt-4'>
            <Button type='button' variant='outline' onClick={handleClose}>
              취소
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? '생성 중...' : '예약 생성'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
