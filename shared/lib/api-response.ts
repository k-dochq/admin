import { NextResponse } from 'next/server';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  requestId?: string;
}

export function formatSuccessResponse<T>(
  data: T,
  message?: string,
  status = 200,
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status },
  );
}

export function formatErrorResponse(
  error: string,
  requestId?: string,
  status = 400,
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      requestId,
    },
    { status },
  );
}
