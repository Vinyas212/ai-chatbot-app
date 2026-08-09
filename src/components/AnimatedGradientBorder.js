// src/components/AnimatedGradientBorder.js
//
// A "border beam" effect: a subtle static gray border, plus one bright
// glowing arc that continuously travels around it.

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function AnimatedGradientBorder({
  children,
  borderRadius = 24,
  borderWidth = 2,
  style,
}) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View
      style={[
        styles.outer,
        { borderRadius, borderWidth, borderColor: '#E5E7EB' },
        style,
      ]}
    >
      <Animated.View
        style={[styles.gradientWrapper, { transform: [{ rotate: spin }] }]}
      >
       <LinearGradient
  colors={[
    'rgba(79,70,229,0)',
    'rgba(79,70,229,0)',
    '#4F46E5',
    '#EC4899',
    '#4F46E5',
    'rgba(79,70,229,0)',
    'rgba(79,70,229,0)',
  ]}
  locations={[0, 0.32, 0.42, 0.5, 0.58, 0.68, 1]}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
  style={styles.gradient}
/>
      </Animated.View>

      <View
        style={[
          styles.inner,
          {
            borderRadius: Math.max(borderRadius - borderWidth, 0),
            margin: borderWidth,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    overflow: 'hidden',
    flex: 1,
  },
  gradientWrapper: {
    position: 'absolute',
    top: '-60%',
    left: '-60%',
    width: '220%',
    height: '220%',
  },
  gradient: {
    flex: 1,
  },
  inner: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
});