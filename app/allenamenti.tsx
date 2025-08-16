import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { CalendarEvent, STORAGE_KEY } from './data/events';

export default function Allenamenti() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const loadEvents = async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const list: CalendarEvent[] = raw ? JSON.parse(raw) : [];
    setEvents(list.filter(e => e.type === 'ALLENAMENTO'));
  };

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tutti gli Allenamenti</Text>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>Nessun allenamento trovato</Text>}
        renderItem={({ item }) => (
          <View style={styles.eventCard}>
            <Text style={styles.eventTitle}>{item.location}</Text>
            <Text>{item.date} · {item.time}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  eventCard: {
    backgroundColor: '#eee',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  eventTitle: { fontWeight: '700', marginBottom: 2 },
});
