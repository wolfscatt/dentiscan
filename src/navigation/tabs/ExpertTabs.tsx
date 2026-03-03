import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ExpertPatientsScreen } from '@features/expert/ExpertPatientsScreen';
import { ExpertProfileScreen } from '@features/expert/ExpertProfileScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type ExpertTabParamList = {
  ExpertPatients: undefined;
  ExpertProfile: undefined;
};

const Tab = createBottomTabNavigator<ExpertTabParamList>();

export const ExpertTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="ExpertPatients"
        component={ExpertPatientsScreen}
        options={{
          title: 'Hastalar',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ExpertProfile"
        component={ExpertProfileScreen}
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="doctor" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

