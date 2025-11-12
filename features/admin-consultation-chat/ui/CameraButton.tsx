'use client';

import { LoadingSpinner } from '@/shared/ui/loading-spinner';

interface CameraButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isUploading?: boolean;
}

export function CameraButton({
  onClick,
  disabled = false,
  isUploading = false,
}: CameraButtonProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled || isUploading}
      className='relative flex size-[28px] shrink-0 items-center justify-center'
      aria-label='Upload image'
    >
      {isUploading ? (
        <LoadingSpinner size='md' className='py-0 text-[#A3A3A3]' />
      ) : (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='28'
          height='28'
          viewBox='0 0 28 28'
          fill='none'
        >
          <path
            d='M14 11.6672C12.103 11.6672 10.5 13.2702 10.5 15.1672C10.5 17.0642 12.103 18.6672 14 18.6672C15.897 18.6672 17.5 17.0642 17.5 15.1672C17.5 13.2702 15.897 11.6672 14 11.6672Z'
            fill='#A3A3A3'
          />
          <path
            d='M23.3379 7H20.3209L17.1627 3.84183C16.944 3.62303 16.6473 3.50007 16.3379 3.5H11.6712C11.3618 3.50007 11.0651 3.62303 10.8464 3.84183L7.68822 7H4.67122C3.38439 7 2.33789 8.0465 2.33789 9.33333V22.1667C2.33789 23.4535 3.38439 24.5 4.67122 24.5H23.3379C24.6247 24.5 25.6712 23.4535 25.6712 22.1667V9.33333C25.6712 8.0465 24.6247 7 23.3379 7ZM14.0046 21C10.8429 21 8.17122 18.3283 8.17122 15.1667C8.17122 12.005 10.8429 9.33333 14.0046 9.33333C17.1662 9.33333 19.8379 12.005 19.8379 15.1667C19.8379 18.3283 17.1662 21 14.0046 21Z'
            fill='#A3A3A3'
          />
        </svg>
      )}
    </button>
  );
}
