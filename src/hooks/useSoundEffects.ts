import { useEffect, useRef, useState } from 'react';

type SoundType = 'click' | 'select' | 'place' | 'error' | 'victory';

const soundUrls: Record<SoundType, string> = {
  click: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hZGQg+mtzyxHkpBSl+zPLaizsIHGm98OScTgwPUKzn77RgGwY7k9n0yn4qBSh+0PLaiDwIHm3A8uSaTAwOUK7p77RgGwc9ltn0yoAqBSh/0PLah',
  select: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAgICAgICAgICAgICAgICBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hZGQg+mtzyxHkpBSl+zPLaizsIHGm98OScTgwPUKzn77RgGwY7k9n0yn4qBSh+0PLaiDwIHm3A8uSaTAwOUK7p77RgGwc9ltn0yoAq',
  place: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAAB/f39/f39/f4CAgICAgICBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hZGQg+mtzyxHkpBSl+zPLaizsIHGm98OScTgwPUKzn77RgGwY7k9n0yn4qBSh+0PLaiDwIHm3A8uSaTAwOUK7p77RgGwc9ltn0',
  error: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAAAD/AID/AID//wAAAP8AgP8AgP//AAB/f39/f4CAgICBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hZGQg+mtzyxHkpBSl+zPLaizsIHGm98OScTgwPUKzn77RgGwY7k9n0yn4qBSh+0P',
  victory: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hZGQg+mtzyxHkpBSl+zPLaizsIHGm98OScTgwPUKzn77RgGwY7k9n0yn4qBSh+0PLaiDwIHm3A8uSaTAwOUK7p77RgGwc9ltn0yoAqBSh/0PLaiDwJHm7B8+WbTQ0PUa/q'
};

export const useSoundEffects = () => {
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContext.current?.close();
    };
  }, []);

  const playSound = (type: SoundType) => {
    if (isMuted || !audioContext.current) return;

    const audio = new Audio(soundUrls[type]);
    audio.volume = volume;
    audio.play().catch(() => {});
  };

  return {
    playSound,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    toggleMute: () => setIsMuted(prev => !prev)
  };
};