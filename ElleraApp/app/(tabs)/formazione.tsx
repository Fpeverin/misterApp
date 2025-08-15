import { View, Text } from 'react-native';

export default function Formazione() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Formazione</Text>
      <Text>Seleziona modulo, trascina giocatori nel campo, ecc.</Text>
    </View>
  );
}