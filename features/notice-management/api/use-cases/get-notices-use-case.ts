import {
  type GetNoticesRequest,
  type GetNoticesResponse,
  type NoticeWithFiles,
  type CreateNoticeRequest,
  type UpdateNoticeRequest,
  type DeleteNoticeRequest,
  type UploadNoticeFileRequest,
  type DeleteNoticeFileRequest,
  type NoticeFile,
} from '../entities';
import { NoticeRepository } from '../infrastructure';

export interface IGetNoticesUseCase {
  execute(request: GetNoticesRequest): Promise<GetNoticesResponse>;
}

export class GetNoticesUseCase implements IGetNoticesUseCase {
  constructor(private readonly noticeRepository: NoticeRepository) {}

  async execute(request: GetNoticesRequest): Promise<GetNoticesResponse> {
    return this.noticeRepository.getNotices(request);
  }
}

export interface IGetNoticeByIdUseCase {
  execute(id: string): Promise<NoticeWithFiles | null>;
}

export class GetNoticeByIdUseCase implements IGetNoticeByIdUseCase {
  constructor(private readonly noticeRepository: NoticeRepository) {}

  async execute(id: string): Promise<NoticeWithFiles | null> {
    return this.noticeRepository.getNoticeById(id);
  }
}

export interface ICreateNoticeUseCase {
  execute(request: CreateNoticeRequest): Promise<void>;
}

export class CreateNoticeUseCase implements ICreateNoticeUseCase {
  constructor(private readonly noticeRepository: NoticeRepository) {}

  async execute(request: CreateNoticeRequest): Promise<void> {
    await this.noticeRepository.createNotice(request);
  }
}

export interface IUpdateNoticeUseCase {
  execute(request: UpdateNoticeRequest): Promise<void>;
}

export class UpdateNoticeUseCase implements IUpdateNoticeUseCase {
  constructor(private readonly noticeRepository: NoticeRepository) {}

  async execute(request: UpdateNoticeRequest): Promise<void> {
    await this.noticeRepository.updateNotice(request);
  }
}

export interface IDeleteNoticeUseCase {
  execute(request: DeleteNoticeRequest): Promise<void>;
}

export class DeleteNoticeUseCase implements IDeleteNoticeUseCase {
  constructor(private readonly noticeRepository: NoticeRepository) {}

  async execute(request: DeleteNoticeRequest): Promise<void> {
    await this.noticeRepository.deleteNotice(request);
  }
}

export interface IUploadNoticeFileUseCase {
  execute(request: UploadNoticeFileRequest): Promise<NoticeFile>;
}

export class UploadNoticeFileUseCase implements IUploadNoticeFileUseCase {
  constructor(private readonly noticeRepository: NoticeRepository) {}

  async execute(request: UploadNoticeFileRequest): Promise<NoticeFile> {
    return this.noticeRepository.uploadNoticeFile(request);
  }
}

export interface IDeleteNoticeFileUseCase {
  execute(request: DeleteNoticeFileRequest): Promise<void>;
}

export class DeleteNoticeFileUseCase implements IDeleteNoticeFileUseCase {
  constructor(private readonly noticeRepository: NoticeRepository) {}

  async execute(request: DeleteNoticeFileRequest): Promise<void> {
    await this.noticeRepository.deleteNoticeFile(request);
  }
}
