import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DoctorImage, DoctorImageType } from '@/lib/types/doctor';

// 의사 이미지 목록 조회
export function useDoctorImages(doctorId: string) {
  return useQuery({
    queryKey: ['doctor-images', doctorId],
    queryFn: async (): Promise<DoctorImage[]> => {
      const response = await fetch(`/api/admin/doctors/${doctorId}/images`);
      if (!response.ok) {
        throw new Error('Failed to fetch doctor images');
      }
      return response.json();
    },
    enabled: !!doctorId,
  });
}

// 의사 이미지 삭제
export function useDeleteDoctorImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageId: string) => {
      const response = await fetch(`/api/admin/doctors/images/${imageId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete doctor image');
      }
      return response.json();
    },
    onSuccess: (_, imageId) => {
      // 모든 의사 이미지 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['doctor-images'] });
    },
  });
}

// 의사 이미지 생성 (업로드용)
export function useCreateDoctorImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      doctorId,
      imageType,
      imageUrl,
      path,
      alt,
      order,
    }: {
      doctorId: string;
      imageType: DoctorImageType;
      imageUrl: string;
      path: string;
      alt?: string;
      order?: number;
    }) => {
      const response = await fetch(`/api/admin/doctors/${doctorId}/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageType,
          imageUrl,
          path,
          alt,
          order,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to create doctor image');
      }
      return response.json();
    },
    onSuccess: (_, { doctorId }) => {
      // 해당 의사의 이미지 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['doctor-images', doctorId] });
    },
  });
}
