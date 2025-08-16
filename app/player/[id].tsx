// app/player/[id].tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Image, Button, FlatList, Pressable, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { players, Player } from '../data/players';

const PHOTO_KEY = 'players/photos';
const ATTACH_KEY_PREFIX = 'players/attachments/';

export default function PlayerDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();

  const base = players.find(p => p.id === id) as Player | undefined;

  const [photo, setPhoto] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<{ name: string; uri: string }[]>([]);

  useEffect(() => {
    navigation.setOptions({ title: base?.name ?? 'Giocatore' });
  }, [navigation, base?.name]);

  // Carica dati da storage
  useEffect(() => {
    (async () => {
      try {
        const photosRaw = await AsyncStorage.getItem(PHOTO_KEY);
        if (photosRaw) {
          const map = JSON.parse(photosRaw);
          if (map[id!]) setPhoto(map[id!]);
        }
        const attRaw = await AsyncStorage.getItem(ATTACH_KEY_PREFIX + id);
        if (attRaw) setAttachments(JSON.parse(attRaw));
      } catch (e) {
        console.warn('Errore caricamento dati giocatore', e);
      }
    })();
  }, [id]);

  const savePhoto = async (uri: string | null) => {
    try {
      const photosRaw = await AsyncStorage.getItem(PHOTO_KEY);
      const map = photosRaw ? JSON.parse(photosRaw) : {};
      map[id!] = uri;
      await AsyncStorage.setItem(PHOTO_KEY, JSON.stringify(map));
      setPhoto(uri);
    } catch (e) {
      Alert.alert('Errore', 'Impossibile salvare la foto');
    }
  };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permessi', 'Serve il permesso per accedere alle foto.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });
    if (!res.canceled) {
      savePhoto(res.assets[0].uri);
    }
  };

  const addAttachment = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (!res.canceled && res.assets?.length) {
      const file = res.assets[0];
      const newAtts = [...attachments, { name: file.name ?? 'Senza nome', uri: file.uri }];
      setAttachments(newAtts);
      await AsyncStorage.setItem(ATTACH_KEY_PREFIX + id, JSON.stringify(newAtts));
    }
  };

  const removeAttachment = async (uri: string) => {
    const newAtts = attachments.filter(a => a.uri !== uri);
    setAttachments(newAtts);
    await AsyncStorage.setItem(ATTACH_KEY_PREFIX + id, JSON.stringify(newAtts));
  };

  if (!base) {
    return (
      <View style={styles.center}>
        <Text>Giocatore non trovato.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* FOTO */}
      <View style={styles.photoBox}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photo} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={{ fontSize: 32 }}>👤</Text>
          </View>
        )}
        <Button title={photo ? 'Cambia foto' : 'Aggiungi foto'} onPress={pickPhoto} />
      </View>

      {/* DATI GIOCATORE */}
      <View>
        <Text style={styles.name}>{base.name}</Text>
        <Text>Anno: {base.year}</Text>
        <Text>Ruolo: {base.role}</Text>
      </View>

      {/* ALLEGATI */}
      <View style={{ flex: 1 }}>
        <Text style={styles.attachTitle}>Allegati</Text>
        <Button title="Aggiungi allegato" onPress={addAttachment} />
        <FlatList
          style={{ marginTop: 8 }}
          data={attachments}
          keyExtractor={(item) => item.uri}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <View style={styles.attachRow}>
              <Text style={{ flex: 1 }}>{item.name}</Text>
              <Pressable onPress={() => removeAttachment(item.uri)}>
                <Text style={{ fontWeight: '600', color: 'red' }}>Rimuovi</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: '#666' }}>Nessun allegato</Text>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, padding: 16, gap: 16 },
  photoBox: { alignItems: 'center', gap: 12 },
  photo: { width: 140, height: 140, borderRadius: 70 },
  placeholder: {
    width: 140, height: 140, borderRadius: 70, backgroundColor: '#ddd',
    alignItems: 'center', justifyContent: 'center',
  },
  name: { fontSize: 20, fontWeight: '700' },
  attachTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  attachRow: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
