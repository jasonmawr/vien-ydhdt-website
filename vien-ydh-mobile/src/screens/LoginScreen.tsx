import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';

export default function LoginScreen({ navigation }: any) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🏥</Text>
          <Text style={styles.appName}>Viện Y Dược</Text>
          <Text style={styles.subText}>Ứng dụng chăm sóc sức khỏe</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Nhập số điện thoại" 
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Nhập mật khẩu" 
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginBtnText}>Đăng nhập</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { flex: 1, padding: 30, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 50 },
  logoText: { fontSize: 60 },
  appName: { fontSize: 28, fontWeight: 'bold', color: '#059669', marginTop: 10 },
  subText: { color: '#6B7280', fontSize: 14, marginTop: 5 },
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#F3F4F6', padding: 15, borderRadius: 12, marginBottom: 20, fontSize: 16, color: '#111827' },
  loginBtn: { backgroundColor: '#059669', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  loginBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  registerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  registerText: { color: '#6B7280', fontSize: 14 },
  registerLink: { color: '#059669', fontSize: 14, fontWeight: 'bold' }
});
