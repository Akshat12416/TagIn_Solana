import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PARAGRAPH =
    "Real products deserve real proof. Tag-In links every item to its blockchain identity — so authenticity speaks for itself, every single time.";

export default function ScrollHighlightSection() {
    const sectionRef = useRef(null);
    const paraRef = useRef(null);
    const wordsRef = useRef([]);

    const words = PARAGRAPH.split(" ");

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Phase 1 — paragraph slides up from below as section enters viewport
            gsap.fromTo(
                paraRef.current,
                { y: 80, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 70%",
                        end: "top 20%",
                        scrub: 0.8,
                    },
                }
            );

            // Phase 2 — pin the section and scrub word highlights
            // pin:true locks the section to the viewport until scrolled 2400px
            // Only after all words are lit does scrolling continue
            gsap.fromTo(
                wordsRef.current,
                { color: "rgba(0,0,0,0.22)" },
                {
                    color: "rgba(0,0,0,1)",
                    stagger: 1,
                    ease: "none",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top top",
                        end: "+=1400",
                        pin: true,
                        pinSpacing: true,
                        scrub: 1,
                    },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative bg-white flex items-center justify-center overflow-hidden"
            style={{ height: "100vh" }}
        >
            {/* Subtle blue radial glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(82,130,225,0.07) 0%, transparent 80%)",
                }}
            />

            <p
                ref={paraRef}
                className="relative z-10 max-w-5xl mx-auto px-8 text-center tracking-wide"
                style={{
                    fontSize: "4rem",
                    lineHeight: "1.15",
                    fontFamily: "'ClashDisplay', sans-serif",
                    opacity: 0,
                    transform: "translateY(80px)",
                }}
            >
                {words.map((word, i) => (
                    <span
                        key={i}
                        ref={(el) => (wordsRef.current[i] = el)}
                        className="inline-block mr-[0.3em]"
                        style={{ color: "rgba(0,0,0,0.22)" }}
                    >
                        {word}
                    </span>
                ))}
            </p>
        </section>
    );
}
