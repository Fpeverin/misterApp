// app/data/players.ts
export type Role = 'PORTIERE' | 'DIFENSORE' | 'CENTROCAMPISTA' | 'ATTACCANTE';

export type Player = {
  id: string;
  name: string;        // Nome e cognome
  year: number;
  role: Role;
  photo?: string | null;      // uri locale o http
  attachments?: { name: string; uri: string }[];
};

export const players: Player[] = [
  // PORTIERI
  { id: 'beccari-gabriele', name: 'BECCARI GABRIELE', year: 2008, role: 'PORTIERE' },
  { id: 'segoloni-riccardo', name: 'SEGOLONI RICCARDO', year: 1988, role: 'PORTIERE' },
  { id: 'liuzza-alessandro', name: 'LIUZZA ALESSANDRO', year: 2007, role: 'PORTIERE' },

  // DIFENSORI
  { id: 'polidori-mattia', name: 'POLIDORI MATTIA', year: 1998, role: 'DIFENSORE' },
  { id: 'morlunghi-alessandro', name: 'MORLUNGHI ALESSANDRO', year: 2005, role: 'DIFENSORE' },
  { id: 'mottola-francesco', name: 'MOTTOLA FRANCESCO', year: 2005, role: 'DIFENSORE' },
  { id: 'vescovi-filippo', name: 'VESCOVI FILIPPO', year: 2005, role: 'DIFENSORE' },
  { id: 'sorbelli-daniele', name: 'SORBELLI DANIELE', year: 2002, role: 'DIFENSORE' },
  { id: 'tarpani-matteo', name: 'TARPANI MATTEO', year: 2006, role: 'DIFENSORE' },
  { id: 'bolletta-marco', name: 'BOLLETTA MARCO', year: 1993, role: 'DIFENSORE' },
  { id: 'giombetti-daniele', name: 'GIOMBETTI DANIELE', year: 2007, role: 'DIFENSORE' },
  { id: 'silvestri-giacomo', name: 'SILVESTRI GIACOMO', year: 2008, role: 'DIFENSORE' },

  // CENTROCAMPISTI
  { id: 'salvucci-thomas', name: 'SALVUCCI THOMAS', year: 1998, role: 'CENTROCAMPISTA' },
  { id: 'convito-michele', name: 'CONVITO MICHELE', year: 2002, role: 'CENTROCAMPISTA' },
  { id: 'paradisi-filippo', name: 'PARADISI FILIPPO', year: 1998, role: 'CENTROCAMPISTA' },
  { id: 'federico-polidoro', name: 'FEDERICO POLIDORO', year: 2002, role: 'CENTROCAMPISTA' },
  { id: 'roticiani-tommaso', name: 'ROTICIANI TOMMASO', year: 2008, role: 'CENTROCAMPISTA' },
  { id: 'sisani-alessio', name: 'SISANI ALESSIO', year: 2007, role: 'CENTROCAMPISTA' },

  // ATTACCANTI
  { id: 'ravanelli-carlo', name: 'RAVANELLI CARLO', year: 2005, role: 'ATTACCANTE' },
  { id: 'vinciarelli-daniele', name: 'VINCIARELLI DANIELE', year: 2002, role: 'ATTACCANTE' },
  { id: 'nuti-francesco', name: 'NUTI FRANCESCO', year: 2006, role: 'ATTACCANTE' },
  { id: 'mariotti-francesco', name: 'MARIOTTI FRANCESCO', year: 2006, role: 'ATTACCANTE' },
  { id: 'massetti-giovanni', name: 'MASSETTI GIOVANNI', year: 2007, role: 'ATTACCANTE' },
  { id: 'mantovani-filippo', name: 'MANTOVANI FILIPPO', year: 2008, role: 'ATTACCANTE' },
];
