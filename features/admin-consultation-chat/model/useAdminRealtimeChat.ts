'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createSupabaseClient } from '@/shared/lib/supabase/client';
import { type RealtimeChannel } from '@supabase/supabase-js';
import { type AdminChatMessage } from '@/lib/types/admin-chat';
import {
  fetchAdminChatHistory,
  sendAdminChatMessage,
  sendAdminTypingStatus,
} from '../api/admin-chat-api-client';
import {
  createAdminRoomId,
  sortAdminMessagesByTime,
  deduplicateAdminMessages,
  validateAdminMessage,
  createAdminChannelName,
  createAdminDisplayName,
  AdminTypingManager,
} from '../lib/admin-chat-utils';
// Admin 사용자 정보는 props로 받거나 하드코딩
// import { useAuth } from '@/features/auth/model/useAuth';

interface UseAdminRealtimeChatProps {
  hospitalId: string;
  userId: string;
}

export function useAdminRealtimeChat({ hospitalId, userId }: UseAdminRealtimeChatProps) {
  const supabase = createSupabaseClient();
  const [adminId, setAdminId] = useState<string | null>(null);
  const [adminName, setAdminName] = useState<string | null>(null);

  const [messages, setMessages] = useState<AdminChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const roomId = createAdminRoomId(hospitalId, userId);
  const typingManager = useRef(new AdminTypingManager());

  // Supabase 세션에서 관리자 정보 가져오기
  useEffect(() => {
    const getAdminInfo = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setAdminId(session.user.id);
        const name = session.user.user_metadata?.name || session.user.email || null;
        setAdminName(name);
      }
    };
    getAdminInfo();
  }, [supabase]);

  // 채팅 히스토리 로드
  const loadChatHistory = useCallback(async () => {
    if (!userId || !hospitalId) {
      setIsLoadingHistory(false);
      return;
    }

    try {
      setIsLoadingHistory(true);
      setError(null);

      const {
        messages: historyMessages,
        hasMore,
        nextCursor,
      } = await fetchAdminChatHistory(hospitalId, userId, {
        limit: 50,
      });
      const sortedMessages = sortAdminMessagesByTime(historyMessages);
      setMessages(sortedMessages);
      setHasMore(hasMore);
      setNextCursor(nextCursor);
    } catch (error) {
      console.error('❌ Failed to load admin chat history:', error);
      setError('채팅 히스토리를 불러오는데 실패했습니다.');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [hospitalId, userId]);

  // 이전 메시지 더 불러오기
  const loadMoreHistory = useCallback(async () => {
    if (!userId || !hospitalId) return;
    if (!hasMore || !nextCursor) return;
    try {
      setError(null);
      const {
        messages: page,
        hasMore: more,
        nextCursor: cursor,
      } = await fetchAdminChatHistory(hospitalId, userId, {
        limit: 50,
        cursor: nextCursor,
      });
      setMessages((prev) => sortAdminMessagesByTime([...page, ...prev]));
      setHasMore(more);
      setNextCursor(cursor);
    } catch (error) {
      console.error('❌ Failed to load more admin chat history:', error);
      setError('이전 메시지를 불러오는데 실패했습니다.');
    }
  }, [hospitalId, userId, hasMore, nextCursor]);

  // 메시지 전송
  const sendMessage = useCallback(
    async (content: string) => {
      console.log('🚀 Admin sendMessage called:', {
        content,
        roomId,
        adminId,
        adminName,
        hospitalId,
        userId,
      });

      if (!channelRef.current || !adminId) {
        console.log('❌ Admin sendMessage failed: missing requirements', {
          hasChannel: !!channelRef.current,
          hasAdminId: !!adminId,
        });
        return;
      }

      // 메시지 검증
      const validation = validateAdminMessage(content);
      if (!validation.isValid) {
        setError(validation.error || '메시지 검증 실패');
        return;
      }

      // 어드민 메시지 객체 생성
      const adminMessage: AdminChatMessage = {
        id: crypto.randomUUID(),
        content: content.trim(),
        userId: adminId || 'admin', // 메시지 보낸 사람은 어드민
        userName: adminName || '관리자', // 어드민 이름
        timestamp: new Date().toISOString(),
        type: 'ADMIN', // 어드민 메시지 (DB용)
        senderType: 'ADMIN', // DB 저장용
        adminName: adminName || undefined, // 관리자 이름 또는 이메일
      };

      try {
        setError(null);

        // 즉시 UI에 메시지 추가 (낙관적 업데이트)
        setMessages((prev) => {
          const combined = [...prev, adminMessage];
          const deduplicated = deduplicateAdminMessages(combined);
          return sortAdminMessagesByTime(deduplicated);
        });

        if (!adminId) {
          setError('관리자 정보를 불러올 수 없습니다.');
          setMessages((prev) => prev.filter((msg) => msg.id !== adminMessage.id));
          return;
        }

        const result = await sendAdminChatMessage(
          channelRef.current,
          hospitalId,
          userId, // 대화 상대방 userId
          adminMessage,
        );

        if (!result.success) {
          setError(result.error || '메시지 전송 실패');
          // 실패 시 메시지 제거 (rollback)
          setMessages((prev) => prev.filter((msg) => msg.id !== adminMessage.id));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(errorMessage);
        console.error('❌ Failed to send admin message:', error);
        // 에러 시 메시지 제거 (rollback)
        setMessages((prev) => prev.filter((msg) => msg.id !== adminMessage.id));
      }
    },
    [adminId, adminName, hospitalId, userId, roomId],
  );

  // 타이핑 상태 전송
  const sendTyping = useCallback(
    async (isTyping: boolean) => {
      if (!channelRef.current || !adminId || !adminName) {
        return;
      }

      try {
        const result = await sendAdminTypingStatus(channelRef.current, adminName, isTyping);
        if (!result.success) {
          console.error('❌ Failed to send admin typing status:', result.error);
        }
      } catch (error) {
        console.error('❌ Error sending admin typing status:', error);
      }
    },
    [adminId, adminName],
  );

  // 메시지 상태 업데이트 (중복 제거 및 정렬)
  const updateMessages = useCallback((newMessages: AdminChatMessage[]) => {
    setMessages((prev) => {
      const combined = [...prev, ...newMessages];
      const deduplicated = deduplicateAdminMessages(combined);
      return sortAdminMessagesByTime(deduplicated);
    });
  }, []);

  // 타이핑 사용자 상태 업데이트
  const updateTypingUsers = useCallback(() => {
    setTypingUsers(typingManager.current.getTypingUsers());
  }, []);

  useEffect(() => {
    if (!roomId || !userId || !hospitalId) {
      console.log('❌ Admin useEffect: missing required params', { roomId, userId, hospitalId });
      return;
    }

    console.log('🔌 Setting up Admin Realtime channel:', { roomId, userId, adminName, hospitalId });

    // typingManager를 effect 시작 시점에 캡처
    const currentTypingManager = typingManager.current;

    // 1. 먼저 채팅 히스토리 로드
    loadChatHistory();

    // 2. 채널 생성 및 구독
    const channelName = createAdminChannelName(roomId);
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: {
          self: true, // 자신이 보낸 메시지도 수신
        },
      },
    });

    console.log('📡 Admin Channel created:', channelName);
    channelRef.current = channel;

    // 메시지 수신 (k-doc과 admin 형식 모두 처리)
    channel.on(
      'broadcast',
      { event: 'message' },
      ({ payload }: { payload: Record<string, unknown> }) => {
        console.log('📥 Admin Message received via broadcast:', payload);

        // 자신이 보낸 메시지는 무시 (중복 방지)
        if (payload.userId === adminId) {
          console.log('🚫 Ignoring own message to prevent duplication');
          return;
        }

        // k-doc 형식을 admin 형식으로 변환
        const normalizedMessage: AdminChatMessage = {
          id: payload.id as string,
          content: payload.content as string,
          userId: payload.userId as string,
          userName: payload.userName as string,
          timestamp: payload.timestamp as string,
          type: payload.type === 'user' ? 'USER' : 'ADMIN',
          senderType: payload.type === 'user' ? 'USER' : 'ADMIN',
          adminName: payload.adminName as string | undefined,
        };

        updateMessages([normalizedMessage]);
      },
    );

    // 타이핑 상태 수신
    channel.on(
      'broadcast',
      { event: 'typing' },
      ({ payload }: { payload: Record<string, unknown> }) => {
        if (payload.userId === adminId) return; // 자신의 타이핑은 무시

        if (payload.isTyping) {
          currentTypingManager.addTypingUser(payload.userName as string);
        } else {
          currentTypingManager.removeTypingUser(payload.userName as string);
        }
        updateTypingUsers();
      },
    );

    // 메시지 수정 이벤트 수신
    channel.on(
      'broadcast',
      { event: 'message:updated' },
      ({ payload }: { payload: Record<string, unknown> }) => {
        console.log('📝 Message updated:', payload);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === payload.messageId ? { ...msg, content: payload.content as string } : msg,
          ),
        );
      },
    );

    // 메시지 삭제 이벤트 수신
    channel.on(
      'broadcast',
      { event: 'message:deleted' },
      ({ payload }: { payload: Record<string, unknown> }) => {
        console.log('🗑️ Message deleted:', payload);
        setMessages((prev) => prev.filter((msg) => msg.id !== payload.messageId));
      },
    );

    // 메시지 읽음 상태 수신
    channel.on(
      'broadcast',
      { event: 'message:read' },
      ({ payload }: { payload: Record<string, unknown> }) => {
        console.log('📖 Message read:', payload);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === payload.messageId
              ? { ...msg, isRead: true, readAt: payload.readAt as string }
              : msg,
          ),
        );
      },
    );

    // 채널 구독
    channel.subscribe((status: string) => {
      console.log('🔔 Admin Channel subscription status:', status);
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        setError(null);
        console.log(`✅ Admin Connected to chat room: ${roomId}`);
      } else if (status === 'CHANNEL_ERROR') {
        setIsConnected(false);
        setError('채팅방 연결에 실패했습니다.');
        console.error(`❌ Admin Failed to connect to chat room: ${roomId}`);
      } else if (status === 'TIMED_OUT') {
        setIsConnected(false);
        setError('연결 시간이 초과되었습니다.');
        console.error(`⏰ Admin Connection timed out for chat room: ${roomId}`);
      } else if (status === 'CLOSED') {
        setIsConnected(false);
        console.log(`🔒 Admin Connection closed for chat room: ${roomId}`);
      }
    });

    // 정리
    return () => {
      console.log('🧹 Cleaning up admin channel:', channelName);
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      setIsConnected(false);
      currentTypingManager.clear();
      setTypingUsers([]);
    };
  }, [
    roomId,
    userId,
    adminId,
    adminName,
    hospitalId,
    supabase,
    loadChatHistory,
    updateMessages,
    updateTypingUsers,
  ]);

  return {
    // 상태
    messages,
    isConnected,
    typingUsers,
    isLoadingHistory,
    error,
    hasMore,
    nextCursor,

    // 액션
    sendMessage,
    sendTyping,
    refreshHistory: loadChatHistory,
    loadMoreHistory,
    clearError: () => setError(null),

    // 메타데이터
    roomId,
    channelName: createAdminChannelName(roomId),
    channel: channelRef.current, // 채널 참조 추가
  };
}
