import 'react-native-gesture-handler';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from 'react-redux';
import { store } from '@/store';
import { AuthBootstrap } from "@/app/AuthBootstrap";
import { AppRouter } from '@/app/router';
import { Toaster } from "sonner-native";
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>

      <Provider store={store}>
        <AuthBootstrap>
          <AppRouter />
        </AuthBootstrap>

        <Toaster />
      </Provider>
        </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
