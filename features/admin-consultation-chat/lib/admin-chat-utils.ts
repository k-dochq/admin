import { type AdminChatMessage, type AdminMessageValidationResult } from '@/lib/types/admin-chat';

/**
 * 채팅방 ID 생성 (k-doc과 동일한 방식)
 */
export function createAdminRoomId(hospitalId: string, userId: string): string {
  return `${hospitalId}-${userId}`;
}

/**
 * 채널명 생성 (k-doc과 동일한 형식 사용)
 */
export function createAdminChannelName(roomId: string): string {
  return `chat-${roomId}`;
}

/**
 * 메시지를 시간순으로 정렬
 */
export function sortAdminMessagesByTime(messages: AdminChatMessage[]): AdminChatMessage[] {
  return [...messages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
}

/**
 * 중복 메시지 제거
 */
export function deduplicateAdminMessages(messages: AdminChatMessage[]): AdminChatMessage[] {
  const seen = new Set<string>();
  return messages.filter((message) => {
    if (seen.has(message.id)) {
      return false;
    }
    seen.add(message.id);
    return true;
  });
}

/**
 * 메시지 검증
 */
export function validateAdminMessage(content: string): AdminMessageValidationResult {
  const trimmed = content.trim();

  if (!trimmed) {
    return { isValid: false, error: '메시지를 입력해주세요.' };
  }

  if (trimmed.length > 1000) {
    return { isValid: false, error: '메시지는 1000자 이하로 입력해주세요.' };
  }

  return { isValid: true };
}

/**
 * Admin 표시명 생성
 */
export function createAdminDisplayName(adminEmail?: string): string {
  if (!adminEmail) return '관리자';

  // 이메일에서 @ 앞부분 추출
  const username = adminEmail.split('@')[0];
  return `관리자 (${username})`;
}

/**
 * 사용자 표시명 생성
 */
export function createUserDisplayName(user: {
  displayName?: string | null;
  name?: string | null;
}): string {
  return user.displayName || user.name || '사용자';
}

/**
 * 타이핑 사용자 관리 클래스
 */
export class AdminTypingManager {
  private typingUsers = new Map<string, NodeJS.Timeout>();

  addTypingUser(userName: string): void {
    // 기존 타이머가 있다면 제거
    const existingTimer = this.typingUsers.get(userName);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // 3초 후 자동으로 타이핑 상태 제거
    const timer = setTimeout(() => {
      this.typingUsers.delete(userName);
    }, 3000);

    this.typingUsers.set(userName, timer);
  }

  removeTypingUser(userName: string): void {
    const timer = this.typingUsers.get(userName);
    if (timer) {
      clearTimeout(timer);
      this.typingUsers.delete(userName);
    }
  }

  getTypingUsers(): string[] {
    return Array.from(this.typingUsers.keys());
  }

  clear(): void {
    this.typingUsers.forEach((timer) => clearTimeout(timer));
    this.typingUsers.clear();
  }
}
