import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Users, Box, Cpu, Fingerprint, Link as LinkIcon, CheckCircle2, AlertTriangle, Layers, Zap, Radio, Star, Smartphone } from "lucide-react";
import verificationPageImg from "../assets/verification_page.jpeg";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function BentoGridSectionTwo() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".bento-card-two",
        { opacity: 0, y: 80 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="w-full bg-white py-0 relative flex flex-col items-center border-t border-gray-100">
      <div className="max-w-[1400px] px-6 lg:px-8 w-full py-10">
        {/* Header section */}
        <div className="mb-14 max-w-3xl mr-auto text-left">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-5xl font-['ClashDisplay'] tracking-tight text-gray-900 sm:text-5xl mb-6 leading-tight"
          >
            The World's Most Trusted Authentication Network
          </motion.h2>
        </div>

        {/* 
          COMPLEX 9-CARD BENTO GRID 
          4 columns, 4 auto-rows (min 180px)
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[220px] max-w-7xl mx-auto">
          
          {/* Card 1: Top Left (Circular Stat) - col-span-1 row-span-2 */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bento-card-two col-span-1 md:row-span-2 bg-blue-600 rounded-[2rem] p-8 flex flex-col relative overflow-hidden group shadow-lg justify-between items-center text-center"
          >
            <div>
               <h3 className="font-extrabold text-white leading-tight text-xl mb-2">Product Authentication Network</h3>
               <p className="text-blue-100 text-sm font-medium">Millions of scans processed across our secure verification network.</p>
            </div>
            
            <div className="relative mt-8 mb-4 w-44 h-44 flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90 group-hover:scale-110 transition-transform duration-700 ease-out drop-shadow-lg" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" strokeDasharray="282.7" strokeDashoffset="5.65" className="animate-[spin_4s_linear_infinite]" style={{ animationPlayState: 'paused' }} />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-extrabold text-white">98%</span>
                  <span className="text-[10px] uppercase font-bold text-blue-100 tracking-wider">Authentic</span>
               </div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full border-2 border-white/50 animate-ping opacity-30" />
            </div>

            <div className="bg-white px-4 py-2 rounded-xl text-xs font-bold text-gray-900 shadow-md flex items-center gap-2">
               <Zap className="w-4 h-4 text-green-500 fill-current" /> Live Network Pulse
            </div>
          </motion.div>

          {/* Card 2: Top Center (Metric) - col-span-1 row-span-1 */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bento-card-two bg-gray-50 rounded-[2rem] p-8 relative overflow-hidden group shadow-sm border-2 border-gray-100 flex flex-col justify-center"
          >
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-black text-gray-900 text-6xl tracking-tighter">4.8<span className="text-blue-600">M</span></h3>
               <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shadow-inner">
                 <ShieldCheck className="w-6 h-6 text-blue-600" strokeWidth={2.5} />
               </div>
             </div>
             <p className="text-gray-900 font-extrabold text-lg leading-tight mb-1">Product Verifications</p>
             <p className="text-gray-500 text-sm font-semibold">Authenticity checks performed across Tag-In ecosystem last year.</p>
          </motion.div>

          {/* Card 3: Top Right (Users Growth) - col-span-1 row-span-1 */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bento-card-two bg-[#0b1426] text-white rounded-[2rem] p-8 relative overflow-hidden group shadow-sm flex flex-col justify-center"
          >
             <div className="flex items-center justify-between mb-2">
               <p className="text-white font-bold text-lg leading-tight">Active Verifiers</p>
               <span className="px-2.5 py-1 bg-green-500 text-white text-xs font-black rounded-full shadow-[0_0_15px_rgba(34,197,94,0.4)]">+18%</span>
             </div>
             <h3 className="font-black text-white text-6xl tracking-tighter mb-4">72K</h3>
             <p className="text-gray-300 text-sm font-medium">Consumers verifying products instantly with NFC.</p>
             
             {/* Small line chart abstraction */}
             <div className="absolute bottom-0 right-0 w-32 h-16 opacity-30 flex items-end">
                <svg viewBox="0 0 100 50" className="w-full h-full stroke-current text-blue-500 fill-none" strokeWidth="4">
                   <path d="M0,50 L20,30 L40,40 L70,10 L100,20" />
                </svg>
             </div>
          </motion.div>

          {/* Card 4: Right Vertical (Trusted By Users synced from Grid 1) - col-span-1 row-span-2 */}
          <motion.div 
             whileHover={{ y: -5 }}
             className="bento-card-two col-span-1 md:row-span-2 bg-[#f4f7fb] rounded-[2rem] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group shadow-sm border border-gray-200"
          >
             <h3 className="font-extrabold text-gray-900 text-3xl mb-8 leading-tight">Trusted By<br/>254k+ Users</h3>
             
             {/* Team members / Avatars (Copied from Grid 1) */}
             <div className="flex -space-x-4 mb-6 z-10">
                <img className="w-14 h-14 rounded-full border-4 border-[#f4f7fb] bg-gray-200 object-cover shadow-sm" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="User" />
                <img className="w-14 h-14 rounded-full border-4 border-[#f4f7fb] bg-gray-200 object-cover shadow-sm" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" alt="User" />
                <img className="w-14 h-14 rounded-full border-4 border-[#f4f7fb] bg-gray-200 object-cover shadow-sm" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="User" />
                <img className="w-14 h-14 rounded-full border-4 border-[#f4f7fb] bg-gray-200 object-cover shadow-sm" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="User" />
                <div className="w-14 h-14 rounded-full border-4 border-[#f4f7fb] bg-blue-600 flex items-center justify-center text-white text-sm font-black shadow-md">+5k</div>
             </div>

             <div className="flex items-center gap-2 w-full justify-center">
                <Star className="w-5 h-5 text-blue-600 fill-current" />
                <span className="text-sm font-extrabold text-[#56687a]">4.9/5 from 48k+ Reviews</span>
             </div>
          </motion.div>

          {/* Card 5: Center Large (Hero Visual) - col-span-2 row-span-2 */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="bento-card-two md:col-span-2 md:row-span-2 bg-blue-600 rounded-[2rem] relative overflow-hidden flex items-center justify-center p-0 shadow-lg"
          >
             {/* iPhone Mockup */}
             <div className="z-10 absolute bottom-[-40px] left-1/2 -translate-x-1/2 w-64 h-[420px] bg-black rounded-[3rem] border-[8px] border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col items-center pt-3 overflow-hidden">
               {/* iPhone notch */}
               <div className="w-24 h-6 bg-gray-800 absolute top-0 rounded-b-xl z-20 flex justify-center items-center">
                 <div className="w-10 h-1.5 bg-gray-900 rounded-full"></div>
                 <div className="w-2 h-2 rounded-full bg-blue-900/50 absolute right-4"></div>
               </div>
               
               {/* Screen Content */}
               <div className="w-full h-full bg-white relative">
                  <img src={verificationPageImg} alt="Verification Page Screenshot" className="w-full object-cover" />
                  
                  {/* Subtle glare on screen */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none mix-blend-overlay"></div>
               </div>
             </div>

             {/* Floating UI Elements */}
             <div className="z-30 w-full h-full absolute inset-0 pointer-events-none p-8 flex flex-col items-center justify-center">
                
                {/* Floating Card 1: Verified */}
                <div className="absolute top-10 left-6 bg-white/90 backdrop-blur-xl border border-white p-4 rounded-2xl flex items-center gap-4 shadow-xl w-64 pointer-events-auto">
                   <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shadow-inner">
                      <CheckCircle2 className="w-6 h-6 text-green-600" strokeWidth={3} />
                   </div>
                   <div>
                      <p className="text-gray-900 font-bold text-sm">Verified Product</p>
                      <p className="text-gray-500 text-xs font-semibold">Blockchain hash validated.</p>
                   </div>
                </div>

                {/* Floating Card 2: Fake Detection */}
                <div className="absolute bottom-16 right-6 bg-red-500 border border-red-400 p-4 rounded-2xl flex items-center gap-4 shadow-xl w-64 pointer-events-auto shadow-red-500/20">
                   <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shadow-inner">
                      <AlertTriangle className="w-5 h-5 text-white" strokeWidth={3} />
                   </div>
                   <div>
                      <p className="text-white font-bold text-sm">Fake Attempt Detected</p>
                      <p className="text-red-50 text-xs font-medium">Hotspot flagged in system.</p>
                   </div>
                </div>

             </div>
          </motion.div>

          {/* Card 6: Left Middle (Feature) - col-span-1 row-span-2 */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bento-card-two md:col-span-1 md:row-span-2 bg-gradient-to-br from-gray-900 to-black text-white rounded-[2rem] p-8 relative overflow-hidden group shadow-xl border border-gray-800 flex flex-col"
          >
             <h3 className="font-extrabold text-3xl leading-tight mb-4 z-10">Smart Product Identity</h3>
             <p className="text-gray-400 text-[15px] font-semibold leading-relaxed z-10">
               Every product inherently receives a core digital identity connected to the blockchain.
             </p>
             
             {/* Node connection abstraction */}
             <div className="mt-auto relative w-full h-48 flex items-center justify-center">
                {/* Connecting lines */}
                <svg className="absolute inset-0 w-full h-full stroke-blue-500/30" strokeWidth="3" fill="none">
                   <path d="M 50 100 Q 100 0 150 100 T 250 100" className="animate-[dash_3s_linear_infinite]" strokeDasharray="10 10" />
                   <path d="M 50 150 Q 120 200 150 100 T 250 150" />
                </svg>
                {/* Central Box */}
                <div className="w-20 h-20 bg-blue-600 rounded-2xl shadow-[0_0_40px_rgba(37,99,235,0.8)] flex items-center justify-center z-10 transform group-hover:scale-125 transition-transform duration-500">
                   <Box className="w-10 h-10 text-white" strokeWidth={2.5} />
                </div>
                {/* Small Nodes */}
                <div className="absolute top-8 left-4 w-12 h-12 bg-gray-800 backdrop-blur-md rounded-xl flex items-center justify-center border-2 border-gray-700 shadow-lg"><Radio className="w-6 h-6 text-blue-400" /></div>
                <div className="absolute bottom-8 right-4 w-12 h-12 bg-gray-800 backdrop-blur-md rounded-xl flex items-center justify-center border-2 border-gray-700 shadow-lg"><LinkIcon className="w-6 h-6 text-white" /></div>
             </div>
          </motion.div>

          {/* Card 7: Mid Right (Community / Brands) - col-span-1 row-span-1 */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bento-card-two bg-white rounded-[2rem] p-8 relative overflow-hidden group shadow-sm border-2 border-gray-100 flex flex-col justify-between"
          >
             <div>
               <h3 className="font-extrabold text-gray-900 text-2xl leading-tight mb-2">Trusted by Giants</h3>
               <p className="text-gray-500 text-sm font-semibold leading-relaxed">Manufacturers worldwide use Tag-In.</p>
             </div>
             
             <div className="flex gap-4 items-center justify-center mt-6">
                <div className="w-16 h-16 rounded-2xl bg-black border-2 border-gray-900 flex items-center justify-center p-3 shadow-[0_10px_20px_rgba(0,0,0,0.2)] transform group-hover:-translate-y-2 transition-transform duration-300"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg" alt="Nike" className="w-full invert brightness-0" /></div>
                <div className="w-16 h-16 rounded-2xl bg-black border-2 border-gray-900 flex items-center justify-center p-3 shadow-[0_10px_20px_rgba(0,0,0,0.2)] transform group-hover:-translate-y-2 transition-transform duration-300 delay-75"><img src="https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg" alt="Zara" className="w-full invert brightness-0" /></div>
                <div className="w-12 h-12 rounded-2xl bg-blue-600 shadow-[0_10px_20px_rgba(37,99,235,0.4)] flex items-center justify-center text-white font-black text-sm transform group-hover:-translate-y-2 transition-transform duration-300 delay-150">+120</div>
             </div>
          </motion.div>

          {/* Card 8: Tech Stack - col-span-1 row-span-1 */}
          <motion.div 
                      whileHover={{ y: -5 }}
                      className="bento-card-two md:col-span-1 md:row-span-1 bg-white border border-gray-200 shadow-sm rounded-[2.5rem] p-8 flex flex-col items-start relative group overflow-hidden"
                    >
                      <h3 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 leading-snug">
                        Counterfeit<br/>Hotspots
                      </h3>
                      <p className="text-gray-500 font-medium text-[14px]">
                        Identify suspicious scan activity globally.
                      </p>
                      
                      {/* Visual radar / chart concept */}
                      <div className="mt-auto self-center relative w-full flex justify-center pb-2">
                         {/* Radar circles */}
                         <div className="w-32 h-32 rounded-full border-[10px] border-[#f0f4f8] relative flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500 delay-100">
                            <div className="absolute top-1 right-2 w-4 h-4 bg-red-400 rounded-full shadow-[0_0_15px_rgba(248,113,113,0.8)] border-2 border-white animate-pulse" />
                            <div className="text-center">
                               <span className="block text-2xl font-bold text-gray-900">12</span>
                               <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Alerts</span>
                            </div>
                         </div>
                      </div>
                    </motion.div>

          {/* Card 9: Bottom Right (Mission) - col-span-2 row-span-1 */}
         <motion.div 
                     whileHover={{ y: -5 }}
                     className="bento-card-two md:col-span-2 md:row-span-1 bg-[#5282E1] text-white rounded-[2.5rem] p-8 lg:p-10 relative overflow-hidden group flex flex-col sm:flex-row justify-between items-center shadow-lg"
                   >
                     {/* Background pattern elements */}
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
                     
                     <div className="z-10 max-w-[280px] mb-8 sm:mb-0">
                         <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm text-white border border-white/30">
                            <Box className="w-5 h-5" />
                         </div>
                         <h3 className="mb-3 text-3xl font-bold tracking-tight leading-none text-white drop-shadow-sm">
                           Digital Product Identity
                         </h3>
                         <p className="text-white/80 font-medium text-[15px] leading-relaxed">
                           Every product inherently receives a core digital identity linked to its origin and ownership.
                         </p>
                     </div>
         
                     {/* Glowing UI Element for Identity */}
                     <div className="w-full sm:w-auto relative flex justify-center sm:justify-end z-10 flex-1 px-4 sm:pr-8">
                        <div className="bg-[#091122] p-5 rounded-3xl w-full max-w-[220px] shadow-2xl border border-white/10 group-hover:scale-105 transition-transform duration-500 relative">
                           <div className="flex items-center gap-3 mb-4">
                              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-[#5282E1]" />
                              <div className="flex flex-col">
                                 <span className="text-white text-sm font-bold">Ownership</span>
                                 <span className="text-white/50 text-[10px]">Verified Origin</span>
                              </div>
                           </div>
                           <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-2">
                              <div className="h-full bg-[#5282E1] w-[85%] rounded-full shadow-[0_0_10px_#5282E1]" />
                           </div>
                           <div className="flex justify-between text-[10px] text-white/50 font-bold uppercase tracking-wider">
                              <span>Transfer Ready</span>
                              <span>Secured</span>
                           </div>
                        </div>
                     </div>
                   </motion.div>

        </div>
      </div>
    </section>
  );
}
