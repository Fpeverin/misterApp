import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function GestioneSquadra() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestione Squadra</Text>

      <Pressable style={styles.button} onPress={() => router.push('/squadra/rosa')}>
        <Text style={styles.buttonText}>📋 Rosa</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={() => router.push('/squadra/formazione')}>
        <Text style={styles.buttonText}>📝 Formazioni</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={() => router.push('/squadra/tattiche')}>
        <Text style={styles.buttonText}>📐 Tattiche</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  button: {
    backgroundColor: '#1b7f3b',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10
  },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' }
});
