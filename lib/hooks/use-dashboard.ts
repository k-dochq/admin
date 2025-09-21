'use client';

import { useQuery } from '@tanstack/react-query';
import type {
  DashboardStats,
  UserStatusStats,
  MonthlyUserStats,
  MonthlyReviewStats,
  SpecialtyReviewStats,
  RecentActivity,
} from '@/lib/queries/dashboard';

// 대시보드 메인 통계
export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5분
  });
}

// 사용자 상태별 통계
export function useUserStatusStats() {
  return useQuery<UserStatusStats[]>({
    queryKey: ['dashboard', 'user-status'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/user-status');
      if (!response.ok) {
        throw new Error('Failed to fetch user status stats');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5분
  });
}

// 월별 가입자 통계
export function useMonthlyUserStats() {
  return useQuery<MonthlyUserStats[]>({
    queryKey: ['dashboard', 'monthly-users'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/monthly-users');
      if (!response.ok) {
        throw new Error('Failed to fetch monthly user stats');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5분
  });
}

// 월별 리뷰 통계
export function useMonthlyReviewStats() {
  return useQuery<MonthlyReviewStats[]>({
    queryKey: ['dashboard', 'monthly-reviews'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/monthly-reviews');
      if (!response.ok) {
        throw new Error('Failed to fetch monthly review stats');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5분
  });
}

// 전문과별 리뷰 통계
export function useSpecialtyReviewStats() {
  return useQuery<SpecialtyReviewStats[]>({
    queryKey: ['dashboard', 'specialty-reviews'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/specialty-reviews');
      if (!response.ok) {
        throw new Error('Failed to fetch specialty review stats');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5분
  });
}

// 최근 활동
export function useRecentActivities() {
  return useQuery<RecentActivity[]>({
    queryKey: ['dashboard', 'recent-activities'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/recent-activities');
      if (!response.ok) {
        throw new Error('Failed to fetch recent activities');
      }
      return response.json();
    },
    staleTime: 1 * 60 * 1000, // 1분 (더 자주 업데이트)
  });
}
