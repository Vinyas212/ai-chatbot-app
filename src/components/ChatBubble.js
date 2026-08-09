// src/components/ChatBubble.js
//
// A single message bubble. Shows an image thumbnail or document chip if
// attached. Long-press to copy text. AI replies get a speaker icon to
// read the message aloud using free on-device text-to-speech.

import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';

export default function ChatBubble({ message }) {
  const isUser = message.role === 'user';
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopy = async () => {
    if (!message.content) return;
    await Clipboard.setStringAsync(message.content);
    Alert.alert('Copied', 'Message copied to clipboard');
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }
    Speech.speak(message.content, {
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
    setIsSpeaking(true);
  };

  return (
    <View
      style={[
        styles.bubbleRow,
        { justifyContent: isUser ? 'flex-end' : 'flex-start' },
      ]}
    >
      <TouchableOpacity
        style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}
        onLongPress={handleCopy}
        activeOpacity={0.8}
      >
        {message.image ? (
          <Image source={{ uri: message.image }} style={styles.image} />
        ) : null}

        {message.documentName ? (
          <View style={styles.docChip}>
            <Ionicons
              name="document-text-outline"
              size={18}
              color={isUser ? '#FFFFFF' : '#111827'}
            />
            <Text
              style={[styles.docName, isUser ? styles.userText : styles.aiText]}
              numberOfLines={1}
            >
              {message.documentName}
            </Text>
          </View>
        ) : null}

        {message.content ? (
          <Text style={isUser ? styles.userText : styles.aiText}>
            {message.content}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          <View style={styles.metaLeft}>
            {!isUser && message.source ? (
              <Text style={styles.sourceTag}>via {message.source}</Text>
            ) : null}
            {!isUser && message.content ? (
              <TouchableOpacity onPress={handleToggleSpeak} style={styles.speakerBtn}>
                <Ionicons
                  name={isSpeaking ? 'volume-high' : 'volume-medium-outline'}
                  size={14}
                  color="#6B7280"
                />
              </TouchableOpacity>
            ) : null}
          </View>
          {message.time ? (
            <Text
              style={[
                styles.timeText,
                isUser ? styles.timeTextUser : styles.timeTextAi,
              ]}
            >
              {message.time}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bubbleRow: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  bubble: {
    maxWidth: '80%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  userBubble: {
    backgroundColor: '#2D2D2D',
    borderColor: '#2D2D2D',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
    borderBottomLeftRadius: 4,
  },
  userText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  aiText: {
    color: '#000000',
    fontSize: 15,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 6,
  },
  docChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    maxWidth: 180,
  },
  docName: {
    marginLeft: 6,
    fontSize: 13,
    flexShrink: 1,
  },
  sourceTag: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speakerBtn: {
    marginLeft: 6,
    padding: 2,
  },
  timeText: {
    fontSize: 10,
  },
  timeTextUser: {
    color: 'rgba(255,255,255,0.7)',
  },
  timeTextAi: {
    color: '#9CA3AF',
  },
});