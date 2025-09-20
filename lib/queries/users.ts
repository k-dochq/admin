import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  GetUsersRequest,
  GetUsersResponse,
  CreateUserRequest,
  UpdateUserRequest,
  DeleteUserRequest,
  UserStats,
  UserWithDetails,
} from '@/lib/types/user';

// 사용자 목록 조회
export function useUsers(request: GetUsersRequest) {
  return useQuery({
    queryKey: queryKeys.users.list(request),
    queryFn: async (): Promise<GetUsersResponse> => {
      const params = new URLSearchParams();

      if (request.page) params.append('page', request.page.toString());
      if (request.limit) params.append('limit', request.limit.toString());
      if (request.search) params.append('search', request.search);
      if (request.userStatusType) params.append('userStatusType', request.userStatusType);
      if (request.drRoleType) params.append('drRoleType', request.drRoleType);
      if (request.genderType) params.append('genderType', request.genderType);
      if (request.locale) params.append('locale', request.locale);
      if (request.sortBy) params.append('sortBy', request.sortBy);
      if (request.sortOrder) params.append('sortOrder', request.sortOrder);

      const response = await fetch(`/api/admin/users?${params.toString()}`);

      if (!response.ok) {
        throw new Error('사용자 목록을 불러오는데 실패했습니다.');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    placeholderData: (previousData) => previousData, // 이전 데이터를 placeholder로 유지
  });
}

// 사용자 상세 조회
export function useUser(userId: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: async (): Promise<UserWithDetails> => {
      const response = await fetch(`/api/admin/users/${userId}`);

      if (!response.ok) {
        throw new Error('사용자 정보를 불러오는데 실패했습니다.');
      }

      return response.json();
    },
    enabled: !!userId,
  });
}

// 사용자 통계 조회
export function useUserStats() {
  return useQuery({
    queryKey: queryKeys.users.stats(),
    queryFn: async (): Promise<UserStats> => {
      const response = await fetch('/api/admin/users/stats');

      if (!response.ok) {
        throw new Error('사용자 통계를 불러오는데 실패했습니다.');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5분
  });
}

// 사용자 생성
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserRequest): Promise<UserWithDetails> => {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '사용자 생성에 실패했습니다.');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // 모든 사용자 관련 쿼리 무효화 (부분 매칭으로 모든 사용자 목록 쿼리 포함)
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey[0] === 'users';
        },
      });

      console.log('사용자 생성 성공:', data.id);
    },
    onError: (error: Error) => {
      console.error('사용자 생성 실패:', error.message);
    },
  });
}

// 사용자 수정
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateUserRequest;
    }): Promise<UserWithDetails> => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '사용자 수정에 실패했습니다.');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // 모든 사용자 관련 쿼리 무효화 (부분 매칭으로 모든 사용자 목록 쿼리 포함)
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey[0] === 'users';
        },
      });

      // 수정된 사용자의 상세 정보 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.id),
      });

      console.log('사용자 수정 성공:', data.id);
    },
    onError: (error: Error) => {
      console.error('사용자 수정 실패:', error.message);
    },
  });
}

// 사용자 삭제
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DeleteUserRequest): Promise<void> => {
      const response = await fetch(`/api/admin/users/${data.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '사용자 삭제에 실패했습니다.');
      }
    },
    onSuccess: (data, variables) => {
      // 모든 사용자 관련 쿼리 무효화 (부분 매칭으로 모든 사용자 목록 쿼리 포함)
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey[0] === 'users';
        },
      });

      // 삭제된 사용자의 상세 정보 쿼리 제거
      queryClient.removeQueries({
        queryKey: queryKeys.users.detail(variables.id),
      });

      console.log('사용자 삭제 성공:', variables.id);
    },
    onError: (error: Error) => {
      console.error('사용자 삭제 실패:', error.message);
    },
  });
}

// 사용자 상태 일괄 변경
export function useBulkUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userIds,
      userStatusType,
    }: {
      userIds: string[];
      userStatusType: string;
    }): Promise<void> => {
      const response = await fetch('/api/admin/users/bulk-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds, userStatusType }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '사용자 상태 변경에 실패했습니다.');
      }
    },
    onSuccess: (data, variables) => {
      // 모든 사용자 관련 쿼리 무효화 (부분 매칭으로 모든 사용자 목록 쿼리 포함)
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey[0] === 'users';
        },
      });

      console.log('사용자 상태 일괄 변경 성공:', variables.userIds.length, '명');
    },
    onError: (error: Error) => {
      console.error('사용자 상태 일괄 변경 실패:', error.message);
    },
  });
}
