import { Animated, View, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { createRotateAnimation, createPulseAnimation } from '../utils/animations';

export default function AnimatedLoader({ size = 50, color = '#8B4513' }) {
  const { rotateInterpolate, animate: animateRotate } = createRotateAnimation(1500);
  const { opacity, animate: animatePulse } = createPulseAnimation(1000);

  useEffect(() => {
    animateRotate();
    animatePulse();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.loader,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: size / 10,
            borderColor: color,
            transform: [{ rotate: rotateInterpolate }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.pulse,
          {
            width: size * 1.5,
            height: size * 1.5,
            borderRadius: (size * 1.5) / 2,
            opacity,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  pulse: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#8B4513',
  },
});
