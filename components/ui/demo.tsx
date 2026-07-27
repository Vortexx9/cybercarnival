import { InfiniteSlider } from "@/components/ui/infinite-slider";

const PARTNERS = [
  { name: "MUSIC", icon: "apple", type: "apple-music" },
  { name: "chrome", icon: "googlechrome", type: "chrome" },
  { name: "STRAVA", icon: "strava", type: "strava" },
  { name: "Nintendo", icon: null, type: "nintendo" },
  { name: "jQuery", icon: "jquery", type: "jquery" },
  { name: "PRADA", icon: null, type: "prada" },
  { name: "GitHub", icon: "github", type: "standard" },
  { name: "Discord", icon: "discord", type: "standard" },
  { name: "docker", icon: "docker", type: "standard" },
  { name: "cloudflare", icon: "cloudflare", type: "standard" },
  { name: "linux", icon: "linux", type: "standard" },
  { name: "android", icon: "android", type: "standard" }
];

export function InfiniteSliderBasic() {
  return (
    <InfiniteSlider gap={80} duration={12} reverse className="w-full py-8 bg-transparent flex items-center">
      {PARTNERS.map((p, idx) => {
        const logoFilter = { filter: "brightness(0) invert(1)" };

        if (p.type === "apple-music") {
          return (
            <div key={idx} className="flex items-center gap-2 shrink-0 opacity-80 hover:opacity-100 transition-opacity duration-300">
              <img
                src="https://cdn.jsdelivr.net/npm/simple-icons/icons/apple.svg"
                alt="Apple"
                className="h-[38px] w-auto"
                style={logoFilter}
              />
              <span className="font-sans font-black text-2xl tracking-tighter text-white">MUSIC</span>
            </div>
          );
        }

        if (p.type === "chrome") {
          return (
            <div key={idx} className="flex items-center gap-3 shrink-0 opacity-80 hover:opacity-100 transition-opacity duration-300">
              <img
                src="https://cdn.jsdelivr.net/npm/simple-icons/icons/googlechrome.svg"
                alt="Chrome"
                className="h-[38px] w-auto"
                style={logoFilter}
              />
              <span className="font-sans font-normal text-2xl tracking-tight text-zinc-300">chrome</span>
            </div>
          );
        }

        if (p.type === "strava") {
          return (
            <div key={idx} className="flex items-center gap-2 shrink-0 opacity-80 hover:opacity-100 transition-opacity duration-300">
              <img
                src="https://cdn.jsdelivr.net/npm/simple-icons/icons/strava.svg"
                alt="Strava"
                className="h-[32px] w-auto"
                style={logoFilter}
              />
              <span className="font-sans font-black text-2xl tracking-wide text-white italic">STRAVA</span>
            </div>
          );
        }

        if (p.type === "nintendo") {
          return (
            <div key={idx} className="shrink-0 opacity-80 hover:opacity-100 transition-opacity duration-300 border-[3px] border-white rounded-full px-5 py-1 flex items-center justify-center">
              <span className="font-sans font-black text-xl tracking-tight text-white leading-none">Nintendo</span>
            </div>
          );
        }

        if (p.type === "jquery") {
          return (
            <div key={idx} className="flex items-center gap-2 shrink-0 opacity-80 hover:opacity-100 transition-opacity duration-300">
              <img
                src="https://cdn.jsdelivr.net/npm/simple-icons/icons/jquery.svg"
                alt="jQuery"
                className="h-[32px] w-auto"
                style={logoFilter}
              />
              <span className="font-sans font-light text-2xl tracking-tight text-zinc-300">jQuery</span>
            </div>
          );
        }

        if (p.type === "prada") {
          return (
            <div key={idx} className="shrink-0 opacity-80 hover:opacity-100 transition-opacity duration-300 flex items-center">
              <span className="font-serif text-3xl font-medium tracking-[0.25em] text-white">PRADA</span>
            </div>
          );
        }

        return (
          <div key={idx} className="flex items-center gap-3 shrink-0 opacity-80 hover:opacity-100 transition-opacity duration-300">
            <img
              src={`https://cdn.jsdelivr.net/npm/simple-icons/icons/${p.icon}.svg`}
              alt={p.name}
              className="h-[38px] w-auto"
              style={logoFilter}
            />
            <span className="font-sans font-semibold text-2xl tracking-tight text-white">{p.name}</span>
          </div>
        );
      })}
    </InfiniteSlider>
  );
}

export default {
  InfiniteSliderBasic
};
