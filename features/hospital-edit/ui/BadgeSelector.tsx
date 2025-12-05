'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { type FormErrors } from '../api/entities/types';

interface BadgeSelectorProps {
  badges: string[] | undefined;
  onChange: (badges: string[]) => void;
  errors?: FormErrors;
}

const DEFAULT_BADGES = ['HOT', 'BEST'];

export function BadgeSelector({ badges = [], onChange, errors }: BadgeSelectorProps) {
  const [customBadgeInput, setCustomBadgeInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleDefaultBadgeToggle = (badge: string, checked: boolean) => {
    const currentBadges = badges || [];

    if (checked) {
      // 추가
      if (!currentBadges.includes(badge)) {
        onChange([...currentBadges, badge]);
      }
    } else {
      // 제거
      onChange(currentBadges.filter((b) => b !== badge));
    }
  };

  const handleAddCustomBadge = () => {
    const trimmed = customBadgeInput.trim();
    if (trimmed && !badges.includes(trimmed)) {
      onChange([...badges, trimmed]);
      setCustomBadgeInput('');
      setShowCustomInput(false);
    }
  };

  const handleRemoveBadge = (badgeToRemove: string) => {
    onChange(badges.filter((b) => b !== badgeToRemove));
  };

  const handleCustomInputToggle = (checked: boolean) => {
    setShowCustomInput(checked);
    if (!checked) {
      setCustomBadgeInput('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>뱃지</CardTitle>
        <p className='text-muted-foreground text-sm'>
          병원에 표시할 뱃지를 선택하거나 직접 입력하세요.
        </p>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* 기본 뱃지 옵션 */}
        <div className='space-y-2'>
          <Label>기본 뱃지</Label>
          <div className='flex flex-wrap gap-4'>
            {DEFAULT_BADGES.map((badge) => {
              const isChecked = badges.includes(badge);

              return (
                <div key={badge} className='flex items-center space-x-2'>
                  <Checkbox
                    id={`badge-${badge}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => handleDefaultBadgeToggle(badge, checked === true)}
                  />
                  <Label htmlFor={`badge-${badge}`} className='cursor-pointer text-sm font-normal'>
                    {badge}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>

        {/* 직접 입력 옵션 */}
        <div className='space-y-2'>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='badge-custom'
              checked={showCustomInput}
              onCheckedChange={(checked) => handleCustomInputToggle(checked === true)}
            />
            <Label htmlFor='badge-custom' className='cursor-pointer text-sm font-normal'>
              직접 입력
            </Label>
          </div>

          {showCustomInput && (
            <div className='flex gap-2'>
              <Input
                placeholder='뱃지 이름 입력'
                value={customBadgeInput}
                onChange={(e) => setCustomBadgeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomBadge();
                  }
                }}
                className='max-w-xs'
              />
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleAddCustomBadge}
                disabled={!customBadgeInput.trim() || badges.includes(customBadgeInput.trim())}
              >
                <Plus className='h-4 w-4' />
              </Button>
            </div>
          )}
        </div>

        {/* 선택된 뱃지 표시 */}
        {badges.length > 0 && (
          <div className='space-y-2'>
            <Label>선택된 뱃지</Label>
            <div className='flex flex-wrap gap-2'>
              {badges.map((badge) => (
                <Badge key={badge} variant='secondary' className='gap-1 pr-1'>
                  {badge}
                  <button
                    type='button'
                    onClick={() => handleRemoveBadge(badge)}
                    className='hover:bg-secondary-foreground/20 ml-1 rounded-full'
                    aria-label={`${badge} 뱃지 제거`}
                  >
                    <X className='h-3 w-3' />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {errors?.badge && <div className='text-destructive text-sm'>{errors.badge}</div>}
      </CardContent>
    </Card>
  );
}
