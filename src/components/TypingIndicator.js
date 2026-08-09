// src/components/TypingIndicator.js
//
// Small "AI is typing..." bubble shown while waiting for a response.

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function TypingIndicator() {
  return (
    <View style={styles.row}>
      <View style={styles.bubble}>
        <ActivityIndicator size="small" color="#6B7280" />
        <Text style={styles.text}>Assistant is typing…</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginVertical: 4,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F1F4',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  text: {
    marginLeft: 8,
    color: '#6B7280',
    fontSize: 13,
    fontStyle: 'italic',
  },
});
