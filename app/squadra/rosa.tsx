// app/(tabs)/giocatori.tsx
import React from 'react';
import { View, Text, SectionList, Image, Pressable, StyleSheet, TextInput, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, Link } from 'expo-router';
import { players, Player } from '../data/players';

const AVATAR_DEFAULT = require('../../assets/avatar.png');
const PHOTO_KEY = 'players/photos';

type Section = { title: string; data: Player[] };

const ROLE_ORDER: Record<string, number> = {
  PORTIERE: 1,
  DIFENSORE: 2,
  CENTROCAMPISTA: 3,
  ATTACCANTE: 4,
};

export default function Giocatori() {
  const [photoMap, setPhotoMap] = React.useState<Record<string, string | null>>({});
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string | 'ALL'>('ALL');
  const [yearFilter, setYearFilter] = React.useState<number | null>(null);

  // ricarica la mappa foto quando la tab torna attiva
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        try {
          const raw = await AsyncStorage.getItem(PHOTO_KEY);
          setPhotoMap(raw ? JSON.parse(raw) : {});
        } catch {
          setPhotoMap({});
        }
      })();
    }, [])
  );

  // crea sezioni filtrate e ordinate
  const sections = React.useMemo(() => {
    const filtered = players
      .filter(p => {
        if (roleFilter !== 'ALL' && p.role !== roleFilter) return false;
        if (yearFilter && p.year !== yearFilter) return false;
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || a.name.localeCompare(b.name));

    const grouped: Record<string, Player[]> = {};
    filtered.forEach(p => {
      if (!grouped[p.role]) grouped[p.role] = [];
      grouped[p.role].push(p);
    });

    return Object.keys(grouped)
      .sort((a, b) => ROLE_ORDER[a] - ROLE_ORDER[b])
      .map(role => ({ title: role, data: grouped[role] })) as Section[];
  }, [search, roleFilter, yearFilter]);

  // estrai anni disponibili
  const years = React.useMemo(() => {
    const set = new Set(players.map(p => p.year));
    return Array.from(set).sort((a, b) => b - a);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* barra ricerca */}
      <TextInput
        placeholder="Cerca giocatore..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {/* filtri */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <FilterChip label="Tutti" active={roleFilter === 'ALL'} onPress={() => setRoleFilter('ALL')} />
        <FilterChip label="Portieri" active={roleFilter === 'PORTIERE'} onPress={() => setRoleFilter('PORTIERE')} />
        <FilterChip label="Difensori" active={roleFilter === 'DIFENSORE'} onPress={() => setRoleFilter('DIFENSORE')} />
        <FilterChip label="Centrocampisti" active={roleFilter === 'CENTROCAMPISTA'} onPress={() => setRoleFilter('CENTROCAMPISTA')} />
        <FilterChip label="Attaccanti" active={roleFilter === 'ATTACCANTE'} onPress={() => setRoleFilter('ATTACCANTE')} />
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <FilterChip label="Tutti anni" active={yearFilter === null} onPress={() => setYearFilter(null)} />
        {years.map(y => (
          <FilterChip key={y} label={String(y)} active={yearFilter === y} onPress={() => setYearFilter(y)} />
        ))}
      </ScrollView>

      {/* lista a sezioni */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}
        renderItem={({ item }) => {
          const uri = photoMap[item.id];
          return (
            <Link
              href={{ pathname: '/player/[id]', params: { id: item.id } }}
              asChild
            >
              <Pressable style={styles.row}>
                <Image
                  source={uri ? { uri } : AVATAR_DEFAULT}
                  style={styles.avatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.meta}>Anno: {item.year} · Ruolo: {item.role}</Text>
                </View>
              </Pressable>
            </Link>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        SectionSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#777', marginTop: 20 }}>Nessun giocatore trovato</Text>}
      />
    </View>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  search: {
    backgroundColor: '#f3f3f3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    margin: 16,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#eee',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#1b7f3b',
  },
  chipText: { fontSize: 14, fontWeight: '600' },
  chipTextActive: { color: 'white' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 12, marginBottom: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#f7f7f7',
  },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  name: { fontSize: 16, fontWeight: '700' },
  meta: { color: '#555' },
});
