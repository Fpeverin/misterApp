import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Modal, Alert } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import uuid from 'react-native-uuid';
import { CalendarEvent, EventType, STORAGE_KEY } from './data/events';

export default function Calendario() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // form state (senza title)
  const [type, setType] = useState<EventType>('PARTITA');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [opponent, setOpponent] = useState(''); // solo per PARTITA

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        setEvents(raw ? JSON.parse(raw) : []);
      })();
    }, [])
  );

  const saveEvents = async (list: CalendarEvent[]) => {
    setEvents(list);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const onDayPress = (day: DateData) => setSelectedDate(day.dateString);

  const openAddModal = () => {
    setEditingId(null);
    setType('PARTITA');
    setTime('');
    setLocation('');
    setOpponent('');
    setModalVisible(true);
  };

  const openEditModal = (ev: CalendarEvent) => {
    setEditingId(ev.id);
    setType(ev.type);
    setTime(ev.time);
    setLocation(ev.location);
    setOpponent(ev.opponent ?? '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    // validazione minima
    if (!time.trim() || !location.trim()) {
      Alert.alert('Dati mancanti', 'Inserisci almeno ora e luogo.');
      return;
    }
    if (type === 'PARTITA' && !opponent.trim()) {
      Alert.alert('Dati mancanti', 'Per una PARTITA serve anche l\'avversario.');
      return;
    }

    const base: CalendarEvent = {
      id: editingId ?? (uuid.v4() as string),
      type,
      date: selectedDate,
      time,
      location,
      opponent: type === 'PARTITA' ? opponent.trim() : undefined,
    };

    const updated = editingId
      ? events.map(e => (e.id === editingId ? base : e))
      : [...events, base];

    await saveEvents(updated);
    setModalVisible(false);
  };

  const handleDelete = async (id: string) => {
    const updated = events.filter(e => e.id !== id);
    await saveEvents(updated);
    setModalVisible(false);
  };

  const eventsForDay = events.filter(e => e.date === selectedDate);

  // markedDates
  const marked = events.reduce<Record<string, any>>((acc, e) => {
    acc[e.date] = acc[e.date] || { marked: true, dots: [] };
    acc[e.date].marked = true;
    acc[e.date].dotColor = e.type === 'PARTITA' ? 'red' : 'blue';
    return acc;
  }, {});
  marked[selectedDate] = { ...(marked[selectedDate] || {}), selected: true, selectedColor: '#1b7f3b' };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendario</Text>

      <Calendar
        onDayPress={onDayPress}
        markedDates={marked}
        theme={{ selectedDayBackgroundColor: '#1b7f3b', arrowColor: '#1b7f3b' }}
      />

      <View style={styles.list}>
        <Text style={styles.subtitle}>Eventi del {selectedDate}</Text>
        <FlatList
          data={eventsForDay}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={{ color: '#666' }}>Nessun evento</Text>}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => openEditModal(item)}>
              <Text style={styles.cardTitle}>
                {item.type === 'PARTITA' ? `PARTITA vs ${item.opponent}` : 'ALLENAMENTO'}
              </Text>
              <Text>{item.location} · {item.time}</Text>
            </Pressable>
          )}
        />
      </View>

      <Pressable style={styles.addBtn} onPress={openAddModal}>
        <Text style={styles.addText}>+ Aggiungi</Text>
      </Pressable>

      {/* MODALE */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editingId ? 'Modifica evento' : 'Nuovo evento'}</Text>

            {/* Tipo */}
            <View style={styles.typeRow}>
              {(['PARTITA', 'ALLENAMENTO'] as EventType[]).map(t => (
                <Pressable
                  key={t}
                  style={[styles.typeBtn, type === t && styles.typeBtnActive]}
                  onPress={() => setType(t)}
                >
                  <Text style={[styles.typeText, type === t && styles.typeTextActive]}>{t}</Text>
                </Pressable>
              ))}
            </View>

            {/* Avversario solo per PARTITA */}
            {type === 'PARTITA' && (
              <TextInput
                style={styles.input}
                placeholder="Avversario"
                value={opponent}
                onChangeText={setOpponent}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Luogo"
              value={location}
              onChangeText={setLocation}
            />
            <TextInput
              style={styles.input}
              placeholder="Orario (es. 18:30)"
              value={time}
              onChangeText={setTime}
            />

            <View style={styles.actions}>
              {editingId && (
                <Pressable style={styles.deleteBtn} onPress={() => handleDelete(editingId)}>
                  <Text style={styles.actionText}>Elimina</Text>
                </Pressable>
              )}
              <Pressable style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.actionText}>Salva</Text>
              </Pressable>
              <Pressable style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text>Annulla</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 10 },
  subtitle: { fontSize: 18, fontWeight: '600', marginVertical: 8 },
  list: { flex: 1, marginTop: 8 },
  card: { padding: 10, backgroundColor: '#eee', borderRadius: 8, marginBottom: 8 },
  cardTitle: { fontWeight: '700', marginBottom: 2 },
  addBtn: { backgroundColor: '#1b7f3b', padding: 12, borderRadius: 6, marginTop: 8 },
  addText: { color: 'white', textAlign: 'center', fontWeight: '700' },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: 'white', width: '86%', borderRadius: 10, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },

  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  typeBtn: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#eee', borderRadius: 6 },
  typeBtnActive: { backgroundColor: '#1b7f3b' },
  typeText: { fontWeight: '600' },
  typeTextActive: { color: '#fff' },

  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, marginBottom: 10 },

  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  deleteBtn: { backgroundColor: '#b22222', padding: 10, borderRadius: 6 },
  saveBtn: { backgroundColor: '#1b7f3b', padding: 10, borderRadius: 6 },
  cancelBtn: { padding: 10 },
  actionText: { color: 'white', fontWeight: '700' },
});
