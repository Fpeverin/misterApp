// app/eventi/partita/tattiche.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalendarEvent, STORAGE_KEY } from '../../../data/events';

export default function TatticheEvento() {
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [tattiche, setTattiche] = useState('');

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const list: CalendarEvent[] = JSON.parse(raw);
        const found = list.find(ev => ev.id === id);
        if (found) {
          setEvent(found);
          setTattiche(found.tattiche || '');
        }
      }
    })();
  }, [id]);

  const save = async (newTattiche: string) => {
    if (!event) return;
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const list: CalendarEvent[] = JSON.parse(raw);
    const updated = list.map(ev => ev.id === event.id ? { ...ev, tattiche: newTattiche } : ev);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tattiche – {event?.opponent || 'Evento'}</Text>
      <TextInput
        style={styles.input}
        multiline
        value={tattiche}
        onChangeText={(t) => { setTattiche(t); save(t); }}
        placeholder="Scrivi qui le note tattiche..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, textAlignVertical: 'top' },
});
