import { Animated, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function AnimatedNotification({ 
  message, 
  type = 'success', 
  duration = 3000,
  onClose 
}) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto close
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose?.();
    });
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return { bg: '#d4edda', text: '#155724', icon: 'checkmark-circle' };
      case 'error':
        return { bg: '#f8d7da', text: '#721c24', icon: 'close-circle' };
      case 'warning':
        return { bg: '#fff3cd', text: '#856404', icon: 'warning' };
      case 'info':
        return { bg: '#d1ecf1', text: '#0c5460', icon: 'information-circle' };
      default:
        return { bg: '#e2e3e5', text: '#383d41', icon: 'information-circle' };
    }
  };

  const colors = getColors();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
          backgroundColor: colors.bg,
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name={colors.icon} size={24} color={colors.text} />
        <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      </View>
      <TouchableOpacity onPress={handleClose}>
        <Ionicons name="close" size={20} color={colors.text} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});
