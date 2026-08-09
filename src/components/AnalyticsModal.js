// src/components/AnalyticsModal.js
//
// A simple analytics dashboard built entirely with Views (no charting
// library needed, so no extra dependency risk). Shows: total chats/
// messages, a 7-day message bar chart, and an OpenAI vs Gemini usage
// split.

import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function getLastNDates(n) {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function formatDayLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export default function AnalyticsModal({ visible, onClose, sessions }) {
  const allMessages = sessions.flatMap((s) => s.messages);
  const totalChats = sessions.length;
  const totalMessages = allMessages.length;
  const userMessageCount = allMessages.filter((m) => m.role === 'user').length;
  const aiMessageCount = allMessages.filter((m) => m.role === 'assistant').length;

  const modelCounts = {};
  allMessages.forEach((m) => {
    if (m.role === 'assistant' && m.source) {
      const key = m.source.startsWith('Gemini') ? 'Gemini' : m.source;
      modelCounts[key] = (modelCounts[key] || 0) + 1;
    }
  });
  const modelEntries = Object.entries(modelCounts);
  const modelTotal = modelEntries.reduce((sum, [, c]) => sum + c, 0);

  const last7 = getLastNDates(7);
  const perDayCounts = last7.map((date) => ({
    date,
    count: allMessages.filter((m) => m.date === date).length,
  }));
  const maxDayCount = Math.max(1, ...perDayCounts.map((d) => d.count));

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Chat Analytics</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.statRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{totalChats}</Text>
                <Text style={styles.statLabel}>Chats</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{totalMessages}</Text>
                <Text style={styles.statLabel}>Messages</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{userMessageCount}</Text>
                <Text style={styles.statLabel}>You sent</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{aiMessageCount}</Text>
                <Text style={styles.statLabel}>AI replies</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Messages, last 7 days</Text>
            <View style={styles.chartRow}>
              {perDayCounts.map((d) => (
                <View key={d.date} style={styles.barColumn}>
                  <View
                    style={[
                      styles.bar,
                      { height: 6 + (d.count / maxDayCount) * 80 },
                    ]}
                  />
                  <Text style={styles.barValue}>{d.count}</Text>
                  <Text style={styles.barLabel}>{formatDayLabel(d.date)}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>AI model usage</Text>
            {modelTotal === 0 ? (
              <Text style={styles.emptyText}>No AI replies yet</Text>
            ) : (
              <View>
                <View style={styles.stackedBar}>
                  {modelEntries.map(([name, count], idx) => (
                    <View
                      key={name}
                      style={{
                        flex: count,
                        backgroundColor: idx === 0 ? '#2D2D2D' : '#9CA3AF',
                        height: '100%',
                      }}
                    />
                  ))}
                </View>
                <View style={styles.legendRow}>
                  {modelEntries.map(([name, count], idx) => (
                    <View key={name} style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendSwatch,
                          { backgroundColor: idx === 0 ? '#2D2D2D' : '#9CA3AF' },
                        ]}
                      />
                      <Text style={styles.legendText}>
                        {name} ({Math.round((count / modelTotal) * 100)}%)
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 17, fontWeight: '600', color: '#111827' },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: 20, fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 10,
    marginTop: 4,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 130,
    marginBottom: 24,
  },
  barColumn: { alignItems: 'center', flex: 1 },
  bar: {
    width: 18,
    backgroundColor: '#2D2D2D',
    borderRadius: 4,
  },
  barValue: { fontSize: 10, color: '#374151', marginTop: 4 },
  barLabel: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  stackedBar: {
    flexDirection: 'row',
    height: 18,
    borderRadius: 9,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 6,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: { fontSize: 12, color: '#374151' },
  emptyText: { fontSize: 13, color: '#9CA3AF', marginBottom: 20 },
});