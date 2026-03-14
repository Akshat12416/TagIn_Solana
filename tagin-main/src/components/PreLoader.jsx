import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import taginLogoBlack from "../assets/tagin-logo-black.svg";

export default function PreLoader({ onComplete }) {
    const [percent, setPercent] = useState(0);
    const containerRef = useRef(null);
    const logoRef = useRef(null);
    const textRef = useRef(null);

    useEffect(() => {
        // Lock scroll
        document.body.style.overflow = "hidden";

        const tl = gsap.timeline({
            onComplete: () => {
                document.body.style.overflow = "auto";
                if (onComplete) onComplete();
            },
        });

        // 1. Counting Animation (0-100)
        // We'll simulate a more realistic progress by varying the speed
        const countObj = { val: 0 };
        tl.to(countObj, {
            val: 60,
            duration: 1.2,
            ease: "power1.out",
            onUpdate: () => setPercent(Math.floor(countObj.val)),
        })
            .to(countObj, {
                val: 100,
                duration: 1.8,
                ease: "power2.inOut",
                onUpdate: () => setPercent(Math.floor(countObj.val)),
            });

        // 2. Slide back to logo
        // Number slides left into/towards the logo
        tl.to(textRef.current, {
            x: -120, // Slide left
            opacity: 0,
            duration: 0.8,
            ease: "power4.inOut",
        }, "+=0.1");

        tl.to(logoRef.current, {
            x: 80, // Move logo slightly to meet the center or just maintain position
            scale: 1.2,
            duration: 0.8,
            ease: "power4.inOut",
        }, "<");

        // 3. Logo enlarges to black screen reveal (no opacity loss)
        // The logo is black, so expanding it fills the screen with blackness
        tl.to(logoRef.current, {
            scale: 120, // Huge scale to fill everything
            duration: 1.2,
            ease: "power4.in",
        });

        // Fade the whole loader out at the very end to reveal the hero
        tl.to(containerRef.current, {
            opacity: 0,
            duration: 0.4,
        });

        tl.to(containerRef.current, {
            display: "none",
        });

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [onComplete]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-white overflow-hidden"
        >
            <div className="flex items-center justify-center w-full h-full relative">
                <div className="flex items-center gap-12 relative z-10">
                    {/* Logo on the left */}
                    <div ref={logoRef} className="w-20 h-20 pointer-events-none">
                        <img src={taginLogoBlack} alt="TagIn Logo" className="w-full h-full" />
                    </div>

                    {/* Counting number at the center */}
                    <div
                        ref={textRef}
                        className="text-black font-['ClashDisplay'] font-bold text-8xl md:text-9xl tabular-nums tracking-tighter"
                    >
                        {percent}
                    </div>
                </div>
            </div>
        </div>
    );
}
