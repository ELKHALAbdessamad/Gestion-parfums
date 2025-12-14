import { Animated, Easing } from 'react-native';

// Animation de fade in
export const createFadeInAnimation = (duration = 500) => {
  const opacity = new Animated.Value(0);
  
  const animate = () => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  };

  return { opacity, animate };
};

// Animation de slide in
export const createSlideInAnimation = (duration = 500, fromValue = 50) => {
  const translateY = new Animated.Value(fromValue);
  const opacity = new Animated.Value(0);

  const animate = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return { translateY, opacity, animate };
};

// Animation de scale
export const createScaleAnimation = (duration = 300) => {
  const scale = new Animated.Value(0.8);
  const opacity = new Animated.Value(0);

  const animate = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return { scale, opacity, animate };
};

// Animation de rotation
export const createRotateAnimation = (duration = 2000) => {
  const rotation = new Animated.Value(0);

  const animate = () => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return { rotation, rotateInterpolate, animate };
};

// Animation de pulse
export const createPulseAnimation = (duration = 1000) => {
  const opacity = new Animated.Value(1);

  const animate = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  return { opacity, animate };
};

// Animation de bounce
export const createBounceAnimation = (duration = 600) => {
  const translateY = new Animated.Value(0);

  const animate = () => {
    Animated.sequence([
      Animated.timing(translateY, {
        toValue: -20,
        duration: duration / 2,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: duration / 2,
        easing: Easing.bounce,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return { translateY, animate };
};

// Animation de shake
export const createShakeAnimation = (duration = 400) => {
  const translateX = new Animated.Value(0);

  const animate = () => {
    Animated.sequence([
      Animated.timing(translateX, { toValue: -10, duration: duration / 4, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 10, duration: duration / 4, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: -10, duration: duration / 4, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 0, duration: duration / 4, useNativeDriver: true }),
    ]).start();
  };

  return { translateX, animate };
};

// Animation de flip
export const createFlipAnimation = (duration = 600) => {
  const rotateY = new Animated.Value(0);

  const animate = () => {
    Animated.timing(rotateY, {
      toValue: 1,
      duration,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const rotateInterpolate = rotateY.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return { rotateY, rotateInterpolate, animate };
};
