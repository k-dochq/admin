/**
 * 시스템 생성 사용자를 위한 이메일 생성 함수
 * @example.com 도메인을 사용하며, 닉네임 생성 로직을 재활용합니다.
 *
 * @returns 생성된 이메일 주소 (예: "SwiftFox_2f@example.com")
 */
export async function generateSystemEmail(): Promise<string> {
  const response = await fetch('/api/admin/users/generate-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('이메일 생성에 실패했습니다.');
  }

  const data = await response.json();
  return data.email;
}
