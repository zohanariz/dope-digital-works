"use client";

import React, { useState, useEffect } from "react";

export default function LandingPage() {
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoBuffering, setIsVideoBuffering] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const handlePlayVideo = () => {
    if (videoRef.current) {
      setIsPlaying(true);
      setIsVideoBuffering(true);
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsVideoBuffering(false))
          .catch(() => setIsVideoBuffering(false));
      }
    }
  };

  // Track scroll for progress bar, nav elevation, and back-to-top
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((scrollY / totalScroll) * 100);
      }
      setShowScrollTop(scrollY > 400);
      setIsNavScrolled(scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    business: "",
    phone: "",
    email: "",
    revenue: "Generating $10k–$50k/mo",
    timeslot: "Morning (9am - 12pm EST)",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit request.");
      }

      setBookingSubmitted(true);
    } catch (err: any) {
      console.error("Booking error:", err);
      setSubmitError(
        err?.message || "Something went wrong. Please call directly or try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isBookModalOpen || isVideoModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isBookModalOpen, isVideoModalOpen]);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsBookModalOpen(false);
        setIsVideoModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-pause video when scrolled out of view
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting || entry.intersectionRatio < 0.25) {
              if (!video.paused) {
                video.pause();
                setIsPlaying(false);
              }
            }
          });
        },
        { threshold: [0, 0.25] }
      );
      observer.observe(video);

      return () => observer.disconnect();
    } else {
      const handleScroll = () => {
        if (video.paused) return;
        const rect = video.getBoundingClientRect();
        if (rect.bottom < 50 || rect.top > window.innerHeight - 50) {
          video.pause();
          setIsPlaying(false);
        }
      };
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  useEffect(() => {
    const d = document.documentElement;
    d.classList.add("js");
    const sel =
      ".hero .chip,.hero h1,.hero .sub,.vsl,.cta,.pills span,.checks>div,.built,.s h2,.s .lead,.card,.mini div,.pv,.about figure,.ast .card,.step,.res,.pull,.diff,.inds span,.dark,.grp,details,.final,.btns,footer .wrap>div";
    const els = document.querySelectorAll(sel);
    const counts = new Map();
    els.forEach((el: any) => {
      const p = el.parentElement;
      const n = counts.get(p) || 0;
      counts.set(p, n + 1);
      const delay = Math.min(n * 0.04, 0.16).toFixed(3);
      el.style.setProperty("--d", delay + "s");
      el.classList.add("rv");
    });
    if (typeof IntersectionObserver === "undefined") {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.02, rootMargin: "0px 0px 4% 0px" }
    );
    els.forEach((e) => {
      const rect = (e as HTMLElement).getBoundingClientRect();
      if (rect.top < window.innerHeight + 80) {
        requestAnimationFrame(() => e.classList.add("in"));
      } else {
        io.observe(e);
      }
    });
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div
        className="scroll-progress-bar"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <symbol id="phone" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
          </symbol>
          <symbol id="clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v6l3 2" />
          </symbol>
          <symbol id="ads" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
          </symbol>
          <symbol id="star" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
            <path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1L3.2 9.4l6.1-.8z" />
          </symbol>
          <symbol id="user" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
          </symbol>
          <symbol id="cal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="5" width="16" height="15" rx="2" />
            <path d="M4 10h16M9 3v4M15 3v4" />
          </symbol>
          <symbol id="target" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="12" cy="12" r="1" />
          </symbol>
          <symbol id="bolt" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
          </symbol>
          <symbol id="loop" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 12a8 8 0 10-3 6.2M20 5v5h-5" />
          </symbol>
          <symbol id="gear" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <circle cx="12" cy="12" r="7" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </symbol>
          <symbol id="tag" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12V3h9l9 9-9 9z" />
            <circle cx="8" cy="8" r="1.5" />
          </symbol>
        </defs>
      </svg>

      <nav className={`nav ${isNavScrolled ? "is-scrolled" : ""}`} aria-label="Main">
        <a className="logo" href="#top">
          <b>D</b>Dope Digital Works
        </a>
        <ul>
          <li><a href="#what">What I do</a></li>
          <li><a href="#how">How it works</a></li>
          <li><a href="#fit">Is it for you</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
        <a
          className="btn sm"
          href="#book"
          onClick={(e) => {
            e.preventDefault();
            setIsBookModalOpen(true);
          }}
        >
          Book a call <i>›</i>
        </a>
      </nav>

      <main id="top">
        <header className="hero">
          <div className="wrap">
            <h1>
              <span>More <u className="u">Customers</u>. Smoother <u className="u">Operations</u>.</span>
              <span>Powered by <u className="u">AI</u>.</span>
            </h1>
            <p className="sub">
              I help local service businesses in atlanta get <u className="u">more customers</u> and run <u className="u">smoother operations</u> using AI, automation, and <u className="u">done-for-you systems</u>.
            </p>
            <div
              className={`vsl ${isPlaying ? "is-playing" : ""}`}
              role="region"
              aria-label="Video presentation"
            >
              <video
                ref={videoRef}
                src="/vsl.mp4"
                poster="/vsl-poster.webp"
                className="vsl-video"
                playsInline
                controls={isPlaying}
                preload="auto"
                onPlay={() => {
                  setIsPlaying(true);
                  setIsVideoBuffering(false);
                }}
                onPlaying={() => setIsVideoBuffering(false)}
                onWaiting={() => setIsVideoBuffering(true)}
                onCanPlay={() => setIsVideoBuffering(false)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => {
                  setIsPlaying(false);
                  setIsVideoBuffering(false);
                }}
              />
              {isPlaying && isVideoBuffering && (
                <div className="vsl-buffering" aria-label="Buffering video...">
                  <div className="vsl-spinner" />
                </div>
              )}
              {!isPlaying && (
                <div
                  className="vsl-overlay"
                  onClick={handlePlayVideo}
                  aria-label="Play video"
                >
                  <div className="vsl-in">
                    <button
                      type="button"
                      className="play"
                      aria-label="Play video"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayVideo();
                      }}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                    <p>Watch the video</p>
                  </div>
                </div>
              )}
            </div>
            <div className="cta">
              <a
                className="btn"
                href="#book"
                onClick={(e) => {
                  e.preventDefault();
                  setIsBookModalOpen(true);
                }}
              >
                Book a Discovery Call <i>›</i>
              </a>
              <span className="free">
                <svg viewBox="0 0 54 26" aria-hidden="true">
                  <path d="M52 8C36 2 18 4 6 18M6 18l2-9M6 18l9-1" />
                </svg>
                It's free!
              </span>
            </div>

            <div className="pills">
              <span>Every missed call texted back</span>
              <span>Leads followed up in minutes</span>
              <span>Reviews and referrals on autopilot</span>
            </div>
            <div className="checks">
              <div>
                <b><u className="u">$50k/month</u> potential</b>
                <p>Build a business that gives you real financial freedom.</p>
              </div>
              <div>
                <b>Zero <u className="u">backend work</u></b>
                <p>We handle the systems, you get the results.</p>
              </div>
              <div>
                <b><u className="u">Diagnosis first</u>, build second</b>
                <p>I find where revenue leaks, then build only what your business needs.</p>
              </div>
            </div>
          </div>
        </header>

        <div className="built wrap">
          <p>Built for local service businesses</p>
          <div>
            <span>Roofing</span>
            <span>HVAC</span>
            <span>Solar</span>
            <span>Windows &amp; Siding</span>
            <span>Foundation &amp; Gutters</span>
            <span>Clinics &amp; Med Spas</span>
            <span>Dental</span>
            <span>Mortgage</span>
            <span>Insurance</span>
            <span>Realtors</span>
          </div>
        </div>

        <section className="s">
          <div className="wrap c">
            <h2 className="two bold">
              <span>Start where you are,</span> <span>then we'll find the right next step</span>
            </h2>
            <div className="grid g3">
              <div className="card tri">
                <h3>My leads slip through the cracks</h3>
                <p>Calls get missed, follow-up is slow, and no-shows disappear.</p>
                <a className="out" href="#what">See what I fix</a>
                <div className="panel">
                  <span className="st" style={{ left: "12%", top: "14%", transform: "rotate(-5deg)" }}>Missed calls</span>
                  <span className="st" style={{ right: "8%", top: "34%", transform: "rotate(6deg)" }}>Slow follow-up</span>
                  <span className="st" style={{ left: "10%", top: "58%", transform: "rotate(-4deg)" }}>No-shows</span>
                  <span className="st" style={{ right: "14%", top: "78%", transform: "rotate(4deg)" }}>Price wars</span>
                </div>
              </div>
              <div className="card tri">
                <h3>I want to see what you actually do</h3>
                <p>Lead generation, instant response, follow-up, and operations.</p>
                <a className="out" href="#how">See how it works</a>
                <div className="panel">
                  <div className="mini">
                    <div data-n="1">Discovery call</div>
                    <div data-n="2">Custom growth plan</div>
                    <div data-n="3">We build</div>
                  </div>
                </div>
              </div>
              <div className="card tri">
                <h3>I'm ready to fix this now</h3>
                <p>Get a clear diagnosis and next steps on a free 20-minute call.</p>
                <a
                  className="btn sm"
                  href="#book"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsBookModalOpen(true);
                  }}
                >
                  Book a Discovery Call <i>›</i>
                </a>
                <div className="panel">
                  <div className="bk">
                    <b>Discovery call · 20 min</b>
                    <span>Where revenue is leaking</span>
                    <span>Your fastest opportunity</span>
                    <span>No obligation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="s" id="solve">
          <div className="wrap c">
            <h2 className="two">
              <span>Running a local service business</span> <span>shouldn't mean running everything yourself</span>
            </h2>
            <p className="lead">If you run a local service business, you already know the feeling:</p>
            <div className="grid g4">
              <div className="card">
                <div className="ico"><svg><use href="#phone" /></svg></div>
                <h3>Missed calls = <u className="u">missed revenue</u></h3>
                <p>You miss a call, they call your competitor. That job, or that client, is gone for good.</p>
              </div>
              <div className="card">
                <div className="ico"><svg><use href="#clock" /></svg></div>
                <h3>Slow follow-up <u className="u">kills deals</u></h3>
                <p>A lead fills out your form and hears nothing for 6 hours. By then they've already booked someone else.</p>
              </div>
              <div className="card">
                <div className="ico"><svg><use href="#ads" /></svg></div>
                <h3>Ads spend money, <u className="u">not make it</u></h3>
                <p>You're running Meta or Google ads but getting low-quality leads that don't convert, and no idea why.</p>
              </div>
              <div className="card">
                <div className="ico"><svg><use href="#star" /></svg></div>
                <h3>No system for <u className="u">referrals or reviews</u></h3>
                <p>Happy customers leave and never leave a review. You know you should ask, you just never get around to it.</p>
              </div>
              <div className="card">
                <div className="ico"><svg><use href="#user" /></svg></div>
                <h3>Everything runs <u className="u">through you</u></h3>
                <p>Quotes, follow-ups, scheduling, reminders. If you stop, everything stops. There's no system, just hustle.</p>
              </div>
              <div className="card">
                <div className="ico"><svg><use href="#ads" /></svg></div>
                <h3>Inconsistent <u className="u">lead flow</u></h3>
                <p>Some months are great, some are dead. You have no predictable pipeline, just hope and word of mouth.</p>
              </div>
              <div className="card">
                <div className="ico"><svg><use href="#cal" /></svg></div>
                <h3><u className="u">No-shows</u> and cold leads</h3>
                <p>Appointments get booked and people don't show. Nobody follows up. That slot, and that revenue, just disappears.</p>
              </div>
              <div className="card">
                <div className="ico"><svg><use href="#tag" /></svg></div>
                <h3>Competing on <u className="u">price instead of value</u></h3>
                <p>Without a strong presence and social proof, the only way to win jobs is to be the cheapest. That's a race to the bottom.</p>
              </div>
            </div>
            <p className="pull">These are not effort problems. They're <u className="u">systems problems</u>, and systems <u className="u">can be fixed</u>.</p>
            <div className="btns">
              <a
                className="btn"
                href="#book"
                onClick={(e) => {
                  e.preventDefault();
                  setIsBookModalOpen(true);
                }}
              >
                Book a Discovery Call <i>›</i>
              </a>
            </div>
          </div>
        </section>

        <section className="s" id="about">
          <div className="wrap about">
            <figure>
              <picture>
                <source srcSet="/founder.webp" type="image/webp" />
                <img
                  src="/founder.jpg"
                  alt="Portrait of the person behind Dope Digital Works, smiling in a pink blazer and pink glasses"
                  width={819}
                  height={1024}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                />
              </picture>
            </figure>
            <div>
              <h2>Who you'll be working with</h2>
              <p className="lead">
                15+ years driving innovation and business growth at Amazon, AWS, Google, and IBM. Two Computer Science degrees with industry-recognized certifications in cloud technology and project management.
              </p>
              <div className="at">
                <span>
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                    <path fill="#FF9900" d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726a17.617 17.617 0 01-10.951-.577 17.88 17.88 0 01-5.43-3.35c-.1-.074-.151-.15-.151-.22 0-.047.021-.09.051-.13zm6.565-6.218c0-1.005.247-1.863.743-2.577.495-.71 1.17-1.25 2.04-1.615.796-.335 1.756-.575 2.912-.72.39-.046 1.033-.103 1.92-.174v-.37c0-.93-.105-1.558-.3-1.875-.302-.43-.78-.65-1.44-.65h-.182c-.48.046-.896.196-1.246.46-.35.27-.575.63-.675 1.096-.06.3-.206.465-.435.51l-2.52-.315c-.248-.06-.372-.18-.372-.39 0-.046.007-.09.022-.15.247-1.29.855-2.25 1.82-2.88.976-.616 2.1-.975 3.39-1.05h.54c1.65 0 2.957.434 3.888 1.29.135.15.27.3.405.48.12.165.224.314.283.45.075.134.15.33.195.57.06.254.105.42.135.51.03.104.062.3.076.615.01.313.02.493.02.553v5.28c0 .376.06.72.165 1.036.105.313.21.54.315.674l.51.674c.09.136.136.256.136.36 0 .12-.06.226-.18.314-1.2 1.05-1.86 1.62-1.963 1.71-.165.135-.375.15-.63.045a6.062 6.062 0 01-.526-.496l-.31-.347a9.391 9.391 0 01-.317-.42l-.3-.435c-.81.886-1.603 1.44-2.4 1.665-.494.15-1.093.227-1.83.227-1.11 0-2.04-.343-2.76-1.034-.72-.69-1.08-1.665-1.08-2.94l-.05-.076zm3.753-.438c0 .566.14 1.02.425 1.364.285.34.675.512 1.155.512.045 0 .106-.007.195-.02.09-.016.134-.023.166-.023.614-.16 1.08-.553 1.424-1.178.165-.28.285-.58.36-.91.09-.32.12-.59.135-.8.015-.195.015-.54.015-1.005v-.54c-.84 0-1.484.06-1.92.18-1.275.36-1.92 1.17-1.92 2.43l-.035-.02zm9.162 7.027c.03-.06.075-.11.132-.17.362-.243.714-.41 1.05-.5a8.094 8.094 0 011.612-.24c.14-.012.28 0 .41.03.65.06 1.05.168 1.172.33.063.09.099.228.099.39v.15c0 .51-.149 1.11-.424 1.8-.278.69-.664 1.248-1.156 1.68-.073.06-.14.09-.197.09-.03 0-.06 0-.09-.012-.09-.044-.107-.12-.064-.24.54-1.26.806-2.143.806-2.64 0-.15-.03-.27-.087-.344-.145-.166-.55-.257-1.224-.257-.243 0-.533.016-.87.046-.363.045-.7.09-1 .135-.09 0-.148-.014-.18-.044-.03-.03-.036-.047-.02-.077 0-.017.006-.03.02-.063v-.06z" />
                  </svg>
                  Amazon
                </span>
                <span>
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                    <path fill="#232F3E" d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 0 1-.287-.375 6.18 6.18 0 0 1-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.295.072-.583.16-.862.272a2.287 2.287 0 0 1-.28.104.488.488 0 0 1-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 0 1 .224-.167c.279-.144.614-.264 1.005-.36a4.84 4.84 0 0 1 1.246-.151c.95 0 1.644.216 2.091.647.439.43.662 1.085.662 1.963v2.586zm-3.24 1.214c.263 0 .534-.048.822-.144.287-.096.543-.271.758-.51.128-.152.224-.32.272-.512.047-.191.08-.423.08-.694v-.335a6.66 6.66 0 0 0-.735-.136 6.02 6.02 0 0 0-.75-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.655.295.846.191.2.47.296.838.296zm6.41.862c-.144 0-.24-.024-.304-.08-.064-.048-.12-.16-.168-.311L7.586 5.55a1.398 1.398 0 0 1-.072-.32c0-.128.064-.2.191-.2h.783c.151 0 .255.025.31.08.065.048.113.16.16.312l1.342 5.284 1.245-5.284c.04-.16.088-.264.151-.312a.549.549 0 0 1 .32-.08h.638c.152 0 .256.025.32.08.063.048.12.16.151.312l1.261 5.348 1.381-5.348c.048-.16.104-.264.16-.312a.52.52 0 0 1 .311-.08h.743c.127 0 .2.065.2.2 0 .04-.009.08-.017.128a1.137 1.137 0 0 1-.056.2l-1.923 6.17c-.048.16-.104.263-.168.311a.51.51 0 0 1-.303.08h-.687c-.151 0-.255-.024-.32-.08-.063-.056-.119-.16-.15-.32l-1.238-5.148-1.23 5.14c-.04.16-.087.264-.15.32-.065.056-.177.08-.32.08zm10.256.215c-.415 0-.83-.048-1.229-.143-.399-.096-.71-.2-.918-.32-.128-.071-.215-.151-.247-.223a.563.563 0 0 1-.048-.224v-.407c0-.167.064-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.566.215.878.279.319.064.63.096.95.096.502 0 .894-.088 1.165-.264a.86.86 0 0 0 .415-.758.777.777 0 0 0-.215-.559c-.144-.151-.416-.287-.807-.415l-1.157-.36c-.583-.183-1.014-.454-1.277-.813a1.902 1.902 0 0 1-.4-1.158c0-.335.073-.63.216-.886.144-.255.335-.479.575-.654.24-.184.51-.32.83-.415.32-.096.655-.136 1.006-.136.175 0 .359.008.535.032.183.024.35.056.518.088.16.04.312.08.455.127.144.048.256.096.336.144a.69.69 0 0 1 .24.2.43.43 0 0 1 .071.263v.375c0 .168-.064.256-.184.256a.83.83 0 0 1-.303-.096 3.652 3.652 0 0 0-1.532-.311c-.455 0-.815.071-1.062.223-.248.152-.375.383-.375.71 0 .224.08.416.24.567.159.152.454.304.877.44l1.134.358c.574.184.99.44 1.237.767.247.327.367.702.367 1.117 0 .343-.072.655-.207.926-.144.272-.336.511-.583.703-.248.2-.543.343-.886.447-.36.111-.734.167-1.142.167zM21.698 16.207c-2.626 1.94-6.442 2.969-9.722 2.969-4.598 0-8.74-1.7-11.87-4.526-.247-.223-.024-.527.272-.351 3.384 1.963 7.559 3.153 11.877 3.153 2.914 0 6.114-.607 9.06-1.852.439-.2.814.287.383.607zM22.792 14.961c-.336-.43-2.22-.207-3.074-.103-.255.032-.295-.192-.063-.36 1.5-1.053 3.967-.75 4.254-.399.287.36-.08 2.826-1.485 4.007-.215.184-.423.088-.327-.151.32-.79 1.03-2.57.695-2.994z" />
                  </svg>
                  AWS
                </span>
                <span>
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
                    <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
                  </svg>
                  Google
                </span>
                <span>
                  <svg viewBox="0 7 24 10" width="43" height="18" aria-hidden="true" focusable="false">
                    <path fill="#0F62FE" d="M23.544 15.993c.038 0 .06-.017.06-.053v-.036c0-.035-.022-.052-.06-.052h-.09v.14zm-.09.262h-.121v-.498h.225c.112 0 .169.066.169.157 0 .079-.036.129-.09.15l.111.19h-.133l-.092-.17h-.07zm.434-.222v-.062c0-.2-.157-.357-.363-.357a.355.355 0 00-.363.357v.062c0 .2.156.358.363.358a.355.355 0 00.363-.358zm-.838-.03c0-.28.212-.492.475-.492.264 0 .475.213.475.491 0 .279-.211.491-.475.491a.477.477 0 01-.475-.49zM16.21 8.13l-.216-.624h-3.56v.624zm.413 1.19l-.216-.623h-3.973v.624zm2.65 7.147h3.107v-.624h-3.108zm0-1.192h3.107v-.623h-3.108zm0-1.19h1.864v-.624h-1.865zm0-1.191h1.864v-.624h-1.865zm0-1.191h1.864v-.624h-3.555l-.175.504-.175-.504h-3.555v.624h1.865v-.574l.2.574h3.33l.2-.574zm1.864-1.815h-3.142l-.217.624h3.359zm-7.46 3.006h1.865v-.624h-1.865zm0 1.19h1.865v-.623h-1.865zm-1.243 1.191h3.108v-.623h-3.108zm0 1.192h3.108v-.624h-3.108zm6.386-8.961l-.216.624h3.776v-.624zm-.629 1.815h4.19v-.624h-3.974zm-4.514 1.19h3.359l-.216-.623h-3.143zm2.482 2.383h2.496l.218-.624h-2.932zm.417 1.19h1.662l.218-.623h-2.098zm.416 1.191h.83l.218-.623h-1.266zm.414 1.192l.217-.624h-.432zm-12.433-.006l4.578.006c.622 0 1.18-.237 1.602-.624h-6.18zm4.86-3v.624h2.092c0-.216-.03-.425-.083-.624zm-3.616.624h1.865v-.624H6.217zm3.617-3.573h2.008c.053-.199.083-.408.083-.624H9.834zm-3.617 0h1.865v-.624H6.217zM9.55 7.507H4.973v.624h6.18a2.36 2.36 0 00-1.602-.624zm2.056 1.191H4.973v.624h6.884a2.382 2.382 0 00-.25-.624zm-5.39 2.382v.624h4.87c.207-.176.382-.387.519-.624zm4.87 1.191h-4.87v.624h5.389a2.39 2.39 0 00-.519-.624zm-6.114 3.006h6.634c.11-.193.196-.402.25-.624H4.973zM0 8.13h4.352v-.624H0zm0 1.191h4.352v-.624H0zm1.243 1.191h1.865v-.624H1.243zm0 1.191h1.865v-.624H1.243zm0 1.19h1.865v-.623H1.243zm0 1.192h1.865v-.624H1.243zM0 15.276h4.352v-.623H0zm0 1.192h4.352v-.624H0Z" />
                  </svg>
                  IBM
                </span>
              </div>
              <div className="ast">
                <div className="card svc">
                  <b>15+</b>
                  <span>years driving innovation and business growth</span>
                </div>
                <div className="card svc">
                  <b>2</b>
                  <span>Computer Science degrees</span>
                </div>
                <div className="card svc">
                  <b>Certified</b>
                  <span>in cloud technology and project management</span>
                </div>
              </div>
              <a className="btn" href="#book">Book a Discovery Call <i>›</i></a>
            </div>
          </div>
        </section>

        <section className="s" id="what">
          <div className="wrap c">
            <h2 className="two">
              <span>I don't sell you a service. I <u className="u">diagnose your business</u></span> <span>and <u className="u">build what it actually needs</u>.</span>
            </h2>
            <p className="lead">
              Most businesses don't have a marketing problem. They have a systems problem: leads falling through gaps, operations running on manual effort, and no infrastructure to convert the attention they're already getting. I come in, find exactly where that is, and fix it.
            </p>
            <div className="grid g4">
              <div className="card svc">
                <div className="ico"><svg><use href="#target" /></svg></div>
                <h3>Lead generation</h3>
                <p>AI-powered video ads and content systems that bring in better quality leads at lower cost than what you're running now.</p>
              </div>
              <div className="card svc">
                <div className="ico"><svg><use href="#bolt" /></svg></div>
                <h3>Instant response</h3>
                <p>Missed call text back and AI voice agents that respond to every lead the moment they reach out, day or night.</p>
              </div>
              <div className="card svc">
                <div className="ico"><svg><use href="#loop" /></svg></div>
                <h3>Follow-up automation</h3>
                <p>Automated sequences that nurture leads, send reminders, request reviews, and keep your pipeline warm, without you lifting a finger.</p>
              </div>
              <div className="card svc">
                <div className="ico"><svg><use href="#gear" /></svg></div>
                <h3>Operations on autopilot</h3>
                <p>Booking, confirmations, no-show follow-ups, and internal workflows, all automated so your time stays on the job, not the admin.</p>
              </div>
            </div>
            <div className="diff">
              <b>Here's how I think about it:</b> your business is already generating some attention, whether that's ad traffic, referrals, walk-ins, or word of mouth. The question is how much of it turns into revenue. In most businesses I work with, the answer is: not enough. And the gap is almost always fixable.
            </div>
          </div>
        </section>

        <section className="s" id="how">
          <div className="wrap c">
            <h2>A clear path from first call to live systems</h2>
            <p className="lead">
              No long onboarding decks. No disappearing after the contract is signed. Typical timeline from discovery call to live systems: 2–4 weeks.
            </p>
            <div className="path">
              <div className="steps">
                <div className="step on" data-n="1">
                  <h3>Discovery call: we find the gaps</h3>
                  <p>A free 20-minute call. I ask how leads come in, where they drop off, and how your operations run. You'll know exactly where revenue is leaking, whether we work together or not.</p>
                </div>
                <div className="step" data-n="2">
                  <h3>Custom growth plan</h3>
                  <p>If we're a fit, I map out which systems to build, in which order, and what results to expect. Clear scope, timeline, and investment. No surprises after you sign.</p>
                </div>
                <div className="step" data-n="3">
                  <h3>We build, you stay focused</h3>
                  <p>I handle ad creatives, automation builds, AI integrations, and follow-up sequences. You answer a few setup questions and show up to a handoff call. Typical build: 1–3 weeks.</p>
                </div>
                <div className="step" data-n="4">
                  <h3>Go live, then scale</h3>
                  <p>Systems go live and I walk you through them, with ongoing support to keep things optimised. As you grow, we build the next layer without your workload growing too.</p>
                </div>
              </div>
            </div>
            <div className="res">
              <b>A business that generates <u className="u">predictable monthly revenue</u>, without you having to be everywhere at once.</b>Most clients see their first results within the first 30 days of systems going live. The compounding effect builds from there.
            </div>
          </div>
        </section>

        <section className="s" id="fit">
          <div className="wrap c">
            <h2 className="two bold">
              <span>I work with a specific type of business.</span> <span>Here's how to know if that's you.</span>
            </h2>
            <p className="lead">
              I'm selective about who I work with, not because I'm turning away business, but because I only take on clients where I know I can make a real difference. This isn't for everyone and that's intentional.
            </p>
            <div className="grid g2 fit">
              <div className="card yes">
                <h3>This is for you if</h3>
                <ul>
                  <li>You already have customers coming in, through referrals, ads, or word of mouth, but know you're losing some along the way</li>
                  <li>You're spending on marketing but not seeing consistent returns and want to fix that</li>
                  <li>You want your business to run smoother without hiring more staff or working longer hours</li>
                  <li>You're based in the US, UK, Canada, or Australia</li>
                  <li>You're open to using AI and automation to do the heavy lifting, and you want someone to build it for you</li>
                </ul>
              </div>
              <div className="card no">
                <h3>This is not for you if</h3>
                <ul>
                  <li>You're just starting out with no existing customers or revenue, so there's nothing to build on yet</li>
                  <li>You want overnight results. Systems take a few weeks to build and compound over time</li>
                  <li>You're not willing to invest in your business. Good systems cost money and pay back multiples</li>
                  <li>You want to micromanage every decision. I work best when given the space to do the work properly</li>
                  <li>You're looking for a cheap offshore vendor. That's not what this is</li>
                </ul>
              </div>
            </div>
            <div className="inds">
              <span>Roofing</span>
              <span>HVAC</span>
              <span>Solar</span>
              <span>Windows &amp; Siding</span>
              <span>Foundation &amp; Gutters</span>
              <span>Clinics &amp; Med Spas</span>
              <span>Dental Practices</span>
              <span>Mortgage Brokers</span>
              <span>Insurance Brokers</span>
              <span>Realtors</span>
            </div>
            <div className="diff">
              <b>Why this is different.</b> I'm not an agency that sells you a package and disappears. I work with a small number of businesses at a time, which means I actually look at your setup, understand your specific gaps, and build systems that fit your business. If I get on a call and I don't think I can genuinely move the needle for you, I'll tell you that upfront.
            </div>
          </div>
        </section>

        <section className="s">
          <div className="wrap">
            <div className="dark" id="book">
              <h2>Book a <u className="u">free 20-minute</u> discovery call</h2>
              <p className="lead">
                I'll look at where you are right now and map out exactly which systems will move the needle fastest for your business. No pitch. No pressure. Just a clear plan for what's possible.
              </p>
              <h3>What you'll leave with:</h3>
              <ul>
                <li>A clear picture of your fastest revenue opportunity</li>
                <li>No obligation to move forward</li>
                <li>A plan, whether we work together or not</li>
              </ul>

              <a
                className="btn"
                href="#book"
                onClick={(e) => {
                  e.preventDefault();
                  setIsBookModalOpen(true);
                }}
              >
                Book Your Free Discovery Call <i>›</i>
              </a>
              <p className="fine">
                Prefer to talk? Call or text <a href="tel:+13465404100">+1 346 540 4100</a><br />
                I work with a small number of businesses at a time. Spots fill up, so book sooner rather than later.
              </p>
            </div>
          </div>
        </section>

        <section className="s" id="faq">
          <div className="wrap c">
            <h2 className="two bold"><span>Frequently asked questions</span></h2>
            <p className="lead">If something isn't covered here, bring it to the discovery call. That's exactly what it's for.</p>
            <div className="faqw">
              <p className="grp">Trust and credibility</p>
              <details>
                <summary>Where are you based and does that affect how we work together?</summary>
                <p>I work with local service businesses in the US, UK, Canada, and Australia. Everything runs remotely, and the 20-minute call is the easiest way to confirm we can work at times that suit you.</p>
              </details>
              <details>
                <summary>Are you an agency or a one-person operation?</summary>
                <p>I'm not an agency that sells a package and disappears. I work with a small number of businesses at a time so I can look closely at your setup and build around it.</p>
              </details>
              <details>
                <summary>Have you worked with businesses in my industry before?</summary>
                <p>I focus on roofing, HVAC, solar, windows and siding, foundation and gutters, clinics and med spas, dental practices, mortgage and insurance brokers, and realtors. Ask on the call and I'll talk through what applies to yours.</p>
              </details>
              <details>
                <summary>Why should I trust someone I found through a cold email?</summary>
                <p>You shouldn't have to take my word for it. The discovery call is free and has no pitch, and you leave with a clear diagnosis of your biggest gap whether we work together or not.</p>
              </details>

              <p className="grp">The process</p>
              <details>
                <summary>How long does it take to get everything live?</summary>
                <p>Typical build time is 1–3 weeks depending on scope. From discovery call to live systems usually takes 2–4 weeks.</p>
              </details>
              <details>
                <summary>How much of my time does this actually take?</summary>
                <p>Very little. You answer a few setup questions at the start and show up to a handoff call when it's done.</p>
              </details>
              <details>
                <summary>Do I need to understand AI or be technical?</summary>
                <p>No. It's done for you, and I walk you through how everything works at handoff.</p>
              </details>
              <details>
                <summary>What tools and platforms do you use?</summary>
                <p>That depends on your business. Your custom plan names the exact systems and tools before you commit to anything.</p>
              </details>

              <p className="grp">Money and commitment</p>
              <details>
                <summary>How much does this cost?</summary>
                <p>It depends on what your business needs, because I don't sell fixed packages. Your plan lays out a clear scope, timeline, and investment before you sign.</p>
              </details>
              <details>
                <summary>Am I locked into a long term contract?</summary>
                <p>Terms are covered in your plan before you commit, so there are no surprises. The discovery call itself carries no obligation.</p>
              </details>
              <details>
                <summary>What if the systems don't perform?</summary>
                <p>That's why I diagnose first and only take on clients where I know I can make a real difference. If I don't think I can move the needle, I'll tell you upfront. After launch, ongoing support keeps things optimised.</p>
              </details>
              <details>
                <summary>Is this worth it if my business is still small?</summary>
                <p>If you already have customers coming in and know you're losing some along the way, there's something to build on. If you're just starting out with no customers or revenue, it's probably too early.</p>
              </details>

              <p className="grp">The discovery call</p>
              <details>
                <summary>What actually happens on the discovery call?</summary>
                <p>It's 20 minutes. I ask about your current setup: how leads come in, where they drop off, and how your operations run. You leave knowing where your revenue is leaking.</p>
              </details>
              <details>
                <summary>Is there a hard pitch at the end?</summary>
                <p>No. No pitch, no pressure, no obligation to move forward.</p>
              </details>
              <details>
                <summary>What if I'm not ready to start right away?</summary>
                <p>That's fine. You still leave with a clear picture of your fastest revenue opportunity, and you decide when, or whether, to move forward.</p>
              </details>
              <details>
                <summary>I've been burned by agencies before. How is this different?</summary>
                <p>You work directly with me, not a rotating team. I look at your specific gaps, build a plan for your business, and stay on after launch. If I'm not the right fit, I'll say so on the call.</p>
              </details>
            </div>
          </div>
        </section>

        <section className="s">
          <div className="wrap">
            <div className="final">
              <h2>Still have a question that isn't covered here?</h2>
              <p className="lead">Bring it to the discovery call. That's exactly what it's for.</p>
              <div className="btns">
                <a
                  className="btn"
                  href="#book"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsBookModalOpen(true);
                  }}
                >
                  Book Your Free Discovery Call <i>›</i>
                </a>
                <a className="out" href="tel:+13465404100">Call +1 346 540 4100</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <div className="big"><b>D</b>Dope Digital Works</div>
          <div>
            <h4>Page</h4>
            <ul>
              <li><a href="#what">What I do</a></li>
              <li><a href="#how">How it works</a></li>
              <li><a href="#fit">Is it for you</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li><a href="tel:+13465404100">+1 346 540 4100</a></li>
              <li>
                <a
                  href="#book"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsBookModalOpen(true);
                  }}
                >
                  Book a call
                </a>
              </li>
            </ul>
          </div>
          <div className="copy">
            <span>© Dope Digital Works</span>
            <span>AI, automation, and done-for-you systems for local service businesses</span>
          </div>
        </div>
      </footer>

      {/* BOOKING MODAL POPUP */}
      {isBookModalOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={() => setIsBookModalOpen(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              aria-label="Close modal"
              onClick={() => setIsBookModalOpen(false)}
            >
              ×
            </button>

            {bookingSubmitted ? (
              <div className="modal-success">
                <div className="modal-success-icon">✓</div>
                <h3>Discovery Call Requested!</h3>
                <p>
                  Thanks <strong>{formData.name || "there"}</strong>! We’ve received your details.
                  I’ll review your business setup and reach out within 15 minutes to confirm our call slot.
                </p>
                <button
                  type="button"
                  className="btn modal-submit"
                  onClick={() => {
                    setIsBookModalOpen(false);
                    setBookingSubmitted(false);
                  }}
                >
                  Done <i>›</i>
                </button>
              </div>
            ) : (
              <>
                <div className="modal-chip">Free 20-Min Call · No Pressure</div>
                <h3 id="modal-title" className="modal-title">
                  Book Your Free Discovery Call
                </h3>
                <p className="modal-sub">
                  Let’s diagnose where your business is leaking leads and map out the exact AI &amp; automated systems to fix it.
                </p>

                <form onSubmit={handleBookingSubmit}>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="modal-label" htmlFor="m-name">Your Full Name *</label>
                      <input
                        id="m-name"
                        type="text"
                        required
                        className="modal-input"
                        placeholder="e.g. John Miller"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="modal-label" htmlFor="m-biz">Business Name *</label>
                      <input
                        id="m-biz"
                        type="text"
                        required
                        className="modal-input"
                        placeholder="e.g. Miller Roofing & Solar"
                        value={formData.business}
                        onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="modal-label" htmlFor="m-phone">Phone Number *</label>
                      <input
                        id="m-phone"
                        type="tel"
                        required
                        className="modal-input"
                        placeholder="(404) 555-0192"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="modal-label" htmlFor="m-email">Direct Email *</label>
                      <input
                        id="m-email"
                        type="email"
                        required
                        className="modal-input"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="modal-label" htmlFor="m-rev">Current Monthly Revenue</label>
                      <select
                        id="m-rev"
                        className="modal-select"
                        value={formData.revenue}
                        onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                      >
                        <option value="Under $10k/mo">Under $10k/mo</option>
                        <option value="Generating $10k–$50k/mo">Generating $10k–$50k/mo</option>
                        <option value="Generating $50k–$100k/mo">Generating $50k–$100k/mo</option>
                        <option value="$100k+/mo">$100k+/mo</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="modal-label" htmlFor="m-time">Preferred Time of Day</label>
                      <select
                        id="m-time"
                        className="modal-select"
                        value={formData.timeslot}
                        onChange={(e) => setFormData({ ...formData, timeslot: e.target.value })}
                      >
                        <option value="Morning (9am - 12pm EST)">Morning (9am - 12pm EST)</option>
                        <option value="Afternoon (12pm - 4pm EST)">Afternoon (12pm - 4pm EST)</option>
                        <option value="Evening (4pm - 7pm EST)">Evening (4pm - 7pm EST)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="modal-label" htmlFor="m-notes">
                      Biggest bottleneck right now <span className="opt">(Optional)</span>
                    </label>
                    <textarea
                      id="m-notes"
                      className="modal-textarea"
                      rows={2}
                      placeholder="Missed calls, slow lead follow-up, lack of reviews, quotes take too long..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn modal-submit"
                    disabled={isSubmitting}
                    style={{ opacity: isSubmitting ? 0.75 : 1 }}
                  >
                    {isSubmitting ? (
                      "Submitting Request..."
                    ) : (
                      <>
                        Confirm My Free Discovery Call <i>›</i>
                      </>
                    )}
                  </button>

                  {submitError && (
                    <p
                      style={{
                        color: "var(--red)",
                        fontSize: "13.5px",
                        margin: "10px 0 0",
                        textAlign: "center",
                        fontWeight: 600,
                      }}
                    >
                      {submitError}
                    </p>
                  )}

                  <div className="modal-guarantee">
                    <span>✓ 100% Free Call</span>
                    <span>✓ Actionable Diagnosis Plan</span>
                    <span>✓ No Sales Pitch Pressure</span>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* VIDEO MODAL POPUP */}
      {isVideoModalOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Video presentation"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div
            className="modal-content video-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              aria-label="Close video"
              onClick={() => setIsVideoModalOpen(false)}
            >
              ×
            </button>
            <div className="modal-chip" style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}>
              Overview Presentation
            </div>
            <h3 className="modal-title" style={{ color: "#fff" }}>
              How Dope Digital Works Powers Local Service Growth
            </h3>
            <div className="video-container">
              <video
                src="/vsl.mp4"
                poster="/vsl-poster.webp"
                controls
                autoPlay
                playsInline
                preload="auto"
                style={{ width: "100%", height: "100%", borderRadius: "14px", objectFit: "contain" }}
              />
            </div>
          </div>
        </div>
      )}
      {/* FLOATING SCROLL TO TOP BUTTON */}
      {showScrollTop && (
        <button
          type="button"
          className="scroll-top-btn"
          aria-label="Scroll to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 19V5M5 12l7-7 7 7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </button>
      )}
    </>
  );
}
