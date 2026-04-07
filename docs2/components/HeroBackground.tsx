import { useEffect, useState } from 'react';

export const HeroBackground = ({ isDark }: { isDark: boolean }) => {
  const [elements, setElements] = useState<{ id: number; top: string; left: string; delay: string; duration: string; scale: number }[]>([]);

  useEffect(() => {
    const newElements = Array.from({ length: isDark ? 25 : 8 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: isDark ? `${Math.random() * 100}%` : `${-10 + Math.random() * 20}%`,
      delay: `${Math.random() * 5}s`,
      duration: isDark ? `${3 + Math.random() * 4}s` : `${20 + Math.random() * 20}s`,
      scale: 0.5 + Math.random() * 1,
    }));
    setElements(newElements);
  }, [isDark]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {elements.map((el) => (
        <div
          key={el.id}
          className="absolute opacity-0"
          style={{
            top: el.top,
            left: el.left,
            animation: isDark 
              ? `firefly-float ${el.duration} infinite alternate ease-in-out ${el.delay}`
              : `float-cloud ${el.duration} infinite linear ${el.delay}`,
          }}
        >
          {isDark ? (
            <div 
              className="w-1 h-1 rounded-full" 
              style={{ 
                backgroundColor: '#FBBF24',
                boxShadow: '0 0 6px 1px rgba(251, 191, 36, 0.6)',
                transform: `scale(${el.scale * 0.5})`
              }} 
            />
          ) : (
            <div 
              className="relative w-32 h-20 drop-shadow-sm"
              style={{ 
                transform: `scale(${el.scale})`,
                opacity: 0.9
              }}
            >
              <div className="absolute bottom-0 w-32 h-12 bg-white rounded-full"></div>
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-white rounded-full"></div>
              <div className="absolute bottom-2 left-12 w-20 h-20 bg-white rounded-full"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
