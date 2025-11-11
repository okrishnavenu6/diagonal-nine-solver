import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  life: number;
}

export const ParticleTrail = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  
  useEffect(() => {
    const colors = [
      'hsl(var(--primary))',
      'hsl(var(--accent))',
      'hsl(var(--secondary))',
      '#ff00ff',
      '#00ffff',
      '#ffff00'
    ];
    
    let particleId = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      const newParticle: Particle = {
        id: particleId++,
        x: e.clientX,
        y: e.clientY,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1
      };
      
      setParticles(prev => [...prev, newParticle].slice(-30));
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    const interval = setInterval(() => {
      setParticles(prev => 
        prev
          .map(p => ({ ...p, life: p.life - 0.02 }))
          .filter(p => p.life > 0)
      );
    }, 16);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, []);
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full animate-pulse"
          style={{
            left: particle.x,
            top: particle.y,
            backgroundColor: particle.color,
            opacity: particle.life,
            transform: `scale(${particle.life})`,
            boxShadow: `0 0 ${10 * particle.life}px ${particle.color}`,
            transition: 'opacity 0.3s ease-out'
          }}
        />
      ))}
    </div>
  );
};