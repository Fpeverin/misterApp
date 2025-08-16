// app/(tabs)/formazioni.tsx
import 'react-native-gesture-handler';
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Modal, FlatList, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { players, Player } from '../data/players';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

const PHOTO_KEY = 'players/photos';
const AVATAR_DEFAULT = require('../../assets/avatar.png');

const SCREEN_WIDTH = Dimensions.get('window').width;
const FIELD_HEIGHT = Math.round(Dimensions.get('window').height * 0.6);
const TOKEN_SIZE = 50;

export type Slot = {
  id: string;
  role: Player['role'];
  x: number;
  y: number;
  playerId?: string;
};

/* ---------------------------------------------
   MODULI — coordinate in percentuale (0..100)
   Campo reale: difesa bassa, attacco alto.
---------------------------------------------- */
const MODULES: Record<string, Slot[]> = {
  // 3-1-4-2 con trequartista dietro la linea a 4
  '3-1-4-2': [
    { id: 'GK', role: 'PORTIERE', x: 50, y: 92 },

    { id: 'DF1', role: 'DIFENSORE', x: 20, y: 74 },
    { id: 'DF2', role: 'DIFENSORE', x: 50, y: 74 },
    { id: 'DF3', role: 'DIFENSORE', x: 80, y: 74 },

    { id: 'MF1', role: 'CENTROCAMPISTA', x: 50, y: 62 }, // mediano

    // linea a 4
    { id: 'MF2', role: 'CENTROCAMPISTA', x: 22, y: 50 },
    { id: 'MF5', role: 'CENTROCAMPISTA', x: 40, y: 50 },
    { id: 'MF3', role: 'CENTROCAMPISTA', x: 60, y: 50 },
    { id: 'MF4', role: 'CENTROCAMPISTA', x: 78, y: 50 },

    // trequartista dietro le punte


    { id: 'FW1', role: 'ATTACCANTE', x: 35, y: 22 },
    { id: 'FW2', role: 'ATTACCANTE', x: 65, y: 22 },
  ],

  // 3-4-2-1
  '3-4-2-1': [
    { id: 'GK', role: 'PORTIERE', x: 50, y: 92 },

    { id: 'DF1', role: 'DIFENSORE', x: 20, y: 74 },
    { id: 'DF2', role: 'DIFENSORE', x: 50, y: 74 },
    { id: 'DF3', role: 'DIFENSORE', x: 80, y: 74 },

    { id: 'MF1', role: 'CENTROCAMPISTA', x: 20, y: 56 },
    { id: 'MF2', role: 'CENTROCAMPISTA', x: 40, y: 56 },
    { id: 'MF3', role: 'CENTROCAMPISTA', x: 60, y: 56 },
    { id: 'MF4', role: 'CENTROCAMPISTA', x: 80, y: 56 },

    { id: 'TQ1', role: 'CENTROCAMPISTA', x: 38, y: 36 },
    { id: 'TQ2', role: 'CENTROCAMPISTA', x: 62, y: 36 },

    { id: 'PC', role: 'ATTACCANTE', x: 50, y: 18 },
  ],

  // 4-4-2
  '4-4-2': [
    { id: 'GK', role: 'PORTIERE', x: 50, y: 92 },

    { id: 'DL', role: 'DIFENSORE', x: 12, y: 74 },
    { id: 'DC1', role: 'DIFENSORE', x: 36, y: 74 },
    { id: 'DC2', role: 'DIFENSORE', x: 64, y: 74 },
    { id: 'DR', role: 'DIFENSORE', x: 88, y: 74 },

    { id: 'ML', role: 'CENTROCAMPISTA', x: 18, y: 54 },
    { id: 'MC1', role: 'CENTROCAMPISTA', x: 40, y: 54 },
    { id: 'MC2', role: 'CENTROCAMPISTA', x: 60, y: 54 },
    { id: 'MR', role: 'CENTROCAMPISTA', x: 82, y: 54 },

    { id: 'F1', role: 'ATTACCANTE', x: 42, y: 22 },
    { id: 'F2', role: 'ATTACCANTE', x: 58, y: 22 },
  ],

  // 4-3-3
  '4-3-3': [
    { id: 'GK', role: 'PORTIERE', x: 50, y: 92 },

    { id: 'DL', role: 'DIFENSORE', x: 12, y: 74 },
    { id: 'DC1', role: 'DIFENSORE', x: 36, y: 74 },
    { id: 'DC2', role: 'DIFENSORE', x: 64, y: 74 },
    { id: 'DR', role: 'DIFENSORE', x: 88, y: 74 },

    { id: 'MC', role: 'CENTROCAMPISTA', x: 50, y: 58 },
    { id: 'MS', role: 'CENTROCAMPISTA', x: 32, y: 56 },
    { id: 'MD', role: 'CENTROCAMPISTA', x: 68, y: 56 },

    { id: 'AS', role: 'ATTACCANTE', x: 24, y: 26 },
    { id: 'PC', role: 'ATTACCANTE', x: 50, y: 18 },
    { id: 'AD', role: 'ATTACCANTE', x: 76, y: 26 },
  ],

  // 4-2-3-1
  '4-2-3-1': [
    { id: 'GK', role: 'PORTIERE', x: 50, y: 92 },

    { id: 'DL', role: 'DIFENSORE', x: 12, y: 74 },
    { id: 'DC1', role: 'DIFENSORE', x: 36, y: 74 },
    { id: 'DC2', role: 'DIFENSORE', x: 64, y: 74 },
    { id: 'DR', role: 'DIFENSORE', x: 88, y: 74 },

    { id: 'MDM1', role: 'CENTROCAMPISTA', x: 38, y: 62 },
    { id: 'MDM2', role: 'CENTROCAMPISTA', x: 62, y: 62 },

    { id: 'TQ1', role: 'CENTROCAMPISTA', x: 30, y: 40 },
    { id: 'TQ2', role: 'CENTROCAMPISTA', x: 50, y: 38 },
    { id: 'TQ3', role: 'CENTROCAMPISTA', x: 70, y: 40 },

    { id: 'PC', role: 'ATTACCANTE', x: 50, y: 18 },
  ],

  // 4-3-2-1 (albero di Natale)
  '4-3-2-1': [
    { id: 'GK', role: 'PORTIERE', x: 50, y: 92 },

    { id: 'DL', role: 'DIFENSORE', x: 12, y: 74 },
    { id: 'DC1', role: 'DIFENSORE', x: 36, y: 74 },
    { id: 'DC2', role: 'DIFENSORE', x: 64, y: 74 },
    { id: 'DR', role: 'DIFENSORE', x: 88, y: 74 },

    { id: 'MC1', role: 'CENTROCAMPISTA', x: 35, y: 58 },
    { id: 'REG', role: 'CENTROCAMPISTA', x: 50, y: 58 },
    { id: 'MC2', role: 'CENTROCAMPISTA', x: 65, y: 58 },

    { id: 'TQ1', role: 'CENTROCAMPISTA', x: 42, y: 38 },
    { id: 'TQ2', role: 'CENTROCAMPISTA', x: 57, y: 38 },

    { id: 'PC', role: 'ATTACCANTE', x: 50, y: 18 },
  ],

  // 3-5-2
  '3-5-2': [
    { id: 'GK', role: 'PORTIERE', x: 50, y: 92 },

    { id: 'DF1', role: 'DIFENSORE', x: 20, y: 74 },
    { id: 'DF2', role: 'DIFENSORE', x: 50, y: 74 },
    { id: 'DF3', role: 'DIFENSORE', x: 80, y: 74 },

    { id: 'ES', role: 'CENTROCAMPISTA', x: 16, y: 56 },
    { id: 'MC1', role: 'CENTROCAMPISTA', x: 36, y: 58 },
    { id: 'REG', role: 'CENTROCAMPISTA', x: 50, y: 60 },
    { id: 'MC2', role: 'CENTROCAMPISTA', x: 64, y: 58 },
    { id: 'ED', role: 'CENTROCAMPISTA', x: 84, y: 56 },

    { id: 'AT1', role: 'ATTACCANTE', x: 42, y: 22 },
    { id: 'AT2', role: 'ATTACCANTE', x: 58, y: 22 },
  ],

  // 5-3-2
  '5-3-2': [
    { id: 'GK', role: 'PORTIERE', x: 50, y: 92 },

    { id: 'DL', role: 'DIFENSORE', x: 8, y: 74 },
    { id: 'DC1', role: 'DIFENSORE', x: 28, y: 74 },
    { id: 'LDC', role: 'DIFENSORE', x: 50, y: 76 },
    { id: 'DC2', role: 'DIFENSORE', x: 72, y: 74 },
    { id: 'DR', role: 'DIFENSORE', x: 92, y: 74 },

    { id: 'MC1', role: 'CENTROCAMPISTA', x: 36, y: 56 },
    { id: 'REG', role: 'CENTROCAMPISTA', x: 50, y: 58 },
    { id: 'MC2', role: 'CENTROCAMPISTA', x: 64, y: 56 },

    { id: 'AT1', role: 'ATTACCANTE', x: 42, y: 22 },
    { id: 'AT2', role: 'ATTACCANTE', x: 58, y: 22 },
  ],
};

type PlayerSlotProps = {
  slot: Slot;
  idx: number;
  player?: Player;
  uri?: string;
  onMove: (index: number, newXPercent: number, newYPercent: number) => void;
  onSelectEmpty: (slot: Slot) => void;
};

function PlayerSlot({ slot, idx, player, uri, onMove, onSelectEmpty }: PlayerSlotProps) {
  const x = useSharedValue((slot.x / 100) * SCREEN_WIDTH - TOKEN_SIZE / 2);
  const y = useSharedValue((slot.y / 100) * FIELD_HEIGHT - TOKEN_SIZE / 2);

  const pan = Gesture.Pan()
    .onChange(e => {
      x.value += e.changeX;
      y.value += e.changeY;
    })
    .onEnd(() => {
      const xPercent = ((x.value + TOKEN_SIZE / 2) / SCREEN_WIDTH) * 100;
      const yPercent = ((y.value + TOKEN_SIZE / 2) / FIELD_HEIGHT) * 100;
      onMove(idx, clamp(xPercent, 0, 100), clamp(yPercent, 0, 100));
    });

  const tapEmpty = Gesture.Tap().onEnd(() => onSelectEmpty(slot));

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: withSpring(x.value, { damping: 20, stiffness: 200 }),
    top: withSpring(y.value, { damping: 20, stiffness: 200 }),
    alignItems: 'center',
    width: TOKEN_SIZE,
  }));

  return (
    <GestureDetector gesture={player ? pan : tapEmpty}>
      <Animated.View style={[styles.playerSlot, style]}>
        {player ? (
          <>
            <Image source={uri ? { uri } : AVATAR_DEFAULT} style={styles.avatar} />
            <Text style={styles.playerName} numberOfLines={1}>{player.name}</Text>
          </>
        ) : (
          <Text style={styles.emptyRole}>{shortRole(slot.role)}</Text>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

export default function Formazioni() {
  const [module, setModule] = useState<keyof typeof MODULES>('3-1-4-2');
  const [slots, setSlots] = useState<Slot[]>(MODULES['3-1-4-2']);
  const [photoMap, setPhotoMap] = useState<Record<string, string | null>>({});
  const [pickerSlot, setPickerSlot] = useState<Slot | null>(null);
  const [keepPlayersOnModuleChange, setKeepPlayersOnModuleChange] = useState(false);

  const fieldRef = useRef<ViewShot | null>(null);


  useFocusEffect(
    useCallback(() => {
      (async () => {
        const raw = await AsyncStorage.getItem(PHOTO_KEY);
        setPhotoMap(raw ? JSON.parse(raw) : {});
        await loadFormation(module);
      })();
    }, [module])
  );

  const saveFormation = async (data: Slot[], mod: string) => {
    await AsyncStorage.setItem(`formation/${mod}`, JSON.stringify(data));
  };

  const loadFormation = async (mod: string) => {
    const raw = await AsyncStorage.getItem(`formation/${mod}`);
    setSlots(raw ? (JSON.parse(raw) as Slot[]) : MODULES[mod]);
  };

  const resetFormation = async () => {
    const resetSlots = MODULES[module].map(s => ({ ...s, playerId: undefined, x: s.x, y: s.y }));
    setSlots(resetSlots);
    await saveFormation(resetSlots, module);
  };

  const clearPlayersOnly = async () => {
    const cleared = slots.map(s => ({ ...s, playerId: undefined }));
    setSlots(cleared);
    await saveFormation(cleared, module);
  };

  const filteredPlayers = useMemo(() => {
    if (!pickerSlot) return [];
    const used = new Set(slots.map(s => s.playerId).filter(Boolean) as string[]);
    return players.filter(p => !used.has(p.id));
  }, [pickerSlot, slots]);

  const assignPlayer = (playerId: string) => {
    if (!pickerSlot) return;
    const updated = slots.map(s => (s.id === pickerSlot.id ? { ...s, playerId } : s));
    setSlots(updated);
    saveFormation(updated, module);
    setPickerSlot(null);
  };

  const handleMove = (index: number, newX: number, newY: number) => {
    const updated = [...slots];
    updated[index] = { ...updated[index], x: newX, y: newY };
    setSlots(updated);
    saveFormation(updated, module);
  };

  const snapPlayersToNewModule = (oldSlots: Slot[], newSlots: Slot[]) => {
    const assigned: Slot[] = newSlots.map(s => ({ ...s }));
    const playersToAssign = oldSlots.filter(s => s.playerId);
    playersToAssign.forEach(pSlot => {
      let bestIdx = -1;
      let bestDist = Infinity;
      assigned.forEach((nSlot, idx) => {
        if (!nSlot.playerId) {
          const dx = pSlot.x - nSlot.x;
          const dy = pSlot.y - nSlot.y;
          const dist = dx * dx + dy * dy;
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = idx;
          }
        }
      });
      if (bestIdx >= 0) {
        assigned[bestIdx] = { ...assigned[bestIdx], playerId: pSlot.playerId };
      }
    });
    return assigned;
  };

  const handleChooseModule = (m: keyof typeof MODULES) => {
    if (keepPlayersOnModuleChange) {
      const snapped = snapPlayersToNewModule(slots, MODULES[m]);
      setModule(m);
      setSlots(snapped);
      saveFormation(snapped, m);
    } else {
      setModule(m);
    }
  };

const exportPNG = async () => {
  try {
    if (fieldRef.current && typeof fieldRef.current.capture === 'function') {
      const uri = await fieldRef.current.capture();
      if (uri) {
        await Sharing.shareAsync(uri);
      }
    } else {
      Alert.alert('Errore', 'Il campo non è pronto per l\'esportazione');
    }
  } catch (err) {
    Alert.alert('Errore', 'Impossibile esportare PNG');
  }
};
  const moduleKeys = useMemo(() => Object.keys(MODULES) as (keyof typeof MODULES)[], []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Moduli */}
      <View style={styles.topBar}>
        <View style={styles.moduleRow}>
          {moduleKeys.map(m => (
            <Pressable
              key={m}
              style={[styles.moduleBtn, module === m && styles.moduleBtnActive]}
              onPress={() => handleChooseModule(m)}
            >
              <Text style={[styles.moduleText, module === m && styles.moduleTextActive]}>{m}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Azioni */}
      <View style={styles.actionRow}>
        <Pressable style={styles.resetBtn} onPress={resetFormation}>
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
        <Pressable style={styles.clearBtn} onPress={clearPlayersOnly}>
          <Text style={styles.resetText}>Svuota</Text>
        </Pressable>
        <Pressable style={styles.toggleBtn} onPress={exportPNG}>
          <Text style={styles.resetText}>Esporta PNG</Text>
        </Pressable>
        <Pressable
          style={[styles.toggleBtn, keepPlayersOnModuleChange && styles.toggleBtnActive]}
          onPress={() => setKeepPlayersOnModuleChange(prev => !prev)}
        >
          <Text style={styles.toggleText}>
            Mantieni: {keepPlayersOnModuleChange ? 'ON' : 'OFF'}
          </Text>
        </Pressable>
      </View>

      {/* Campo */}
      <ViewShot ref={fieldRef} options={{ format: 'png', quality: 1.0 }}>
        <View style={styles.field}>
          <View style={styles.midLine} />
          <View style={styles.centerCircle} />
          {slots.map((slot, idx) => {
            const player = players.find(p => p.id === slot.playerId);
            const rawUri = player ? photoMap[player.id] : undefined;
            const uri = rawUri ?? undefined;
            return (
              <PlayerSlot
                key={slot.id}
                slot={slot}
                idx={idx}
                player={player}
                uri={uri}
                onMove={handleMove}
                onSelectEmpty={setPickerSlot}
              />
            );
          })}
        </View>
      </ViewShot>

      {/* Modal scelta giocatore */}
      <Modal visible={!!pickerSlot} animationType="slide" onRequestClose={() => setPickerSlot(null)}>
        <View style={{ flex: 1, padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Seleziona giocatore</Text>
          <FlatList
            data={filteredPlayers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable style={styles.playerRow} onPress={() => assignPlayer(item.id)}>
                <Image
                  source={photoMap[item.id] ? { uri: photoMap[item.id]! } : AVATAR_DEFAULT}
                  style={styles.avatar}
                />
                <Text style={{ flex: 1 }}>{item.name} ({item.year}) · {item.role}</Text>
              </Pressable>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
          <Pressable style={[styles.moduleBtn, { marginTop: 16 }]} onPress={() => setPickerSlot(null)}>
            <Text>Chiudi</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

/* -------- utils & stili -------- */
function clamp(n: number, min: number, max: number) {
  'worklet';
  return Math.max(min, Math.min(max, n));
}
function shortRole(role: Player['role']) {
  switch (role) {
    case 'PORTIERE': return 'GK';
    case 'DIFENSORE': return 'DF';
    case 'CENTROCAMPISTA': return 'MF';
    case 'ATTACCANTE': return 'FW';
    default: return role ?? '';
  }
}

const styles = StyleSheet.create({
  topBar: { marginBottom: 8 },
  moduleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  moduleBtn: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#eee', borderRadius: 6 },
  moduleBtnActive: { backgroundColor: '#1b7f3b' },
  moduleText: { fontWeight: '600' },
  moduleTextActive: { color: 'white' },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  resetBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#b22222', borderRadius: 6 },
  clearBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#d46f00', borderRadius: 6 },
  resetText: { color: 'white', fontWeight: '600' },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#555', borderRadius: 6 },
  toggleBtnActive: { backgroundColor: '#228b22' },
  toggleText: { color: 'white', fontWeight: '600' },
  field: {
    width: '100%',
    height: FIELD_HEIGHT,
    backgroundColor: '#1b7f3b',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#0d5f2b',
  },
  midLine: { position: 'absolute', left: 0, right: 0, top: '50%', height: 2, backgroundColor: 'rgba(255,255,255,0.6)' },
  centerCircle: {
    position: 'absolute', top: '50%', left: '50%', width: 120, height: 120,
    marginLeft: -60, marginTop: -60, borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)', borderRadius: 60,
  },
  playerSlot: { alignItems: 'center' },
  avatar: { width: TOKEN_SIZE, height: TOKEN_SIZE, borderRadius: TOKEN_SIZE / 2, marginBottom: 2, borderWidth: 2, borderColor: 'rgba(0,0,0,0.15)' },
  playerName: { fontSize: 10, textAlign: 'center', color: 'white', fontWeight: '700' },
  emptyRole: { fontSize: 14, color: 'white', textAlign: 'center', fontWeight: '800' },
  playerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
});
