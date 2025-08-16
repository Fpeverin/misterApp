// app/eventi/allenamento/[id].tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalendarEvent, STORAGE_KEY } from '../../../data/events';
import { players } from '../../../data/players';

export default function AllenamentoDettaglio() {
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [presenze, setPresenze] = useState<Record<string, boolean>>({});
  const [tema, setTema] = useState('');

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const list: CalendarEvent[] = JSON.parse(raw);
        const found = list.find(ev => ev.id === id);
        if (found) {
          setEvent(found);
          setPresenze(found.presenze || {});
          setTema(found.temaAllenamento || '');
        }
      }
    })();
  }, [id]);

  const togglePresenza = (playerId: string) => {
    setPresenze(prev => {
      const updated = { ...prev, [playerId]: !prev[playerId] };
      save(updated, tema);
      return updated;
    });
  };

  const save = async (newPresenze: Record<string, boolean>, newTema: string) => {
    if (!event) return;
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const list: CalendarEvent[] = JSON.parse(raw);
    const updated = list.map(ev =>
      ev.id === event.id ? { ...ev, presenze: newPresenze, tema: newTema } : ev
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <View style={styles.container}>
      {event ? (
        <>
          <Text style={styles.title}>Allenamento</Text>
          <Text>{event.date} · {event.time} · {event.location}</Text>

          <Text style={styles.subtitle}>Tema allenamento</Text>
          <TextInput
            style={styles.input}
            value={tema}
            onChangeText={(t) => { setTema(t); save(presenze, t); }}
            placeholder="Inserisci tema..."
          />

          <Text style={styles.subtitle}>Presenze</Text>
          <FlatList
            data={players}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable style={styles.presenzaRow} onPress={() => togglePresenza(item.id)}>
                <Text>{item.name}</Text>
                <Text>{presenze[item.id] ? '✅' : '⬜'}</Text>
              </Pressable>
            )}
          />
        </>
      ) : (
        <Text>Evento non trovato</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, fontWeight: '700', marginTop: 16, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 },
  presenzaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
});
