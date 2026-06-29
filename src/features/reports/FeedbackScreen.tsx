import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/ButtonId';
import { Input } from '@/components/ui/Input';
import { reportService } from '@/api/reports/service';
import type { RootStackParamList } from '@/app/router1';

type Props = NativeStackScreenProps<RootStackParamList, 'Feedback'>;

export function FeedbackScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await reportService.feedback(id, { rating, comment });
      Alert.alert('Terima kasih', 'Feedback berhasil dikirim.');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Gagal', e?.message || 'Feedback gagal dikirim.');
    } finally { setLoading(false); }
  };

  return (
    <Screen>
      <Text 
       testID="feedback-title"
      accessibilityLabel="feedback-title"
      style={{ fontWeight: '900', fontSize: 18 }}>Rating</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {[1,2,3,4,5].map((r) => 
        <Pressable 
         testID={`feedback-rating-${r}`}
          accessibilityLabel={`feedback-rating-${r}`}
        key={r} onPress={() => setRating(r)}><Text style={{ fontSize: 32 }}>{r <= rating ? '⭐' : '☆'}</Text></Pressable>)}
      </View>
      <Input 
            testID="feedback-comment-input"
      accessibilityLabel="feedback-comment-input"
      label="Komentar" value={comment} onChangeText={setComment} multiline numberOfLines={4} />
      <Button 
        testID="feedback-submit-button"
      accessibilityLabel="feedback-submit-button"
      title="Kirim Feedback" onPress={submit} loading={loading} />
    </Screen>
  );
}
