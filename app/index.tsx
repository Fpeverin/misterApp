import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalendarEvent, STORAGE_KEY } from './data/events';

type FilterType =
  | 'ALL_FUTURE'
  | 'PARTITA_FUTURE'
  | 'ALLENAMENTO_FUTURE'
  | 'ALL_PARTITE'
  | 'ALL_ALLENAMENTI';

export default function Dashboard() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filter, setFilter] = useState<FilterType>('ALL_FUTURE');

  const loadEvents = async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const list: CalendarEvent[] = raw ? JSON.parse(raw) : [];

    const now = new Date();

    // Ordina sempre per data/ora crescente
    const sorted = list.sort((a, b) => {
      const da = `${a.date} ${a.time}`;
      const db = `${b.date} ${b.time}`;
      return da.localeCompare(db);
    });

    setEvents(sorted);
  };

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [])
  );

  const filteredEvents = events.filter(ev => {
    const dateTime = new Date(`${ev.date}T${ev.time || '00:00'}`);
    switch (filter) {
      case 'ALL_FUTURE':
        return dateTime >= new Date();
      case 'PARTITA_FUTURE':
        return ev.type === 'PARTITA' && dateTime >= new Date();
      case 'ALLENAMENTO_FUTURE':
        return ev.type === 'ALLENAMENTO' && dateTime >= new Date();
      case 'ALL_PARTITE':
        return ev.type === 'PARTITA';
      case 'ALL_ALLENAMENTI':
        return ev.type === 'ALLENAMENTO';
      default:
        return true;
    }
  });

  const handleEventPress = (event: CalendarEvent) => {
    if (event.type === 'PARTITA') {
      router.push(`/eventi/partita/${event.id}`);
    } else if (event.type === 'ALLENAMENTO') {
      router.push(`/eventi/allenamento/${event.id}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER CON TITOLO E + */}
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/calendario?addEvent=true')}
        >
          <Text style={{ color: 'white', fontSize: 24 }}>+</Text>
        </Pressable>
      </View>

      {/* FILTRI FUTURI */}
      <View style={styles.filterRow}>
        <Pressable
          style={[styles.filterBtn, filter === 'ALL_FUTURE' && styles.filterBtnActive]}
          onPress={() => setFilter('ALL_FUTURE')}
        >
          <Text style={styles.filterText}>Tutti (futuri)</Text>
        </Pressable>
        <Pressable
          style={[styles.filterBtn, filter === 'PARTITA_FUTURE' && styles.filterBtnActive]}
          onPress={() => setFilter('PARTITA_FUTURE')}
        >
          <Text style={styles.filterText}>Partite</Text>
        </Pressable>
        <Pressable
          style={[styles.filterBtn, filter === 'ALLENAMENTO_FUTURE' && styles.filterBtnActive]}
          onPress={() => setFilter('ALLENAMENTO_FUTURE')}
        >
          <Text style={styles.filterText}>Allenamenti</Text>
        </Pressable>
      </View>

      {/* FILTRI TUTTI (INCLUSE PASSATE) */}
      <View style={styles.filterRow}>
        <Pressable
          style={[styles.filterBtn, filter === 'ALL_PARTITE' && styles.filterBtnActive]}
          onPress={() => setFilter('ALL_PARTITE')}
        >
          <Text style={styles.filterText}>Tutte le Partite</Text>
        </Pressable>
        <Pressable
          style={[styles.filterBtn, filter === 'ALL_ALLENAMENTI' && styles.filterBtnActive]}
          onPress={() => setFilter('ALL_ALLENAMENTI')}
        >
          <Text style={styles.filterText}>Tutti gli Allenamenti</Text>
        </Pressable>
      </View>

      {/* LISTA EVENTI */}
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{ color: '#666' }}>Nessun evento</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.eventCard} onPress={() => handleEventPress(item)}>
            <Text style={styles.eventTitle}>
              {item.type === 'PARTITA'
                ? `PARTITA vs ${item.opponent || ''}`
                : 'ALLENAMENTO'}
            </Text>
            <Text>{item.date} · {item.time} · {item.location}</Text>
          </Pressable>
        )}
      />

      {/* BOTTONI EXTRA */}
      <View style={styles.buttons}>
        <Pressable style={styles.button} onPress={() => router.push('/calendario')}>
          <Text style={styles.buttonText}>Calendario Completo</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={() => router.push('/squadra')}>
          <Text style={styles.buttonText}>Gestione Squadra</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700' },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: '#1b7f3b',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12, flexWrap: 'wrap', gap: 8 },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#1b7f3b',
    borderRadius: 6,
  },
  filterBtnActive: { backgroundColor: '#1b7f3b' },
  filterText: { fontWeight: '700', color: '#1b7f3b' },
  eventCard: {
    backgroundColor: '#eee',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  eventTitle: { fontWeight: '700', marginBottom: 2 },
  buttons: { marginTop: 16, gap: 12 },
  button: {
    backgroundColor: '#1b7f3b',
    padding: 12,
    borderRadius: 6,
  },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: '700' },
});
