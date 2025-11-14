'use client';

interface TranslateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isTranslating?: boolean;
  targetLang: 'en' | 'th';
  targetLangLabel: string;
}

export function TranslateButton({
  onClick,
  disabled = false,
  isTranslating = false,
  targetLang,
  targetLangLabel,
}: TranslateButtonProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled || isTranslating}
      className='relative flex size-[30px] shrink-0 items-center justify-center rounded border border-neutral-300 bg-white text-[11px] font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white'
      title={`${targetLangLabel}로 번역`}
    >
      {isTranslating ? (
        <div className='size-3 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent' />
      ) : (
        <span className='uppercase'>{targetLang}</span>
      )}
      <span className='sr-only'>{targetLangLabel}로 번역</span>
    </button>
  );
}
