import { Animated, View, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { createSlideInAnimation } from '../utils/animations';

export default function AnimatedCard({ children, delay = 0, style }) {
  const { translateY, opacity, animate } = createSlideInAnimation(500, 30);

  useEffect(() => {
    const timer = setTimeout(() => {
      animate();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
