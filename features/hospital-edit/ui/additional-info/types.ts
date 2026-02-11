import { type PriceInfo, type FormErrors, type DistrictForForm } from '../../api/entities/types';

export interface AdditionalInfoSectionProps {
  ranking: number | undefined;
  rating: number | undefined;
  discountRate: number | undefined;
  latitude: number | undefined;
  longitude: number | undefined;
  districtId: string | undefined;
  prices: PriceInfo | undefined;
  districts: DistrictForForm[];
  isLoadingDistricts: boolean;
  errors: FormErrors;
  onUpdateRanking: (value: number | undefined) => void;
  onUpdateRating: (value: number | undefined) => void;
  onUpdateDiscountRate: (value: number | undefined) => void;
  onUpdateLatitude: (value: number | undefined) => void;
  onUpdateLongitude: (value: number | undefined) => void;
  onUpdateDistrictId: (value: string | undefined) => void;
  onUpdatePrices: (prices: PriceInfo | undefined) => void;
  recommendedRanking?: number;
  onUpdateRecommendedRanking?: (value: number | undefined) => void;
  approvalStatusType?: 'PENDING' | 'APPROVED' | 'REJECTED';
  onUpdateApprovalStatusType?: (value: 'PENDING' | 'APPROVED' | 'REJECTED') => void;
  exposureLevel?: 'Public' | 'Hidden';
  onUpdateExposureLevel?: (value: 'Public' | 'Hidden') => void;
}
