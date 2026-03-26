import type { ComponentProps } from "react";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { cn } from "@/lib/utils/cn";

export type LogoCloudLogo = {
  src: string;
  alt: string;
  /** Visible label next to the mark in the marquee. */
  name: string;
  width?: number;
  height?: number;
};

type LogoCloudProps = ComponentProps<"div"> & {
  logos: LogoCloudLogo[];
};

export function LogoCloud({ className, logos, ...props }: LogoCloudProps) {
  return (
    <div
      {...props}
      className={cn(
        "overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black,transparent)]",
        className,
      )}
    >
      <InfiniteSlider gap={42} reverse speed={80} speedOnHover={25}>
        {logos.map((logo) => (
          <div
            key={`logo-${logo.name}`}
            className="flex shrink-0 items-center gap-2.5 md:gap-3"
          >
            {/* External SVGs + data URIs; mixed sources — keep `<img>`. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={logo.alt}
              className="pointer-events-none h-4 w-auto max-h-5 max-w-[100px] select-none object-contain object-left md:h-5 md:max-h-6 md:max-w-[120px] dark:brightness-0 dark:invert"
              height={logo.height}
              loading="lazy"
              src={logo.src}
              width={logo.width}
            />
            <span className="whitespace-nowrap text-sm font-medium tracking-tight text-zinc-300 md:text-base">
              {logo.name}
            </span>
          </div>
        ))}
      </InfiniteSlider>
    </div>
  );
}
