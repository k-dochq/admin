'use client';

import React, { useEffect } from 'react';
import { Edit2, Trash2 } from 'lucide-react';

interface MessageContextMenuProps {
  x: number;
  y: number;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function MessageContextMenu({ x, y, onEdit, onDelete, onClose }: MessageContextMenuProps) {
  useEffect(() => {
    const handleClick = () => onClose();
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className='fixed z-50 min-w-[160px] rounded-md border bg-white shadow-lg'
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className='py-1'>
        <button
          onClick={onEdit}
          className='flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100'
        >
          <Edit2 className='h-4 w-4' />
          <span>수정</span>
        </button>
        <button
          onClick={onDelete}
          className='flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100'
        >
          <Trash2 className='h-4 w-4' />
          <span>삭제</span>
        </button>
      </div>
    </div>
  );
}
