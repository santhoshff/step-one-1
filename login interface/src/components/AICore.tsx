import { type CSSProperties, type ReactNode } from 'react';
import { motion } from 'motion/react';

interface AICoreProps {
  status: 'online' | 'thinking' | 'listening' | 'processing';
  theme: string;
}

type FadeUpProps = {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
  as?: 'div' | 'section' | 'span' | 'h1' | 'h2' | 'h3' | 'p' | 'nav';
  once?: boolean;
};

export function FadeUp({
  children,
  delay = 0,
  duration = 0.7,
  y = 24,
  className,
  style,
  as = 'div',
  once = true
}: FadeUpProps) {
  const Tag = (motion as any)[as];
  return (
    <Tag
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.2 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  );
}

export default function AICore(_props: AICoreProps) {
  return (
    <>
      {/* Background fixed video behind everything */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed top-0 left-0 w-full h-screen object-cover z-0 pointer-events-none"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260514_135830_bb6491d1-9b66-4aec-9722-13b4dfe3fb46.mp4"
          type="video/mp4"
        />
      </video>

      {/* Transparent main section layer */}
      <section 
        className="relative z-10 flex flex-col justify-center h-full w-full bg-transparent select-none pt-[90px] px-[18px] pb-[32px] min-[901px]:pt-[70px] min-[901px]:px-[32px] min-[901px]:pb-[32px]"
      />
    </>
  );
}

