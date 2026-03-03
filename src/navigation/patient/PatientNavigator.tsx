import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PatientTabs } from '@navigation/tabs/PatientTabs';
import { NewAnalysisPhotoScreen } from '@features/reports/NewAnalysisPhotoScreen';
import { AnalysisResultScreen } from '@features/reports/AnalysisResultScreen';
import { AnamnesisFormScreen } from '@features/reports/AnamnesisFormScreen';
import { ReportDetailScreen } from '@features/reports/ReportDetailScreen';
import { FeedbackScreen } from '@features/feedback/FeedbackScreen';

export type PatientStackParamList = {
  PatientTabs: undefined;
  NewAnalysis: undefined;
  AnalysisResult: {
    imageUri: string;
  };
  AnamnesisForm: {
    imageUri: string;
    analysisId: string;
  };
  ReportDetail: {
    reportId: string;
  };
  Feedback: undefined;
};

const Stack = createNativeStackNavigator<PatientStackParamList>();

export const PatientNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PatientTabs"
        component={PatientTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NewAnalysis"
        component={NewAnalysisPhotoScreen}
        options={{ title: 'Yeni Analiz' }}
      />
      <Stack.Screen
        name="AnalysisResult"
        component={AnalysisResultScreen}
        options={{ title: 'Analiz Sonucu' }}
      />
      <Stack.Screen
        name="AnamnesisForm"
        component={AnamnesisFormScreen}
        options={{ title: 'Anamnez Formu' }}
      />
      <Stack.Screen
        name="ReportDetail"
        component={ReportDetailScreen}
        options={{ title: 'Rapor Detayı' }}
      />
      <Stack.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{ title: 'Geri Bildirim' }}
      />
      {/* Feedback ekranı, profil sekmesinden açılacak */}
    </Stack.Navigator>
  );
};

