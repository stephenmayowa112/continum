import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const logos = [
  { src: "/images/disney.jpg", alt: 'Disney', href: 'https://www.disney.com' },
  { src: "/images/pixar.jpg", alt: 'Pixar', href: 'https://www.pixar.com' },
  { src: "/images/dreamworks.jpg", alt: 'DreamWorks', href: 'https://www.dreamworks.com' },
  { src: "/images/sonypic.jpg", alt: 'Sony Pictures Animation', href: 'https://www.sonypicturesanimation.com' },
  { src: "/images/skydance.jpg", alt: 'Skydance Animation', href: 'https://www.skydance.com' },
  { src: "/images/disney.jpg", alt: 'Disney', href: 'https://www.disney.com' },
  { src: "/images/mpc.jpg", alt: 'MPC', href: 'https://www.mpc.com' },
  { src: "/images/marvel.jpg", alt: 'Marvel', href: 'https://www.marvel.com' },
  { src: "/images/imageworks.jpg", alt: 'Sony Pictures Imageworks', href: 'https://www.imageworks.com' },
  { src: "/images/dneg.jpg", alt: 'DNEG', href: 'https://www.dneg.com' },
  { src: "/images/cinesite.jpg", alt: 'Cinesite', href: 'https://www.cinesite.com' },
  { src: "/images/industrial.jpg", alt: 'Industrial Light & Magic', href: 'https://www.ilm.com' },
];

export default function LogosShowcase() {
  return (
    <div className="bg-white pt-12 pb-8 overflow-hidden relative">
      
      {/* LEFT Gradient */}
      <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none" />

      {/* RIGHT Gradient */}
      <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none" />

      <div className="container mx-auto px-4 text-center relative z-10">
        
        {/* Animated Text */}
        <p className="text-black mb-8 text-lg md:text-xl font-semibold animate-fade-slide">
          Proven success with <span className="text-[#9898FA] font-bold">20+ top studios</span>
        </p>

        <div className="relative w-full overflow-hidden">
          <div className="flex animate-marquee-fast whitespace-nowrap min-w-full">
            {/* First set of logos */}
            {logos.map((logo, index) => (
              <Link legacyBehavior key={index} href={logo.href} passHref>
                <a target="_blank" rel="noopener noreferrer" className="inline-block mx-4">
                  <div className="w-[70px] sm:w-[84px] md:w-[112px] lg:w-[140px] relative">
                    <Image 
                      src={logo.src}
                      alt={logo.alt}
                      width={105}    
                      height={53}   
                      className="transition-transform duration-300 transform hover:scale-105 object-contain"
                    />
                  </div>
                </a>
              </Link>
            ))}
            {/* Second set of logos */}
            {logos.map((logo, index) => (
              <Link legacyBehavior key={index + logos.length} href={logo.href} passHref>
                <a target="_blank" rel="noopener noreferrer" className="inline-block mx-4">
                  <div className="w-[70px] sm:w-[84px] md:w-[112px] lg:w-[140px] relative">
                    <Image 
                      src={logo.src}
                      alt={logo.alt}
                      width={105}    
                      height={53}   
                      className="transition-transform duration-300 transform hover:scale-105 object-contain"
                    />
                  </div>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}