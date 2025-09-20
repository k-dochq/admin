import {
  User,
  UserRoleType,
  UserGenderType,
  UserLocale,
  UserStatusType,
  Prisma,
} from '@prisma/client';

// Re-export Prisma enums
export { UserRoleType, UserGenderType, UserLocale, UserStatusType };

// 사용자 조회 요청 타입
export interface GetUsersRequest {
  page?: number;
  limit?: number;
  search?: string;
  userStatusType?: UserStatusType;
  drRoleType?: UserRoleType;
  genderType?: UserGenderType;
  locale?: UserLocale;
  sortBy?: 'createdAt' | 'updatedAt' | 'last_sign_in_at' | 'name' | 'email';
  sortOrder?: 'asc' | 'desc';
}

// 사용자 조회 응답 타입
export interface GetUsersResponse {
  users: UserWithDetails[];
  total: number;
  page: number;
  limit: number;
}

// 상세 정보가 포함된 사용자 타입
export type UserWithDetails = User & {
  UserRole?: Array<{
    id: number;
    roleId: number;
    createdAt: Date;
    AdminRole: {
      id: number;
      name: string;
      description: string | null;
      adminGrade: string;
      level: number;
    };
  }>;
  invitationCode?: {
    id: string;
    code: string;
    kind: string;
    expiresAt: Date | null;
    usedAt: Date | null;
  } | null;
  _count?: {
    reviews: number;
    comments: number;
    HospitalLike: number;
    ReviewLike: number;
    consultationMessages: number;
  };
};

// 사용자 생성 요청 타입
export interface CreateUserRequest {
  displayName?: string;
  name?: string;
  nickName?: string;
  email?: string;
  phoneNumber?: string;
  drRoleType?: UserRoleType;
  genderType?: UserGenderType;
  locale?: UserLocale;
  age?: number;
  userStatusType?: UserStatusType;
  advertPush?: boolean;
  communityAlarm?: boolean;
  postAlarm?: boolean;
  collectPersonalInfo?: boolean;
  profileImgUrl?: string;
  invitationCodeId?: string;
}

// 사용자 수정 요청 타입
export interface UpdateUserRequest {
  displayName?: string;
  name?: string;
  nickName?: string;
  email?: string;
  phoneNumber?: string;
  drRoleType?: UserRoleType;
  genderType?: UserGenderType;
  locale?: UserLocale;
  age?: number;
  userStatusType?: UserStatusType;
  advertPush?: boolean;
  communityAlarm?: boolean;
  postAlarm?: boolean;
  collectPersonalInfo?: boolean;
  profileImgUrl?: string;
}

// 사용자 삭제 요청 타입
export interface DeleteUserRequest {
  id: string;
}

// 사용자 통계 타입
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  deletedUsers: number;
  newUsersThisMonth: number;
  newUsersThisWeek: number;
}

// 사용자 역할 타입별 라벨
export const USER_ROLE_TYPE_LABELS: Record<UserRoleType, string> = {
  [UserRoleType.PATIENT]: '환자',
  [UserRoleType.DOCTOR]: '의사',
  [UserRoleType.ADMIN]: '관리자',
  [UserRoleType.USER]: '사용자',
};

// 사용자 성별 타입별 라벨
export const USER_GENDER_TYPE_LABELS: Record<UserGenderType, string> = {
  [UserGenderType.MALE]: '남성',
  [UserGenderType.FEMALE]: '여성',
  [UserGenderType.OTHER]: '기타',
};

// 사용자 로케일 타입별 라벨
export const USER_LOCALE_LABELS: Record<UserLocale, string> = {
  [UserLocale.ko_KR]: '한국어',
  [UserLocale.en_US]: 'English',
  [UserLocale.th_TH]: 'ไทย',
};

// 사용자 상태 타입별 라벨
export const USER_STATUS_TYPE_LABELS: Record<UserStatusType, string> = {
  [UserStatusType.ACTIVE]: '활성',
  [UserStatusType.INACTIVE]: '비활성',
  [UserStatusType.SUSPENDED]: '정지',
  [UserStatusType.DELETED]: '삭제됨',
};

// 사용자 상태 타입별 색상
export const USER_STATUS_TYPE_COLORS: Record<UserStatusType, string> = {
  [UserStatusType.ACTIVE]: 'text-green-600 bg-green-100',
  [UserStatusType.INACTIVE]: 'text-gray-600 bg-gray-100',
  [UserStatusType.SUSPENDED]: 'text-red-600 bg-red-100',
  [UserStatusType.DELETED]: 'text-gray-400 bg-gray-50',
};
