import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import heroImg from "@/assets/hero.jpg";
import craftImg from "@/assets/craft.jpg";
import editorialImg from "@/assets/editorial.jpg";
import materialImg from "@/assets/material.jpg";
import frame01 from "@/assets/frame-01-meridian.jpg";
import frame02 from "@/assets/frame-02-riviera.jpg";
import frame03 from "@/assets/frame-03-solaria.jpg";
import frame04 from "@/assets/frame-04-diurne.jpg";
import frame05 from "@/assets/frame-05-astral.jpg";
import frame06 from "@/assets/frame-06-zenith.jpg";
import { sanitizeHtml, validateEmail } from "@/lib/validation";

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return reducedMotion;
}

function Marquee() {
  const reducedMotion = useReducedMotion();
  const words = [
    "Handcrafted in Cadore",
    "·",
    "Italian acetate",
    "·",
    "Zeiss lenses",
    "·",
    "Six silhouettes",
    "·",
    "Numbered edition",
    "·",
    "Solstice 2026",
    "·",
  ];

  return (
    <section className="mt-24 md:mt-40 border-y border-border overflow-hidden">
      <div
        className={`marquee-track whitespace-nowrap py-6 md:py-8 flex gap-16 ${
          reducedMotion ? "animate-none" : ""
        }`}
        role="marquee"
        aria-roledescription="marquee"
      >
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex gap-16 shrink-0">
            {words.map((w, j) => (
              <span
                key={j}
                className="font-serif italic text-3xl md:text-5xl text-ink/80"
              >
                {w}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, shown };
}

function Reveal({
  children,
  delay = 0,
  as: As = "div",
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const Comp = As as React.ElementType;
  return (
    <Comp
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 1.2s cubic-bezier(0.22,0.7,0.2,1) ${delay}ms, transform 1.2s cubic-bezier(0.22,0.7,0.2,1) ${delay}ms`,
      }}
    >
      {children}
    </Comp>
  );
}

function Hero() {
  return (
    <>
      {/* HERO */}
      <section id="top" className="relative pt-24 md:pt-28">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">
          <div className="grid grid-cols-12 gap-6 md:gap-10 items-end">
            <div className="col-span-12 md:col-span-5 pb-8 md:pb-16 reveal">
              <div className="eyebrow text-mute mb-8">Chapter 01 — The Solstice Collection</div>
              <h1 className="font-serif text-[13vw] leading-[0.92] md:text-[7.5rem] md:leading-[0.9] tracking-[-0.02em]">
                Made
                <br />
                <span className="italic font-light">for the</span>
                <br />
                Sun.
              </h1>
              <p className="mt-10 max-w-sm text-mute text-[15px] leading-relaxed">
                Sculpted eyewear cut from a single block of Italian acetate. Six silhouettes.
                Released at the summer solstice, once a year.
              </p>
            </div>

            <div className="col-span-12 md:col-span-7 relative">
              <div className="relative aspect-[4/5] md:aspect-[5/6] overflow-hidden">
                <img
                  src={heroImg}
                  alt="Editorial portrait of a model wearing the Sôlen Solstice sunglasses in warm afternoon light"
                  width={1600}
                  height={1800}
                  className="absolute inset-0 h-full w-full object-cover slow-zoom"
                />
                <div className="absolute left-4 top-4 md:left-6 md:top-6 eyebrow text-ivory/80">
                  N° 01 / 06
                </div>
                <div className="absolute right-4 bottom-4 md:right-6 md:bottom-6 eyebrow text-ivory/80 text-right">
                  Portofino, 15:42
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 md:mt-14 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-t border-border pt-8">
            <div className="max-w-md">
              <div className="eyebrow text-mute mb-3">The Release</div>
              <p className="font-serif text-2xl md:text-3xl leading-tight">
                June 21, 2026. By private invitation.
              </p>
            </div>
            <a href="#waitlist" className="group inline-flex items-center gap-3 eyebrow">
              <span className="border-b border-ink pb-1 group-hover:opacity-60 transition-opacity">
                Reserve your place
              </span>
              <span aria-hidden className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function BrandStory() {
  return (
    <>
      {/* BRAND STORY */}
      <section id="atelier" className="py-28 md:py-48">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 grid grid-cols-12 gap-6 md:gap-10">
          <Reveal className="col-span-12 md:col-span-5 md:col-start-2">
            <div className="eyebrow text-mute mb-6">A note from the atelier</div>
            <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] tracking-tight">
              We do not chase the season.
              <span className="italic font-light"> We answer the light.</span>
            </h2>
          </Reveal>
          <Reveal delay={150} className="col-span-12 md:col-span-4 md:col-start-8 md:pt-6">
            <p className="text-mute leading-relaxed text-[15px]">
              SÔLEN was founded in 2024 in a small studio above the Milanese rooftops, on the belief
              that eyewear is neither accessory nor armour, but instrument — the frame through which
              a summer is remembered.
            </p>
            <p className="mt-6 text-mute leading-relaxed text-[15px]">
              Each Solstice frame is milled from a single block of Mazzucchelli acetate,
              hand-polished for eleven days, and finished by a single maker whose initials are
              pressed inside the temple.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function EditorialDiptych() {
  return (
    <>
      {/* EDITORIAL DIPTYCH */}
      <section className="pb-28 md:pb-48">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 grid grid-cols-12 gap-6 md:gap-10">
          <Reveal className="col-span-12 md:col-span-6">
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                src={editorialImg}
                alt="Model in profile wearing the black Sôlen frame against a warm stone wall"
                width={1400}
                height={1750}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-4 flex justify-between eyebrow text-mute">
              <span>Figure I</span>
              <span>The Meridian, in Onyx</span>
            </div>
          </Reveal>
          <Reveal delay={200} className="col-span-12 md:col-span-5 md:col-start-8 md:pt-32">
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                src={frame02}
                alt="Tortoiseshell Sôlen sunglasses resting on a travertine ledge in raking sunlight"
                width={1400}
                height={1600}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-4 flex justify-between eyebrow text-mute">
              <span>Figure II</span>
              <span>The Riviera, in Amber Tortoise</span>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function ProductDetail() {
  return (
    <>
      {/* PRODUCT DETAIL */}
      <section id="collection" className="py-28 md:py-40 bg-bone/50 border-y border-border">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 md:mb-24">
              <div>
                <div className="eyebrow text-mute mb-4">The Solstice Collection</div>
                <h2 className="font-serif text-4xl md:text-6xl tracking-tight max-w-2xl leading-[1.05]">
                  Six silhouettes, cut from a single summer.
                </h2>
              </div>
              <div className="eyebrow text-mute">Edition of 500 each</div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
            {[
              {
                n: "I",
                name: "Meridian",
                desc: "Sculpted rectangular. Onyx acetate.",
                img: frame01,
              },
              { n: "II", name: "Riviera", desc: "Rounded panto. Amber tortoise.", img: frame02 },
              { n: "III", name: "Solaria", desc: "Oversized square. Bone acetate.", img: frame03 },
              { n: "IV", name: "Diurne", desc: "Fine aviator. Champagne titanium.", img: frame04 },
              { n: "V", name: "Astral", desc: "Cat-eye. Deep havana.", img: frame05 },
              { n: "VI", name: "Zenith", desc: "Shield. Smoke crystal.", img: frame06 },
            ].map((p, i) => (
              <Reveal key={p.name} delay={i * 80}>
                <article className="group">
                  <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
                    <img
                      src={p.img}
                      alt={`Sôlen ${p.name} — ${p.desc}`}
                      width={1400}
                      height={1600}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.04]"
                    />
                    <div className="absolute left-4 top-4 eyebrow text-ivory">N° {p.n}</div>
                  </div>
                  <div className="mt-5 flex items-baseline justify-between">
                    <h3 className="font-serif text-2xl">{p.name}</h3>
                    <span className="eyebrow text-mute">€ 480</span>
                  </div>
                  <p className="mt-1 text-mute text-sm">{p.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Craftsmanship() {
  return (
    <>
      {/* CRAFTSMANSHIP */}
      <section className="py-28 md:py-48">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 grid grid-cols-12 gap-6 md:gap-10 items-center">
          <Reveal className="col-span-12 md:col-span-6">
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                src={craftImg}
                alt="Artisan hands hand-polishing the acetate frame in a Cadore workshop"
                width={1400}
                height={1750}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
          <div className="col-span-12 md:col-span-5 md:col-start-8">
            <Reveal>
              <div className="eyebrow text-mute mb-6">The making</div>
              <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.05]">
                Eleven days
                <span className="italic font-light"> in the hands</span>
                <br />
                of a single maker.
              </h2>
            </Reveal>
            <div className="mt-12 space-y-8">
              {[
                ["01", "Milled", "A single block of Italian acetate, cut by hand."],
                ["02", "Rested", "Seventy-two hours to release the memory of the sheet."],
                ["03", "Polished", "Tumbled in beechwood chips for nine days."],
                ["04", "Signed", "Numbered, initialled, and sealed inside the temple."],
              ].map(([n, t, d], i) => (
                <Reveal key={n} delay={i * 100}>
                  <div className="grid grid-cols-[auto_1fr] gap-6 border-t border-border pt-6">
                    <span className="eyebrow text-mute">{n}</span>
                    <div>
                      <div className="font-serif text-xl">{t}</div>
                      <p className="text-mute text-sm mt-1 max-w-sm">{d}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Materials() {
  return (
    <>
      {/* MATERIALS */}
      <section className="pb-28 md:pb-40">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">
          <Reveal>
            <div className="max-w-2xl mb-14">
              <div className="eyebrow text-mute mb-6">Materials</div>
              <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.05]">
                Chosen for how they age
                <span className="italic font-light"> in the light.</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-12 gap-6 md:gap-10">
            <Reveal className="col-span-12 md:col-span-6">
              <div className="relative aspect-[7/5] overflow-hidden">
                <img
                  src={materialImg}
                  alt="Macro study of the honey tortoise acetate used in the Riviera frame"
                  width={1400}
                  height={1000}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            </Reveal>
            <div className="col-span-12 md:col-span-5 md:col-start-8 space-y-10">
              {[
                {
                  t: "Mazzucchelli 1849 Acetate",
                  d: "A cotton-derived plant acetate, layered by hand in Castiglione Olona. Warms with wear.",
                },
                {
                  t: "Carl Zeiss Sun Lenses",
                  d: "German mineral glass, polarised, cut to a curvature of 6 base. 100% UV.",
                },
                {
                  t: "Beta-Titanium Core",
                  d: "A hidden spine that keeps the frame silent, straight, and impossibly light.",
                },
              ].map((m, i) => (
                <Reveal key={m.t} delay={i * 120}>
                  <div className="border-t border-border pt-6">
                    <h3 className="font-serif text-2xl">{m.t}</h3>
                    <p className="text-mute text-sm mt-2 leading-relaxed max-w-md">{m.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Waitlist() {
  return (
    <>
      {/* WAITLIST */}
      <section id="waitlist" className="relative py-28 md:py-48 bg-ink text-ivory overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[60vw] h-[60vw] rounded-full bg-ivory blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-[1440px] px-6 md:px-12">
          <div className="grid grid-cols-12 gap-6 md:gap-10 items-end">
            <Reveal className="col-span-12 md:col-span-7">
              <div className="eyebrow text-ivory/60 mb-8">The Private Waitlist</div>
              <h2 className="font-serif text-5xl md:text-[7rem] leading-[0.95] tracking-[-0.02em]">
                Be first
                <br />
                <span className="italic font-light">in the sun.</span>
              </h2>
              <p className="mt-8 max-w-md text-ivory/70 text-[15px] leading-relaxed">
                The Solstice Collection is released to our list forty-eight hours before it becomes
                public. No discounts. No noise. A single letter, at the change of the season.
              </p>
            </Reveal>

            <Reveal delay={200} className="col-span-12 md:col-span-4 md:col-start-9">
              {(() => {
                const [email, setEmail] = useState("");
                const [submitted, setSubmitted] = useState(false);
                const [submitError, setSubmitError] = useState(null);
                const [isSubmitting, setIsSubmitting] = useState(false);
                const [time, setTime] = useState("");

                // Honeypot field for bot protection (invisible to humans)
                const [honeypot, setHoneypot] = useState("");

                useEffect(() => {
                  const tick = () => {
                    const now = new Date();
                    const opts: Intl.DateTimeFormatOptions = {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Europe/Rome",
                      hour12: false,
                    };
                    setTime(new Intl.DateTimeFormat("en-GB", opts).format(now));
                  };
                  tick();
                  const id = setInterval(tick, 30_000);
                  return () => clearInterval(id);
                }, []);

                const onSubmit = async (e: FormEvent) => {
                  e.preventDefault();

                  // Reset errors
                  setSubmitError(null);

                  // Basic validation
                  if (!email) {
                    setSubmitError("Please enter your email address");
                    return;
                  }

                  // Use validation utility
                  if (!validateEmail(email)) {
                    setSubmitError("Please enter a valid email address");
                    return;
                  }

                  // Bot protection: if honeypot field has value, it's likely a bot
                  if (honeypot.trim() !== "") {
                    // Silently fail to avoid tipping off bots
                    setSubmitError("Unable to process request. Please try again.");
                    return;
                  }

                  // Prevent duplicate submissions
                  if (isSubmitting) return;

                  setIsSubmitting(true);

                  try {
                    // TODO: Replace with actual API call when backend is ready
                    // Example with improved security:
                    // const response = await fetch('/api/waitlist', {
                    //   method: 'POST',
                    //   headers: {
                    //     'Content-Type': 'application/json',
                    //     // In production with auth: include CSRF token
                    //   },
                    //   body: JSON.stringify({
                    //     email: sanitizeHtml(email), // Sanitize for storage/display
                    //     timestamp: new Date().toISOString()
                    //   }),
                    //   credentials: 'same-origin' // Important for cookies
                    // });
                    //
                    // if (!response.ok) {
                    //   const errorData = await response.json();
                    //   throw new Error(errorData.message || 'Submission failed');
                    // }

                    // Simulate API delay for demo
                    await new Promise(resolve => setTimeout(resolve, 1500));

                    // In a real app, you'd check the response from the server
                    setSubmitted(true);
                  } catch (error) {
                    // Generic error message (don't expose internal details)
                    console.error("Waitlist submission error:", error);
                    setSubmitError("Unable to process request. Please try again later.");
                  } finally {
                    setIsSubmitting(false);
                  }
                };

                if (!submitted) {
                  return (
                    <form onSubmit={onSubmit} className="w-full" role="form">
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="email" className="eyebrow text-ivory/60 block mb-2">
                            Your address
                          </label>
                          <div className="flex items-center border-b border-ivory/30 focus-within:border-ivory transition-colors">
                            <input
                              id="email"
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="name@domain.com"
                              className="flex-1 bg-transparent py-4 outline-none placeholder:text-ivory/40 text-ivory"
                              aria-invalid={!!submitError && !validateEmail(email)}
                              aria-describedby={submitError && !validateEmail(email) ? "email-error" : undefined}
                            />
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className={`eyebrow text-ivory hover:text-ivory/70 transition-colors pl-4 ${
                                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                            >
                              {isSubmitting ? "Processing..." : "Reserve →"}
                            </button>
                          </div>
                          {submitError && (
                            <p className="mt-1 text-xs text-ivory/40 leading-relaxed" id="email-error">
                              {submitError}
                            </p>
                          )}
                        </div>

                        {/* Honeypot field - hidden from users but visible to bots */}
                        <div className="absolute left-[-9999px]" aria-hidden="true">
                          <label htmlFor="hp-field">Leave this empty (for bot protection)</label>
                          <input
                            id="hp-field"
                            type="text"
                            name="hp"
                            tabIndex={-1}
                            value={honeypot}
                            onChange={(e) => setHoneypot(e.target.value)}
                            aria-hidden="true"
                          />
                        </div>

                        <p className="mt-4 text-xs text-ivory/40 leading-relaxed">
                          One letter per solstice. Never shared. Unsubscribe in a single click.
                        </p>
                      </div>
                    </form>
                  );
                } else {
                  return (
                    <div className="border-t border-ivory/30 pt-6">
                      <div className="eyebrow text-ivory/60 mb-3">Confirmed</div>
                      <p className="font-serif text-3xl italic">You are on the list.</p>
                      <p className="mt-3 text-ivory/60 text-sm">
                        We will write to you at the solstice.
                      </p>
                    </div>
                  );
                }
              })()}
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

function Footer() {
  return (
    <>
      {/* FOOTER */}
      <footer className="bg-ink text-ivory/60 border-t border-ivory/10">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 py-10 flex flex-col md:flex-row justify-between gap-6 eyebrow">
          <div>© SÔLEN MMXXVI — Milano</div>
          <div className="flex gap-8">
            <span>Milano {""}</span>
            {/* Time is handled in a custom hook or context in real applications */}
            {/* For demonstration, we show a static time - in practice, this would come from a shared state or API */}
            <span className="hidden sm:inline">12:00</span>
            <a href="#" className="hover:text-ivory transition-colors">
              Instagram
            </a>
            <a href="#" className="hover:text-ivory transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  // In a real app, shared state like time would be lifted to a custom hook or context
  // For now, we keep it simple as the Waitlist component manages its own time display

  return (
    <>
      <HtmlLangAttribute lang="en" />
      <Head />
      <Hero />
      <Marquee />
      <BrandStory />
      <EditorialDiptych />
      <ProductDetail />
      <Craftsmanship />
      <Materials />
      <Waitlist />
      <Footer />
    </>
  );
}

// Helper components for head and html attributes
function HtmlLangAttribute({ lang }: { lang: string }) {
  return <html lang={lang} />;
}

function Head() {
  return null;
}