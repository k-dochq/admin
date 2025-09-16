import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  type ChatRoom,
  type ConsultationMessageWithRelations,
  parseLocalizedText,
} from '@/lib/types/consultation';

export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    // Admin에서는 모든 상담 메시지를 조회 (사용자 인증 체크 없음)
    const messages: ConsultationMessageWithRelations[] = await prisma.consultationMessage.findMany({
      include: {
        User: {
          select: {
            id: true,
            displayName: true,
            name: true,
          },
        },
        Hospital: {
          include: {
            district: true,
            hospitalImages: {
              where: {
                imageType: 'THUMBNAIL',
                isActive: true,
              },
              orderBy: {
                order: 'asc',
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 병원별, 사용자별로 그룹화하고 마지막 메시지 정보 추출
    const chatRoomMap = new Map<string, ChatRoom>();

    messages.forEach((message) => {
      const chatRoomKey = `${message.hospitalId}-${message.userId}`;

      if (!chatRoomMap.has(chatRoomKey)) {
        const hospital = message.Hospital;
        const district = hospital.district;
        const mainImage = hospital.hospitalImages[0];
        const user = message.User;

        chatRoomMap.set(chatRoomKey, {
          hospitalId: message.hospitalId,
          userId: message.userId,
          hospitalName: parseLocalizedText(hospital.name),
          hospitalThumbnailUrl: mainImage?.imageUrl,
          districtName: district ? parseLocalizedText(district.name) : undefined,
          lastMessageContent: message.content,
          lastMessageDate: message.createdAt.toISOString(),
          lastMessageSenderType: message.senderType,
          unreadCount: 0, // TODO: 읽지 않은 메시지 수 계산 로직 추가
          userDisplayName: user.displayName || user.name || '익명 사용자',
        });
      }
    });

    const chatRoomsList = Array.from(chatRoomMap.values());

    return NextResponse.json({
      success: true,
      data: chatRoomsList,
    });
  } catch (error) {
    console.error('Error in admin chat rooms API:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
