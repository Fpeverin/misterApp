// app/(tabs)/giocatori.tsx
import { View, Text, SectionList, Image, Pressable } from 'react-native';
import { router } from 'expo-router';
import { players, Player } from '../data/players';

const sections = [
  { title: 'PORTIERI', data: players.filter(p => p.role === 'PORTIERE') },
  { title: 'DIFENSORI', data: players.filter(p => p.role === 'DIFENSORE') },
  { title: 'CENTROCAMPISTI', data: players.filter(p => p.role === 'CENTROCAMPISTA') },
  { title: 'ATTACCANTI', data: players.filter(p => p.role === 'ATTACCANTE') },
];

export default function Giocatori() {
  return (
    <View style={{ flex: 1 }}>
      <SectionList
        sections={sections}
        keyExtractor={(item: Player) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderSectionHeader={({ section }) => (
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 16 }}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/player/${item.id}`)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: '#eee',
              gap: 12,
            }}
          >
            {item.photo ? (
              <Image source={{ uri: item.photo }} style={{ width: 48, height: 48, borderRadius: 24 }} />
            ) : (
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: '#ddd',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text>👤</Text>
              </View>
            )}

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
              <Text style={{ color: '#555' }}>
                Anno: {item.year} · Ruolo: {item.role}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
