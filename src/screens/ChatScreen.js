// src/screens/ChatScreen.js
//
// Main screen: input box, message list, send button, loading/error
// handling, multi-chat support, timestamps, image/document attachments,
// analytics dashboard, and voice input (record → transcribe via Groq).

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import {
  useAudioRecorder,
  useAudioRecorderState,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
} from 'expo-audio';

import ChatBubble from '../components/ChatBubble';
import AnalyticsModal from '../components/AnalyticsModal';
import TypingIndicator from '../components/TypingIndicator';
import AnimatedGradientBorder from '../components/AnimatedGradientBorder';
import { getAIResponse } from '../services/aiService';
import { transcribeAudio } from '../services/voiceService';
import { loadSessions, saveSessions, createEmptySession } from '../utils/storage';

function getCurrentTime() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

function getCurrentDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function ChatScreen() {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [analyticsModalVisible, setAnalyticsModalVisible] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [pendingDocument, setPendingDocument] = useState(null);
  const flatListRef = useRef(null);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [isTranscribing, setIsTranscribing] = useState(false);

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        console.log('Microphone permission not granted yet — will ask again on first mic tap.');
      }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const saved = await loadSessions();
      if (saved.length === 0) {
        const first = createEmptySession();
        setSessions([first]);
        setActiveSessionId(first.id);
      } else {
        setSessions(saved);
        setActiveSessionId(saved[0].id);
      }
      setIsHistoryLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (isHistoryLoaded) {
      saveSessions(sessions);
    }
  }, [sessions, isHistoryLoaded]);

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = activeSession ? activeSession.messages : [];

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access to attach images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      setPendingDocument(null);
      setPendingImage({
        uri: asset.uri,
        base64: asset.base64,
        mimeType: asset.mimeType || 'image/jpeg',
      });
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || !result.assets[0]) return;

      const asset = result.assets[0];
      const mimeType = asset.mimeType || '';

      if (mimeType.includes('pdf')) {
        const base64 = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setPendingImage(null);
        setPendingDocument({
          uri: asset.uri,
          name: asset.name,
          mimeType: 'application/pdf',
          base64,
        });
      } else {
        const textContent = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        setPendingImage(null);
        setPendingDocument({
          uri: asset.uri,
          name: asset.name,
          mimeType: 'text/plain',
          textContent,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Could not read that document. Try a PDF or .txt file.');
    }
  };

  const handleMicPress = async () => {
    if (recorderState.isRecording) {
      try {
        await audioRecorder.stop();
        const uri = audioRecorder.uri;
        if (!uri) {
          Alert.alert('Error', 'No recording captured. Please try again.');
          return;
        }
        setIsTranscribing(true);
        const transcribedText = await transcribeAudio(uri);
        setInputText((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText));
      } catch (error) {
        Alert.alert('Transcription failed', error.message);
      } finally {
        setIsTranscribing(false);
      }
      return;
    }

    const status = await AudioModule.requestRecordingPermissionsAsync();
    if (!status.granted) {
      Alert.alert('Permission needed', 'Please allow microphone access to use voice input.');
      return;
    }

    try {
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (error) {
      Alert.alert('Error', 'Could not start recording. Please try again.');
    }
  };

  const handleAttachPress = () => {
    Alert.alert('Attach', 'What would you like to attach?', [
      { text: 'Photo', onPress: handlePickImage },
      { text: 'Document (PDF / .txt)', onPress: handlePickDocument },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleRemoveAttachment = () => {
    setPendingImage(null);
    setPendingDocument(null);
  };

  const handleSend = useCallback(async () => {
    const trimmed = inputText.trim();
    if ((!trimmed && !pendingImage && !pendingDocument) || isLoading || !activeSessionId) return;

    const userMessage = {
      role: 'user',
      content: trimmed,
      time: getCurrentTime(),
      date: getCurrentDate(),
      image: pendingImage ? pendingImage.uri : undefined,
      documentName: pendingDocument ? pendingDocument.name : undefined,
    };

    let contentForAI = trimmed;
    if (pendingDocument?.textContent) {
      contentForAI = `${trimmed}\n\n[Attached document: ${pendingDocument.name}]\n${pendingDocument.textContent}`;
    }

    const currentSession = sessions.find((s) => s.id === activeSessionId);
    const updatedMessages = [...(currentSession?.messages || []), userMessage];
    const updatedMessagesForAI = [
      ...(currentSession?.messages || []),
      { ...userMessage, content: contentForAI },
    ];

    const attachmentForAI = pendingImage
      ? { base64: pendingImage.base64, mimeType: pendingImage.mimeType }
      : pendingDocument?.base64
      ? { base64: pendingDocument.base64, mimeType: pendingDocument.mimeType }
      : null;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              messages: updatedMessages,
              title:
                s.messages.length === 0
                  ? (trimmed || pendingDocument?.name || 'Image').slice(0, 30)
                  : s.title,
              updatedAt: Date.now(),
            }
          : s
      )
    );
    setInputText('');
    setPendingImage(null);
    setPendingDocument(null);
    setIsLoading(true);

    try {
      const { text: aiReplyText, source } = await getAIResponse(
        updatedMessagesForAI,
        attachmentForAI
      );
      const aiMessage = {
        role: 'assistant',
        content: aiReplyText,
        source,
        time: getCurrentTime(),
        date: getCurrentDate(),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, aiMessage], updatedAt: Date.now() }
            : s
        )
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, activeSessionId, sessions, pendingImage, pendingDocument]);

  const handleNewChat = () => {
    const newSession = createEmptySession();
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleSwitchSession = (id) => {
    setActiveSessionId(id);
    setHistoryModalVisible(false);
  };

  const handleDeleteSession = (id) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (filtered.length === 0) {
        const fresh = createEmptySession();
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (id === activeSessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const confirmDeleteSession = (id) => {
    Alert.alert('Delete chat', 'Delete this conversation? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => handleDeleteSession(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Assistant</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setHistoryModalVisible(true)}
          >
            <Ionicons name="time-outline" size={22} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setAnalyticsModalVisible(true)}
          >
            <Ionicons name="bar-chart-outline" size={22} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn} onPress={handleNewChat}>
            <Ionicons name="add-circle-outline" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Say hi to start chatting with your AI assistant 👋
            </Text>
          }
          ListFooterComponent={isLoading ? <TypingIndicator /> : null}
        />

        {pendingImage ? (
          <View style={styles.previewRow}>
            <Image source={{ uri: pendingImage.uri }} style={styles.previewImage} />
            <TouchableOpacity style={styles.previewRemoveBtn} onPress={handleRemoveAttachment}>
              <Ionicons name="close-circle" size={22} color="#2D2D2D" />
            </TouchableOpacity>
          </View>
        ) : null}

        {pendingDocument ? (
          <View style={styles.previewRow}>
            <View style={styles.previewDocChip}>
              <Ionicons name="document-text-outline" size={20} color="#374151" />
              <Text style={styles.previewDocName} numberOfLines={1}>
                {pendingDocument.name}
              </Text>
            </View>
            <TouchableOpacity style={styles.previewRemoveBtnDoc} onPress={handleRemoveAttachment}>
              <Ionicons name="close-circle" size={22} color="#2D2D2D" />
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.attachButton} onPress={handleAttachPress}>
            <Ionicons name="add-circle-outline" size={24} color="#374151" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.micButton, recorderState.isRecording && styles.micButtonActive]}
            onPress={handleMicPress}
            disabled={isTranscribing}
          >
            {isTranscribing ? (
              <Ionicons name="hourglass-outline" size={20} color="#374151" />
            ) : (
              <Ionicons
                name={recorderState.isRecording ? 'stop-circle' : 'mic-outline'}
                size={22}
                color={recorderState.isRecording ? '#DC2626' : '#374151'}
              />
            )}
          </TouchableOpacity>

          <AnimatedGradientBorder
            borderRadius={22}
            borderWidth={2}
            style={styles.inputBorderWrapper}
          >
            <TextInput
              style={styles.input}
              placeholder="Type a message…"
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
          </AnimatedGradientBorder>
          <TouchableOpacity
            style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={isLoading}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={historyModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chats</Text>
              <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={[...sessions].sort((a, b) => b.updatedAt - a.updatedAt)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.sessionRow,
                    item.id === activeSessionId && styles.sessionRowActive,
                  ]}
                  onPress={() => handleSwitchSession(item.id)}
                  onLongPress={() => confirmDeleteSession(item.id)}
                >
                  <Text style={styles.sessionTitle} numberOfLines={1}>
                    {item.title || 'New chat'}
                  </Text>
                  <Text style={styles.sessionMeta}>
                    {item.messages.length} message{item.messages.length !== 1 ? 's' : ''}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No chats yet</Text>
              }
            />
            <Text style={styles.modalHint}>Tap to open · Long-press to delete</Text>
          </View>
        </View>
      </Modal>

      <AnalyticsModal
        visible={analyticsModalVisible}
        onClose={() => setAnalyticsModalVisible(false)}
        sessions={sessions}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  headerIconBtn: { marginLeft: 16 },
  listContent: { paddingVertical: 12, flexGrow: 1 },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 40,
    fontSize: 15,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  previewRemoveBtn: {
    marginLeft: -12,
    marginTop: -30,
    backgroundColor: '#FFFFFF',
    borderRadius: 11,
  },
  previewDocChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    maxWidth: 220,
  },
  previewDocName: {
    marginLeft: 6,
    fontSize: 13,
    color: '#111827',
    flexShrink: 1,
  },
  previewRemoveBtnDoc: {
    marginLeft: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  micButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  micButtonActive: {
    backgroundColor: '#FEE2E2',
    borderRadius: 20,
  },
  input: {
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
  },
  inputBorderWrapper: {
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#2D2D2D',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#A5A6F6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: { fontSize: 17, fontWeight: '600', color: '#111827' },
  sessionRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  sessionRowActive: {
    backgroundColor: '#F3F4F6',
  },
  sessionTitle: { fontSize: 15, color: '#111827', fontWeight: '500' },
  sessionMeta: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  modalHint: {
    textAlign: 'center',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 8,
  },
});