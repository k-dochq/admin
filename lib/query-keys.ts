import { type GetDoctorsRequest } from '@/features/doctor-management/api/entities/types';
import { type GetReviewsRequest } from '@/features/review-management/api/entities/types';

export const queryKeys = {
  invitationCodes: ['invitation-codes'] as const,
  invitationCode: (id: string) => ['invitation-codes', id] as const,
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  dashboard: ['dashboard'] as const,
  analytics: ['analytics'] as const,
  hospitals: ['hospitals'] as const,
  hospital: (id: string) => ['hospitals', id] as const,
  hospitalImages: (hospitalId: string) => ['hospitals', hospitalId, 'images'] as const,
  doctors: ['doctors'] as const,
  doctorsList: (request: GetDoctorsRequest) => ['doctors', request] as const,
  doctor: (id: string) => ['doctors', id] as const,
  districts: ['districts'] as const,
  medicalSpecialties: ['medical-specialties'] as const,
  reviews: (request: GetReviewsRequest = {}) => ['reviews', request] as const,
  review: (id: string) => ['reviews', id] as const,
} as const;
