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
  // 어드민 사용자 정보 (실제로는 인증된 어드민 정보를 사용해야 함)
  const adminId = 'admin-user-id'; // 실제 어드민 ID
  const adminEmail = 'admin@example.com'; // 실제 어드민 이메일
  const adminName = createAdminDisplayName(adminEmail);

  const [messages, setMessages] = useState<AdminChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabase = createSupabaseClient();
  const roomId = createAdminRoomId(hospitalId, userId);
  const typingManager = useRef(new AdminTypingManager());

  // 채팅 히스토리 로드
  const loadChatHistory = useCallback(async () => {
    if (!userId || !hospitalId) {
      setIsLoadingHistory(false);
      return;
    }

    try {
      setIsLoadingHistory(true);
      setError(null);

      const historyMessages = await fetchAdminChatHistory(hospitalId, userId);
      const sortedMessages = sortAdminMessagesByTime(historyMessages);
      setMessages(sortedMessages);
    } catch (error) {
      console.error('❌ Failed to load admin chat history:', error);
      setError('채팅 히스토리를 불러오는데 실패했습니다.');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [hospitalId, userId]);

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
        userId: adminId, // 메시지 보낸 사람은 어드민
        userName: adminName, // 어드민 이름
        timestamp: new Date().toISOString(),
        type: 'ADMIN', // 어드민 메시지 (DB용)
        senderType: 'ADMIN', // DB 저장용
      };

      try {
        setError(null);
        const result = await sendAdminChatMessage(
          channelRef.current,
          hospitalId,
          userId, // 대화 상대방 userId
          adminMessage,
        );

        if (!result.success) {
          setError(result.error || '메시지 전송 실패');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(errorMessage);
        console.error('❌ Failed to send admin message:', error);
      }
    },
    [adminId, adminName, hospitalId, userId, roomId],
  );

  // 타이핑 상태 전송
  const sendTyping = useCallback(
    async (isTyping: boolean) => {
      if (!channelRef.current || !adminId) {
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

        // k-doc 형식을 admin 형식으로 변환
        const normalizedMessage: AdminChatMessage = {
          id: payload.id as string,
          content: payload.content as string,
          userId: payload.userId as string,
          userName: payload.userName as string,
          timestamp: payload.timestamp as string,
          type: payload.type === 'user' ? 'USER' : 'ADMIN',
          senderType: payload.type === 'user' ? 'USER' : 'ADMIN',
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

    // 액션
    sendMessage,
    sendTyping,
    refreshHistory: loadChatHistory,
    clearError: () => setError(null),

    // 메타데이터
    roomId,
    channelName: createAdminChannelName(roomId),
  };
}
