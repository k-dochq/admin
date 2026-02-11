'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type AdditionalInfoSectionProps } from './types';
import { ApprovalStatusField } from './ApprovalStatusField';
import { ExposureLevelField } from './ExposureLevelField';
import { RankingRatingDiscountRow } from './RankingRatingDiscountRow';
import { LocationFields } from './LocationFields';
import { PriceFields } from './PriceFields';
import { DistrictField } from './DistrictField';

export function AdditionalInfoSection(props: AdditionalInfoSectionProps) {
  const { errors } = props;

  return (
    <Card>
      <CardHeader>
        <CardTitle>기타 정보</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {props.approvalStatusType !== undefined && props.onUpdateApprovalStatusType && (
          <ApprovalStatusField
            value={props.approvalStatusType}
            onChange={props.onUpdateApprovalStatusType}
          />
        )}

        {props.exposureLevel !== undefined && props.onUpdateExposureLevel && (
          <ExposureLevelField
            value={props.exposureLevel}
            onChange={props.onUpdateExposureLevel}
          />
        )}

        <RankingRatingDiscountRow
          ranking={props.ranking}
          rating={props.rating}
          discountRate={props.discountRate}
          recommendedRanking={props.recommendedRanking}
          errors={errors}
          onUpdateRanking={props.onUpdateRanking}
          onUpdateRating={props.onUpdateRating}
          onUpdateDiscountRate={props.onUpdateDiscountRate}
          onUpdateRecommendedRanking={props.onUpdateRecommendedRanking}
        />

        <LocationFields
          latitude={props.latitude}
          longitude={props.longitude}
          errors={errors}
          onUpdateLatitude={props.onUpdateLatitude}
          onUpdateLongitude={props.onUpdateLongitude}
        />

        <PriceFields
          prices={props.prices}
          errors={errors}
          onUpdatePrices={props.onUpdatePrices}
        />

        <DistrictField
          districtId={props.districtId}
          districts={props.districts}
          isLoadingDistricts={props.isLoadingDistricts}
          errors={errors}
          onUpdateDistrictId={props.onUpdateDistrictId}
        />
      </CardContent>
    </Card>
  );
}
