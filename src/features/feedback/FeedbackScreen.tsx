import React, { useState } from 'react';
import { View } from 'react-native';
import { Text, TextInput, IconButton } from 'react-native-paper';
import { Screen, AppButton } from '@components/AppPrimitives';
import { submitFeedback } from '@services/feedbackService';

export const FeedbackScreen: React.FC = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);
    await submitFeedback(rating, comment);
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <Screen>
      <Text variant="titleLarge" style={{ marginBottom: 8 }}>
        Geri Bildirim
      </Text>
      <Text variant="bodyMedium" style={{ marginBottom: 16, opacity: 0.85 }}>
        DentiScan deneyiminizi 1–5 arasında puanlayın ve kısa bir yorum bırakın. Veriler sadece bu
        cihazda demo amaçlı saklanır.
      </Text>

      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <IconButton
            key={star}
            icon={star <= rating ? 'star' : 'star-outline'}
            onPress={() => setRating(star)}
          />
        ))}
      </View>

      <TextInput
        mode="outlined"
        label="Yorum (opsiyonel)"
        multiline
        value={comment}
        onChangeText={setComment}
        style={{ marginBottom: 16 }}
      />

      <AppButton
        label={submitted ? 'Teşekkürler!' : 'Gönder'}
        onPress={handleSubmit}
        loading={submitting}
        disabled={submitting || !rating}
      />
    </Screen>
  );
};

