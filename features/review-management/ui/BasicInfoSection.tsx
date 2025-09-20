import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { ReviewFormErrors } from '../model/useReviewForm';

interface MedicalSpecialty {
  id: string;
  name: any; // JSON value
}

interface BasicInfoSectionProps {
  rating: number;
  medicalSpecialtyId: string;
  isRecommended: boolean;
  medicalSpecialties: MedicalSpecialty[];
  errors: ReviewFormErrors;
  onUpdateRating: (value: number) => void;
  onUpdateMedicalSpecialtyId: (value: string) => void;
  onUpdateIsRecommended: (value: boolean) => void;
}

// 다국어 텍스트 추출
const getLocalizedText = (jsonText: any, locale: string): string => {
  if (!jsonText) return '';
  if (typeof jsonText === 'string') return jsonText;
  if (typeof jsonText === 'object' && jsonText !== null && !Array.isArray(jsonText)) {
    const textObj = jsonText as Record<string, unknown>;
    return (textObj[locale] as string) || '';
  }
  return '';
};

export function BasicInfoSection({
  rating,
  medicalSpecialtyId,
  isRecommended,
  medicalSpecialties,
  errors,
  onUpdateRating,
  onUpdateMedicalSpecialtyId,
  onUpdateIsRecommended,
}: BasicInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>기본 정보</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <div>
            <Label htmlFor='rating'>평점</Label>
            <Select
              value={rating.toString()}
              onValueChange={(value) => onUpdateRating(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='5'>5점</SelectItem>
                <SelectItem value='4'>4점</SelectItem>
                <SelectItem value='3'>3점</SelectItem>
                <SelectItem value='2'>2점</SelectItem>
                <SelectItem value='1'>1점</SelectItem>
              </SelectContent>
            </Select>
            {errors.rating && <p className='text-destructive mt-1 text-sm'>{errors.rating}</p>}
          </div>

          <div>
            <Label htmlFor='medicalSpecialtyId'>시술부위</Label>
            <Select value={medicalSpecialtyId} onValueChange={onUpdateMedicalSpecialtyId}>
              <SelectTrigger>
                <SelectValue placeholder='시술부위 선택' />
              </SelectTrigger>
              <SelectContent>
                {medicalSpecialties.map((specialty) => (
                  <SelectItem key={specialty.id} value={specialty.id}>
                    {getLocalizedText(specialty.name, 'ko_KR')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.medicalSpecialtyId && (
              <p className='text-destructive mt-1 text-sm'>{errors.medicalSpecialtyId}</p>
            )}
          </div>

          <div className='flex items-center space-x-2'>
            <Switch
              id='isRecommended'
              checked={isRecommended}
              onCheckedChange={onUpdateIsRecommended}
            />
            <Label htmlFor='isRecommended'>추천</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
