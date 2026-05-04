import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import DoctorScreen from './src/screens/DoctorScreen';
import DateTimePickerScreen from './src/screens/DateTimePickerScreen';
import PatientInfoScreen from './src/screens/PatientInfoScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import SuccessScreen from './src/screens/SuccessScreen';

export type RootStackParamList = {
  Home: undefined;
  Doctor: { departmentId: string };
  DateTimePicker: { departmentId: string; doctorId: string };
  PatientInfo: { departmentId: string; doctorId: string; appointmentDate: string; appointmentTime: string };
  Payment: { formData: any; amount: number };
  Success: { appointmentId: string; stt: number; message: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Doctor" component={DoctorScreen} />
        <Stack.Screen name="DateTimePicker" component={DateTimePickerScreen} />
        <Stack.Screen name="PatientInfo" component={PatientInfoScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="Success" component={SuccessScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
