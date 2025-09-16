'use client';

interface SendIconProps {
  className?: string;
}

export function SendIcon({ className }: SendIconProps) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='30'
      height='30'
      viewBox='0 0 30 30'
      fill='none'
      className={className}
    >
      <path
        d='M20.1754 3.70005L8.88789 7.45005C1.30039 9.98755 1.30039 14.1251 8.88789 16.6501L12.2379 17.7626L13.3504 21.1126C15.8754 28.7001 20.0254 28.7001 22.5504 21.1126L26.3129 9.83755C27.9879 4.77505 25.2379 2.01255 20.1754 3.70005ZM20.5754 10.4251L15.8254 15.2001C15.6379 15.3876 15.4004 15.4751 15.1629 15.4751C14.9254 15.4751 14.6879 15.3876 14.5004 15.2001C14.326 15.0236 14.2283 14.7856 14.2283 14.5376C14.2283 14.2895 14.326 14.0515 14.5004 13.8751L19.2504 9.10005C19.6129 8.73755 20.2129 8.73755 20.5754 9.10005C20.9379 9.46255 20.9379 10.0626 20.5754 10.4251Z'
        fill='url(#paint0_linear_send_icon)'
      />
      <defs>
        <linearGradient
          id='paint0_linear_send_icon'
          x1='3.19727'
          y1='15.0038'
          x2='26.8038'
          y2='15.0038'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='#FF60F7' />
          <stop offset='1' stopColor='#AE33FB' />
        </linearGradient>
      </defs>
    </svg>
  );
}
