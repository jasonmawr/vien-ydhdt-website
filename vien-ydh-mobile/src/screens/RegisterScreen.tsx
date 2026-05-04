import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';

export default function RegisterScreen({ navigation }: any) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleRegister = () => {
    if (!formData.fullName || !formData.phone || !formData.password) {
      alert('Vui lòng điền đủ thông tin');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }
    // Sau này sẽ nối API đăng ký
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Quay lại</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🏥</Text>
          <Text style={styles.appName}>Tạo Tài Khoản</Text>
          <Text style={styles.subText}>Thành viên Viện Y Dược</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Họ và tên</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ví dụ: Nguyễn Văn A" 
            placeholderTextColor="#9CA3AF"
            value={formData.fullName}
            onChangeText={(t) => setFormData({...formData, fullName: t})}
          />

          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput 
            style={styles.input} 
            placeholder="09xxxxxxxx" 
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(t) => setFormData({...formData, phone: t})}
          />

          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Tối thiểu 6 ký tự" 
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={formData.password}
            onChangeText={(t) => setFormData({...formData, password: t})}
          />

          <Text style={styles.label}>Xác nhận mật khẩu</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Nhập lại mật khẩu" 
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={formData.confirmPassword}
            onChangeText={(t) => setFormData({...formData, confirmPassword: t})}
          />

          <TouchableOpacity style={styles.loginBtn} onPress={handleRegister}>
            <Text style={styles.loginBtnText}>Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { flexGrow: 1, padding: 30, justifyContent: 'center' },
  header: { position: 'absolute', top: 40, left: 20, zIndex: 10 },
  backBtn: { fontSize: 16, color: '#059669', fontWeight: 'bold' },
  logoContainer: { alignItems: 'center', marginBottom: 40, marginTop: 40 },
  logoText: { fontSize: 60 },
  appName: { fontSize: 24, fontWeight: 'bold', color: '#059669', marginTop: 10 },
  subText: { color: '#6B7280', fontSize: 14, marginTop: 5 },
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#F3F4F6', padding: 15, borderRadius: 12, marginBottom: 15, fontSize: 16, color: '#111827' },
  loginBtn: { backgroundColor: '#059669', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  loginBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
