import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '@/contexts/AppContext';
import { AlertProvider, AuthProvider } from '@/template';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <AppProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen 
                name="subject/[id]" 
                options={{ 
                  headerShown: true,
                  title: 'Subject Details',
                  headerBackTitle: 'Back',
                }} 
              />
              <Stack.Screen
                name="add-subject"
                options={{
                  presentation: 'modal',
                  headerShown: true,
                  title: 'Add Subject',
                }}
              />
              <Stack.Screen
                name="profile-setup"
                options={{
                  presentation: 'modal',
                  headerShown: true,
                  title: 'Complete Your Profile',
                }}
              />
            </Stack>
          </AppProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
