import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Auth Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

// Tab Screens
import DashboardScreen from './src/screens/DashboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Booking Screens
import HomeScreen from './src/screens/HomeScreen';
import DoctorScreen from './src/screens/DoctorScreen';
import DateTimePickerScreen from './src/screens/DateTimePickerScreen';
import PatientInfoScreen from './src/screens/PatientInfoScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import SuccessScreen from './src/screens/SuccessScreen';

export type RootStackParamList = {
  Auth: undefined;
  Register: undefined;
  MainTabs: undefined;
};

export type BookingStackParamList = {
  Home: undefined;
  Doctor: { departmentId: string };
  DateTimePicker: { departmentId: string; doctorId: string };
  PatientInfo: { departmentId: string; doctorId: string; appointmentDate: string; appointmentTime: string };
  Payment: { formData: any; amount: number };
  Success: { appointmentId: string; stt: number; message: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const BookingStack = createNativeStackNavigator<BookingStackParamList>();
const Tab = createBottomTabNavigator();

// Stack dành riêng cho Luồng Đặt Lịch
function BookingFlow() {
  return (
    <BookingStack.Navigator screenOptions={{ headerShown: false }}>
      <BookingStack.Screen name="Home" component={HomeScreen} />
      <BookingStack.Screen name="Doctor" component={DoctorScreen} />
      <BookingStack.Screen name="DateTimePicker" component={DateTimePickerScreen} />
      <BookingStack.Screen name="PatientInfo" component={PatientInfoScreen} />
      <BookingStack.Screen name="Payment" component={PaymentScreen} />
      <BookingStack.Screen name="Success" component={SuccessScreen} />
    </BookingStack.Navigator>
  );
}

// 4 Tabs chính dưới đáy màn hình
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#059669',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: { paddingBottom: 5, height: 60, paddingTop: 5 },
      }}
    >
      <Tab.Screen 
        name="Trang chủ" 
        component={DashboardScreen} 
        options={{ tabBarIcon: () => <Text style={{fontSize: 20}}>🏠</Text> }}
      />
      <Tab.Screen 
        name="Đặt Khám" 
        component={BookingFlow} 
        options={{ tabBarIcon: () => <Text style={{fontSize: 20}}>📅</Text>, unmountOnBlur: true }}
      />
      <Tab.Screen 
        name="Tin tức" 
        component={DashboardScreen} 
        options={{ tabBarIcon: () => <Text style={{fontSize: 20}}>📰</Text> }}
      />
      <Tab.Screen 
        name="Tài khoản" 
        component={ProfileScreen} 
        options={{ tabBarIcon: () => <Text style={{fontSize: 20}}>👤</Text> }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Auth">
        <Stack.Screen name="Auth" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
