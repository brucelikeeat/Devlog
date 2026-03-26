import { siDevdotto, siIndiehackers } from "simple-icons";
import { cn } from "@/lib/utils/cn";
import { LogoCloud, type LogoCloudLogo } from "@/components/ui/logo-cloud-3";

/** Inline SVG data URI (dark fill) so `dark:invert` reads as light marks on the zinc hero. */
function svgLogoDataUri(pathD: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img"><path fill="#09090b" d="${pathD}"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const PUBLISH_LOGOS: LogoCloudLogo[] = [
  {
    src: "https://svgl.app/library/x.svg",
    alt: "X logo",
    name: "X (Twitter)",
  },
  {
    src: "https://svgl.app/library/linkedin.svg",
    alt: "LinkedIn logo",
    name: "LinkedIn",
  },
  {
    src: "https://svgl.app/library/reddit.svg",
    alt: "Reddit logo",
    name: "Reddit",
  },
  {
    src: svgLogoDataUri(siIndiehackers.path),
    alt: "Indie Hackers logo",
    name: "Indie Hackers",
  },
  {
    src: svgLogoDataUri(siDevdotto.path),
    alt: "Dev.to logo",
    name: "Dev.to",
  },
  {
    src: "https://svgl.app/library/hashnode.svg",
    alt: "Hashnode logo",
    name: "Hashnode",
  },
  {
    src: "https://svgl.app/library/producthunt.svg",
    alt: "Product Hunt logo",
    name: "Product Hunt",
  },
];

export function PublishPlatformsSection() {
  return (
    <section className="relative overflow-hidden border-t border-zinc-800 px-6 py-20 md:py-28">
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -top-1/2 left-1/2 -z-10 h-[120vmin] w-[120vmin] -translate-x-1/2 rounded-b-full",
          "bg-[radial-gradient(ellipse_at_center,rgba(244,244,245,0.07),transparent_50%)]",
          "blur-[30px]",
        )}
      />

      <div className="relative mx-auto w-full max-w-3xl">
        <h2 className="mb-5 text-center text-xl font-medium tracking-tight text-zinc-100 md:text-3xl">
          <span className="text-zinc-500">Publish to</span>
          <br />
          <span className="font-semibold text-zinc-100">
            Every channel you ship to
          </span>
        </h2>

        <div className="mx-auto my-5 h-px max-w-sm bg-zinc-800 [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />

        <LogoCloud logos={PUBLISH_LOGOS} />

        <div className="mt-5 h-px bg-zinc-800 [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />
      </div>
    </section>
  );
}
