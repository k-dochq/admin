import { type BasicHospitalImageType, type HospitalImage } from '../../api/entities/types';

export interface FileWithPreview extends File {
  preview: string;
  id: string;
  error?: string;
}

export interface FileUploadDropzoneProps {
  imageType: BasicHospitalImageType;
  isDragOver: boolean;
  canUpload: boolean;
  limit: number;
  onDragOver: (event: React.DragEvent) => void;
  onDragLeave: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFileInputClick: () => void;
}

export interface FilePreviewCardProps {
  file: FileWithPreview;
  imageType: BasicHospitalImageType;
  onRemove: (fileId: string) => void;
}

export interface SelectedFilesListProps {
  files: FileWithPreview[];
  imageType: BasicHospitalImageType;
  validFilesCount: number;
  isUploading: boolean;
  onRemove: (fileId: string) => void;
  onUpload: () => void;
}

export interface ImageCardProps {
  image: HospitalImage;
  imageTypeLabel: string;
  isDeleting: boolean;
  onDelete: (imageId: string) => void;
}

export interface ExistingImagesListProps {
  images: HospitalImage[];
  imageTypeLabel: string;
  isDeleting: boolean;
  onDelete: (imageId: string) => void;
}

export interface ImageUploadTabContentProps {
  imageType: BasicHospitalImageType;
  existingImages: HospitalImage[];
  selectedFiles: FileWithPreview[];
  limit: number;
  isDragOver: boolean;
  isUploading: boolean;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDragLeave: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
  onFileInputClick: () => void;
  onRemoveSelectedFile: (fileId: string) => void;
  onUpload: () => void;
  onDeleteImage: (imageId: string) => void;
  isDeleting: boolean;
}
