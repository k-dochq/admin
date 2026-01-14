import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TransformButtonProps {
  onClick: () => void;
  disabled: boolean;
  isTransforming: boolean;
}

export function TransformButton({ onClick, disabled, isTransforming }: TransformButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type='button'
            size='sm'
            variant='outline'
            onClick={onClick}
            disabled={disabled}
            className='gap-1'
          >
            {isTransforming ? (
              <>
                <Loader2 className='h-3.5 w-3.5 animate-spin' />
                변환 중...
              </>
            ) : (
              <>
                <Sparkles className='h-3.5 w-3.5' />
                문맥 변경
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>AI가 리뷰 내용을 자연스럽게 문맥 변경하고 모든 언어로 번역합니다</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
