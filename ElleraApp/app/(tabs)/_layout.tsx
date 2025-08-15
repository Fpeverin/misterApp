import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="giocatori" options={{ title: 'Giocatori' }} />
      <Tabs.Screen name="formazione" options={{ title: 'Formazione' }} />
      <Tabs.Screen name="tattiche" options={{ title: 'Tattiche' }} />
      <Tabs.Screen name="note" options={{ title: 'Note' }} />
    </Tabs>
  );
}