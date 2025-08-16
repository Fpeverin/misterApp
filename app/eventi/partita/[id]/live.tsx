import React, { useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, Image } from 'react-native';
import { players } from '../../../data/players';

export default function Live() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Ref per il timer con tipo corretto
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      timerRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
  };

  const stopTimer = () => {
    if (isRunning && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setIsRunning(false);
    }
  };

  const resetTimer = () => {
    stopTimer();
    setSeconds(0);
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LIVE Match</Text>

      {/* Cronometro */}
      <Text style={styles.timer}>{formatTime(seconds)}</Text>

      <View style={styles.buttonsRow}>
        <Pressable style={styles.btn} onPress={startTimer}>
          <Text style={styles.btnText}>Start</Text>
        </Pressable>
        <Pressable style={styles.btn} onPress={stopTimer}>
          <Text style={styles.btnText}>Stop</Text>
        </Pressable>
        <Pressable style={styles.btn} onPress={resetTimer}>
          <Text style={styles.btnText}>Reset</Text>
        </Pressable>
      </View>

      {/* Formazione attuale */}
      <Text style={styles.sectionTitle}>Formazione Attuale</Text>
      <FlatList
        data={players}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.playerRow}>
            <Image source={{ uri: item.photo ?? '' }} style={styles.avatar} />
            <Text style={styles.playerName}>{item.name}</Text>
          </View>
        )}
      />

      {/* Tattiche attuali */}
      <Text style={styles.sectionTitle}>Tattiche</Text>
      <Text style={{ color: 'white' }}>Qui puoi mostrare la tattica salvata per la partita</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1b7f3b', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 12 },
  timer: { fontSize: 48, fontWeight: 'bold', color: 'white', marginBottom: 16, textAlign: 'center' },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  btn: { backgroundColor: '#444', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  btnText: { color: 'white', fontWeight: 'bold' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: 'white', marginVertical: 10 },
  playerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ccc', marginRight: 10 },
  playerName: { color: 'white', fontSize: 16 },
});
