'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type {
  TaskCategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../api/entities/types';

interface CategoryManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: TaskCategory[];
  onCreate: (data: CreateCategoryRequest) => void;
  onUpdate: (data: UpdateCategoryRequest) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function CategoryManagement({
  open,
  onOpenChange,
  categories,
  onCreate,
  onUpdate,
  onDelete,
  isLoading,
}: CategoryManagementProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      onUpdate({
        id: editingId,
        ...formData,
      });
      setEditingId(null);
    } else {
      onCreate(formData);
    }

    setFormData({ name: '', description: '', color: '#3b82f6' });
  };

  const handleEdit = (category: TaskCategory) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#3b82f6',
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', color: '#3b82f6' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>카테고리 관리</DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* 생성/수정 폼 */}
          <form onSubmit={handleSubmit} className='space-y-4 rounded-lg border p-4'>
            <h3 className='font-semibold'>{editingId ? '카테고리 수정' : '카테고리 추가'}</h3>

            <div>
              <Label htmlFor='name'>카테고리명 *</Label>
              <Input
                id='name'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor='description'>설명</Label>
              <Input
                id='description'
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor='color'>색상</Label>
              <div className='flex gap-2'>
                <Input
                  id='color'
                  type='color'
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className='h-10 w-20'
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder='#3b82f6'
                />
              </div>
            </div>

            <div className='flex gap-2'>
              {editingId && (
                <Button type='button' variant='outline' onClick={handleCancel}>
                  취소
                </Button>
              )}
              <Button type='submit' disabled={isLoading}>
                {editingId ? '수정' : '추가'}
              </Button>
            </div>
          </form>

          {/* 카테고리 목록 */}
          <div className='space-y-2'>
            <h3 className='font-semibold'>카테고리 목록</h3>
            {categories.length === 0 ? (
              <p className='text-center text-sm text-gray-500'>카테고리가 없습니다.</p>
            ) : (
              <div className='space-y-2'>
                {categories.map((category) => (
                  <Card key={category.id}>
                    <CardContent className='flex items-center justify-between p-3'>
                      <div className='flex items-center gap-3'>
                        <div
                          className='h-6 w-6 rounded'
                          style={{ backgroundColor: category.color || '#9ca3af' }}
                        />
                        <div>
                          <div className='font-medium'>{category.name}</div>
                          {category.description && (
                            <div className='text-sm text-gray-500'>{category.description}</div>
                          )}
                        </div>
                      </div>
                      <div className='flex gap-1'>
                        <Button variant='ghost' size='sm' onClick={() => handleEdit(category)}>
                          <Pencil className='h-4 w-4' />
                        </Button>
                        <Button variant='ghost' size='sm' onClick={() => onDelete(category.id)}>
                          <Trash2 className='h-4 w-4 text-red-500' />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
