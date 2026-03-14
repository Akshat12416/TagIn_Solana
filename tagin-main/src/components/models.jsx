import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float, Center, Text } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Model as ShoeModel } from './models/Nike';
import { Model as WatchModel } from './models/Watch';
import { Model as BagModel } from './models/Bag';
import clashDisplayBold from '../assets/fonts/ClashDisplay-Semibold.ttf';

const StaggeredWord = React.forwardRef(({ word, spacing = 1.8, fontSize = 3 }, ref) => {
    const letters = word.split('');
    const totalWidth = (letters.length - 1) * spacing;

    return (
        <group ref={ref} position={[-2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            {letters.map((char, i) => (
                <Text
                    key={i}
                    position={[i * spacing - totalWidth / 2, 20, 0]} // Start high off-screen
                    fontSize={fontSize}
                    color="#5282E1"
                    font={clashDisplayBold}
                    anchorX="center"
                    anchorY="middle"
                >
                    {char}
                </Text>
            ))}
        </group>
    );
});

const SceneCarousel = () => {
    const shoeRef = useRef();
    const watchRef = useRef();
    const bagRef = useRef();

    const shoesTextRef = useRef();
    const watchesTextRef = useRef();
    const bagsTextRef = useRef();

    useEffect(() => {
        gsap.set([shoeRef.current.position, watchRef.current.position, bagRef.current.position], { y: 20 });

        const tl = gsap.timeline({ repeat: -1 });

        // Shoe Animation
        tl.fromTo(
            shoeRef.current.position,
            { y: 20 },
            { y: 0, duration: 2.5, ease: 'back.out(1.2)' }
        )
            .fromTo(shoesTextRef.current.children.map(c => c.position),
                { y: 20 },
                { y: 0, duration: 2.0, ease: 'back.out(1.2)', stagger: 0.08 },
                '<'
            )
            .to(shoeRef.current.position, { y: -20, duration: 2, ease: 'back.in(1.2)' }, '+=3')
            .to(shoesTextRef.current.children.map(c => c.position),
                { y: -20, duration: 1.5, ease: 'back.in(1.2)', stagger: 0.08 },
                '<'
            )

            // Watch Animation
            .fromTo(
                watchRef.current.position,
                { y: 20 },
                { y: 0, duration: 2.5, ease: 'back.out(1.2)' },
                '-=0.4'
            )
            .fromTo(watchesTextRef.current.children.map(c => c.position),
                { y: 20 },
                { y: 0, duration: 2.0, ease: 'back.out(1.2)', stagger: 0.08 },
                '<'
            )
            .to(watchRef.current.position, { y: -20, duration: 2, ease: 'back.in(1.2)' }, '+=3')
            .to(watchesTextRef.current.children.map(c => c.position),
                { y: -20, duration: 1.5, ease: 'back.in(1.2)', stagger: 0.08 },
                '<'
            )

            // Bag Animation
            .fromTo(
                bagRef.current.position,
                { y: 20 },
                { y: 0, duration: 2.5, ease: 'back.out(1.2)' },
                '-=0.4'
            )
            .fromTo(bagsTextRef.current.children.map(c => c.position),
                { y: 20 },
                { y: 0, duration: 2.0, ease: 'back.out(1.2)', stagger: 0.08 },
                '<'
            )
            .to(bagRef.current.position, { y: -20, duration: 2, ease: 'back.in(1.2)' }, '+=3')
            .to(bagsTextRef.current.children.map(c => c.position),
                { y: -20, duration: 1.5, ease: 'back.in(1.2)', stagger: 0.08 },
                '<'
            );

        return () => tl.kill();
    }, []);

    return (
        <>
            <group ref={shoeRef}>
                <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
                    <Center>
                        <ShoeModel scale={5} rotation={[Math.PI / 6, 0, 0]} />
                    </Center>
                </Float>
            </group>

            <group ref={watchRef}>
                <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
                    <Center>
                        <WatchModel scale={1.5} rotation={[0, Math.PI / 4, 0]} />
                    </Center>
                </Float>
            </group>

            <group ref={bagRef}>
                <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
                    <Center>
                        <BagModel scale={6} rotation={[Math.PI / 6, Math.PI / 3, 0]} />
                    </Center>
                </Float>
            </group>

            <StaggeredWord ref={shoesTextRef} word="SHOES" spacing={1.6} />
            <StaggeredWord ref={watchesTextRef} word="WATCHES" spacing={1.4} fontSize={2.5} />
            <StaggeredWord ref={bagsTextRef} word="BAGS" spacing={1.6} />
        </>
    );
};

gsap.registerPlugin(ScrollTrigger);

export default function ModelsSection() {
    const sectionRef = useRef(null);
    const heroInnerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Pure parallax — hero content scrolls up at ~40% speed of the page
            gsap.to(heroInnerRef.current, {
                y: '40%',
                ease: 'none',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="w-full h-screen bg-black relative flex items-center justify-center overflow-hidden"
            style={{ zIndex: 1 }}
        >
            <div ref={heroInnerRef} className="absolute inset-0 will-change-transform">
                <div className="h-full w-full absolute z-50 text-white pointer-events-none">
                    <h1 className="absolute top-48 left-36 text-5xl"><span className=" text-7xl font-['Melodrama']">TAG-IN</span> <br />Authenticates any</h1>
                    <p className="absolute bottom-56 right-36 text-2xl">by just with a Tap of your Smartphone</p>
                    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center w-max">
                        <button
                            className="px-8 py-3 bg-[#5282E1] hover:bg-[#3d68bc] text-white rounded-full font-medium transition-colors text-lg pointer-events-auto cursor-pointer relative z-50"
                            onClick={() => window.location.href = `http://${window.location.hostname}:5174/`}
                        >
                            Verify Your Product
                        </button>
                        <p className='my-5 text-center text-white/80'>build a legacy with TAG-IN join the family now.</p>
                    </div>
                </div>
                <div className="w-full h-screen absolute ">
                    <Canvas shadows camera={{ position: [8, 0, 0], fov: 45 }}>
                        <color attach="background" args={['#000000']} />

                        <ambientLight intensity={0.5} />
                        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                        <spotLight position={[-10, 10, -10]} angle={0.15} penumbra={1} intensity={0.5} castShadow />

                        <Suspense fallback={null}>
                            <SceneCarousel />

                            <Environment preset="city" />
                            <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={10} blur={2.5} far={4} />
                        </Suspense>
                    </Canvas>
                </div>
            </div>
        </section>
    );
}
