import { type GetDoctorsRequest } from '@/features/doctor-management/api/entities/types';
import { type GetReviewsRequest } from '@/features/review-management/api/entities/types';
import { type GetLiveReviewsRequest } from '@/features/live-review-management/api/entities/types';
import { type GetHospitalsRequest } from '@/features/hospital-management/api/entities/types';
import { type GetReservationsRequest } from '@/features/reservation-management/api/entities/types';
import { type GetUsersRequest } from '@/lib/types/user';
import {
  type GetYoutubeVideoCategoriesRequest,
  type GetYoutubeVideosRequest,
} from '@/features/youtube-video-management/api/entities/types';

export const queryKeys = {
  invitationCodes: ['invitation-codes'] as const,
  invitationCode: (id: string) => ['invitation-codes', id] as const,
  users: {
    all: ['users'] as const,
    list: (params?: GetUsersRequest) => ['users', 'list', params] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
    stats: () => ['users', 'stats'] as const,
  },
  dashboard: ['dashboard'] as const,
  analytics: ['analytics'] as const,
  hospitals: {
    all: ['hospitals'] as const,
    list: (params?: GetHospitalsRequest) => ['hospitals', 'list', params] as const,
    detail: (id: string) => ['hospitals', 'detail', id] as const,
    images: (hospitalId: string) => ['hospitals', hospitalId, 'images'] as const,
  },
  doctors: ['doctors'] as const,
  doctorsList: (request: GetDoctorsRequest) => ['doctors', request] as const,
  doctor: (id: string) => ['doctors', id] as const,
  districts: ['districts'] as const,
  medicalSpecialties: (isActive?: boolean) =>
    ['medical-specialties', isActive !== undefined ? { isActive } : undefined] as const,
  medicalSpecialty: (id: string) => ['medical-specialties', id] as const,
  reviews: (request: GetReviewsRequest = {}) => ['reviews', request] as const,
  review: (id: string) => ['reviews', id] as const,
  liveReviews: (request: GetLiveReviewsRequest = {}) => ['live-reviews', request] as const,
  liveReview: (id: string) => ['live-reviews', id] as const,
  reservations: {
    all: ['reservations'] as const,
    list: (params?: GetReservationsRequest) => ['reservations', 'list', params] as const,
    detail: (id: string) => ['reservations', 'detail', id] as const,
  },
  consultationMemos: (userId: string, hospitalId: string) =>
    ['consultationMemos', userId, hospitalId] as const,
  youtubeVideoCategories: (request?: GetYoutubeVideoCategoriesRequest) =>
    ['youtube-video-categories', request] as const,
  youtubeVideoCategory: (id: string) => ['youtube-video-categories', id] as const,
  youtubeVideos: (request?: GetYoutubeVideosRequest) => ['youtube-videos', request] as const,
  youtubeVideo: (id: string) => ['youtube-videos', id] as const,
  youtubeVideoThumbnails: (videoId: string) => ['youtube-videos', videoId, 'thumbnails'] as const,
  hospitalCategories: (isActive?: boolean) =>
    ['hospital-categories', isActive !== undefined ? { isActive } : undefined] as const,
  hospitalCategory: (id: string) => ['hospital-categories', id] as const,
  appStore: {
    versions: ['app-store', 'versions'] as const,
    versionData: (version: string) => ['app-store', 'version-data', version] as const,
  },
} as const;
