import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExpertTabs } from '@navigation/tabs/ExpertTabs';
import { ExpertReportDetailScreen } from '@features/expert/ExpertReportDetailScreen';

export type ExpertStackParamList = {
  ExpertTabs: undefined;
  ExpertReportDetail: {
    reportId: string;
  };
};

const Stack = createNativeStackNavigator<ExpertStackParamList>();

export const ExpertNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ExpertTabs"
        component={ExpertTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ExpertReportDetail"
        component={ExpertReportDetailScreen}
        options={{ title: 'Rapor İnceleme' }}
      />
    </Stack.Navigator>
  );
};

