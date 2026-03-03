import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PatientHomeScreen } from '@features/reports/PatientHomeScreen';
import { ReportsListScreen } from '@features/reports/ReportsListScreen';
import { PatientProfileScreen } from '@features/profile/PatientProfileScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type PatientTabParamList = {
  PatientHome: undefined;
  MyReports: undefined;
  PatientProfile: undefined;
};

const Tab = createBottomTabNavigator<PatientTabParamList>();

export const PatientTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="PatientHome"
        component={PatientHomeScreen}
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-variant" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="MyReports"
        component={ReportsListScreen}
        options={{
          title: 'Analizlerim',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-document-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="PatientProfile"
        component={PatientProfileScreen}
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

