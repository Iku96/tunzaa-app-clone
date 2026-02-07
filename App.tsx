import './global.css';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Image } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 justify-center items-center bg-brand-primary">
      <StatusBar style="light" backgroundColor="#2D3E66" />
      <Image
        source={require('./assets/tunzaa-logo.png')}
        className="w-[185px] h-[185px]"
        resizeMode="contain"
      />
    </View>
  );
}
