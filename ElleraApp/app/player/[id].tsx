// app/player/[id].tsx
import React from 'react';
import { View, Text, Image, Button, FlatList, Pressable, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { players, Player } from '../data/players';

export default function PlayerDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const nav = useNavigation();

  const base = players.find(p => p.id === id) as Player | undefined;
  const [photo, setPhoto] = React.useState<string | null>(base?.photo ?? null);
  const [attachments, setAttachments] = React.useState<{ name: string; uri: string }[]>(
    base?.attachments ?? []
  );

  React.useEffect(() => {
    nav.setOptions({ title: base?.name ?? 'Giocatore' });
  }, [nav, base?.name]);

  if (!base) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Giocatore non trovato.</Text>
      </View>
    );
  }

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
      setPhoto(res.assets[0].uri);
    }
  };

  const addAttachment = async () => {
    const res = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false, // o true se vuoi più file
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];
        setAttachments(prev => [...prev, { name: file.name ?? 'Senza nome', uri: file.uri }]);
      }
  };

  const removeAttachment = (uri: string) => {
    setAttachments(prev => prev.filter(a => a.uri !== uri));
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 16 }}>
      <View style={{ alignItems: 'center', gap: 12 }}>
        {photo ? (
          <Image source={{ uri: photo }} style={{ width: 140, height: 140, borderRadius: 70 }} />
        ) : (
          <View
            style={{
              width: 140, height: 140, borderRadius: 70, backgroundColor: '#ddd',
              alignItems: 'center', justifyContent: 'center'
            }}
          >
            <Text style={{ fontSize: 32 }}>👤</Text>
          </View>
        )}
        <Button title={photo ? 'Cambia foto' : 'Aggiungi foto'} onPress={pickPhoto} />
      </View>

      <View style={{ gap: 4 }}>
        <Text style={{ fontSize: 20, fontWeight: '700' }}>{base.name}</Text>
        <Text>Anno: {base.year}</Text>
        <Text>Ruolo: {base.role}</Text>
      </View>

      <View style={{ marginTop: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Allegati</Text>
        <Button title="Aggiungi allegato" onPress={addAttachment} />
        <FlatList
          style={{ marginTop: 8 }}
          data={attachments}
          keyExtractor={(item) => item.uri}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <View
              style={{
                padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 12,
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
              }}
            >
              <Text style={{ flex: 1 }}>{item.name}</Text>
              <Pressable onPress={() => removeAttachment(item.uri)}>
                <Text style={{ fontWeight: '600' }}>Rimuovi</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={<Text>Nessun allegato</Text>}
        />
      </View>

      {/* Nota: per persistere localmente potresti usare AsyncStorage o un DB; qui è solo in memoria */}
    </View>
  );
}
