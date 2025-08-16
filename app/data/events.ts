// app/data/events.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export type EventType = 'PARTITA' | 'ALLENAMENTO';

export interface CalendarEvent {
  id: string;
  type: EventType;
  date: string;        // YYYY-MM-DD
  time: string;        // HH:mm
  location: string;
  opponent?: string;   // solo per PARTITA

  // Dati legati al singolo evento:
  formation?: any;                       // la tua struttura che salvi per la formazione
  tattiche?: string;                     // note/testo
  presenze?: Record<string, boolean>;    // allenamento: playerId -> presente
  temaAllenamento?: string;              // allenamento: tema della seduta
}

export const STORAGE_KEY = 'calendar/events';

export async function loadEvents(): Promise<CalendarEvent[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const list: any[] = JSON.parse(raw);

  // Migrazione soft: garantisco campi minimi
  return list.map((e) => ({
    id: String(e.id),
    type: (e.type === 'Partita' || e.type === 'PARTITA') ? 'PARTITA'
        : (e.type === 'Allenamento' || e.type === 'ALLENAMENTO') ? 'ALLENAMENTO'
        : 'ALLENAMENTO',                     // default prudente
    date: e.date ?? '',                      // aspettato YYYY-MM-DD
    time: e.time ?? '00:00',                 // default se assente
    location: e.location ?? '',
    opponent: e.opponent ?? undefined,
    formation: e.formation ?? undefined,
    tattiche: e.tattiche ?? undefined,
    presenze: e.presenze ?? undefined,
    temaAllenamento: e.temaAllenamento ?? undefined,
  }));
}

export async function saveEvents(events: CalendarEvent[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}
