import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, ScrollView, TextInput } from 'react-native';

export default function PatientInfoScreen({ route, navigation }: any) {
  const { departmentId, doctorId, appointmentDate, appointmentTime } = route.params;
  
  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    patientDob: '',
    patientGender: 'Nam',
    symptoms: ''
  });

  const handleNext = () => {
    if (!formData.patientName || !formData.patientPhone || !formData.patientDob) {
      return alert('Vui lòng điền đủ thông tin bắt buộc (Tên, SĐT, Ngày sinh)!');
    }
    
    navigation.navigate('Payment', { 
      formData: { ...formData, departmentId, doctorId, appointmentDate, appointmentTime }, 
      amount: 150000 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backBtn}>← Quay lại</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Thông Tin Bệnh Nhân</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.label}>Họ và tên *</Text>
        <TextInput style={styles.input} placeholder="Ví dụ: Nguyễn Văn A" placeholderTextColor="#9CA3AF" value={formData.patientName} onChangeText={t => setFormData({...formData, patientName: t})} />
        
        <Text style={styles.label}>Số điện thoại *</Text>
        <TextInput style={styles.input} keyboardType="phone-pad" placeholder="09xxxxxxxx" placeholderTextColor="#9CA3AF" value={formData.patientPhone} onChangeText={t => setFormData({...formData, patientPhone: t})} />
        
        <Text style={styles.label}>Năm sinh *</Text>
        <TextInput style={styles.input} keyboardType="numeric" placeholder="Ví dụ: 1990" placeholderTextColor="#9CA3AF" value={formData.patientDob} onChangeText={t => setFormData({...formData, patientDob: t})} />
        
        <Text style={styles.label}>Triệu chứng</Text>
        <TextInput style={[styles.input, {height: 80, textAlignVertical: 'top'}]} multiline placeholder="Mô tả triệu chứng..." placeholderTextColor="#9CA3AF" value={formData.symptoms} onChangeText={t => setFormData({...formData, symptoms: t})} />
      </ScrollView>
      <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
        <Text style={styles.nextBtnText}>Xác nhận & Thanh toán</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { backgroundColor: '#059669', padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20 },
  backBtn: { color: '#D1FAE5', fontSize: 16, marginBottom: 10 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  content: { flex: 1, padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#FFF', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB', color: '#111827' },
  nextBtn: { backgroundColor: '#059669', padding: 15, margin: 20, borderRadius: 12, alignItems: 'center' },
  nextBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
