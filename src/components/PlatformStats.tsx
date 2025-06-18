'use client';

import React, { useEffect, useRef, useState } from 'react';

const stats = [
  {
    preText: 'Career enhanced for',
    bigText: 90,
    postText: 'Happy Members',
    suffix: '%',
  },
  {
    preText: 'Empowered by',
    bigText: 20,
    postText: 'Expert mentors',
    suffix: '',
  },
  {
    preText: 'Global community from',
    bigText: 10,
    postText: 'Countries',
    suffix: '',
  },
  {
    preText: 'We have built',
    bigText: 1000,
    postText: 'Connections',
    suffix: '',
  },
];

const PlatformStats = () => {
  const [counts, setCounts] = useState(stats.map(() => 0));
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasAnimated) {
          animateCounters();
          setHasAnimated(true); // Prevents re-running the animation
        }
      },
      { threshold: 0.5 } // Halfway into view
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [hasAnimated]);

  const animateCounters = () => {
    const intervals: NodeJS.Timeout[] = [];

    stats.forEach((item, idx) => {
      const target = item.bigText;
      const increment = Math.ceil(target / 50); // Speed of counter
      intervals[idx] = setInterval(() => {
        setCounts((prev) => {
          const updated = [...prev];
          if (updated[idx] < target) {
            updated[idx] = Math.min(updated[idx] + increment, target);
          } else {
            clearInterval(intervals[idx]); // Stop once done
          }
          return updated;
        });
      }, 30);
    });
  };

  return (
    <section
      ref={sectionRef}
      className="w-full py-10 px-4 sm:px-8 flex flex-col items-center"
      style={{
        background: 'linear-gradient(90deg, #9898FA 0%, #65658D 100%)',
      }}
    >
      <h2 className="text-2xl sm:text-3xl capitalize font-bold text-white mb-10 text-center max-w-xl mx-auto">
        A platform that delivers results
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 w-full max-w-6xl">
        {stats.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between items-center bg-white rounded-lg p-5 sm:p-6 w-full max-w-[258px] h-[230px] mx-auto text-center shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-xl"
          >
            <p className="text-sm text-gray-600 mb-4">{item.preText}</p>
            <h3 className="text-3xl sm:text-4xl font-bold text-[#65658D] mb-2">
              {counts[idx]}
              {item.suffix}
            </h3>
            <p className="text-sm text-gray-500">{item.postText}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PlatformStats;