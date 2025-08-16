// app/eventi/partita/formazione.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalendarEvent, STORAGE_KEY } from '../../../data/events';

export default function FormazioneEvento() {
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const list: CalendarEvent[] = JSON.parse(raw);
        const found = list.find(ev => ev.id === id);
        setEvent(found || null);
      }
    })();
  }, [id]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Formazione – {event?.opponent || 'Evento'}</Text>
      <Text style={{ marginTop: 8 }}>Qui puoi implementare il tuo componente formazioni già esistente.</Text>
      <Text style={{ fontSize: 12, marginTop: 8 }}>
        ⚠ Questa formazione sarà salvata solo in questo evento.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700' },
});
