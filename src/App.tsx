import 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { AuthBootstrap } from "@/app/AuthBootstrap";
import { AppRouter } from '@/app/router';
import { Toaster } from "sonner-native";
export default function App() {
  return (
    <Provider store={store}>
     <AuthBootstrap>
        <AppRouter />
      </AuthBootstrap>
      <Toaster />
    </Provider>
  );
}
