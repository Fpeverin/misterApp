// app/eventi/partita/[id].tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalendarEvent, STORAGE_KEY } from '../../../data/events';

export default function PartitaDettaglio() {
 const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
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

  if (!event) {
    return (
      <View style={styles.container}>
        <Text>Evento non trovato</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Partita vs {event.opponent || ''}</Text>
      <Text>{event.date} · {event.time} · {event.location}</Text>

      <View style={styles.buttons}>
        <Pressable
          style={styles.button}
          onPress={() => router.push({ pathname: '/eventi/partita/[id]/formazione', params: { id } })}
        >
          <Text style={styles.buttonText}>Formazione</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => router.push({ pathname: '/eventi/partita/[id]/tattiche', params: { id } })}
        >
          <Text style={styles.buttonText}>Tattiche</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => router.push({ pathname: '/eventi/partita/[id]/live', params: { id } })}
        >
          <Text style={styles.buttonText}>Live</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  buttons: { marginTop: 16, gap: 12 },
  button: { backgroundColor: '#1b7f3b', padding: 12, borderRadius: 6 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: '700' },
});
