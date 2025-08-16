import { Stack } from 'expo-router';

export default function SquadraLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: 'Gestione Squadra' }} />
      <Stack.Screen name="rosa" options={{ title: 'Rosa' }} />
      <Stack.Screen name="formazioni" options={{ title: 'Formazioni' }} />
      <Stack.Screen name="tattiche" options={{ title: 'Tattiche' }} />
    </Stack>
  );
}
