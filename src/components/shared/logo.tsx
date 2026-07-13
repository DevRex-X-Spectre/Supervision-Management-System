import Image from "next/image";
import type { HTMLAttributes } from "react";

type LogoProps = {
  size?: number;
  className?: HTMLAttributes<HTMLDivElement>["className"];
};

export function Logo({ size = 36, className }: LogoProps) {
  return (
    <div
      className={className}
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      <Image
        src="/naub-logo.png"
        alt="NAUB Logo"
        width={size}
        height={size}
        className="rounded-xl object-contain"
        priority
      />
    </div>
  );
}
