import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, ScrollView } from 'react-native';

export default function DateTimePickerScreen({ route, navigation }: any) {
  const { departmentId, doctorId } = route.params;
  const [selectedDate, setSelectedDate] = useState('2026-05-05');
  const [selectedTime, setSelectedTime] = useState('');

  // Dữ liệu mẫu, thực tế có thể gọi API để lấy giờ trống
  const dates = ['2026-05-05', '2026-05-06', '2026-05-07'];
  const times = ['08:00', '09:00', '10:00', '13:00', '14:00', '15:00'];

  const handleNext = () => {
    if (!selectedTime) return alert('Vui lòng chọn giờ khám!');
    navigation.navigate('PatientInfo', { departmentId, doctorId, appointmentDate: selectedDate, appointmentTime: selectedTime });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backBtn}>← Quay lại</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn Thời Gian</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Ngày khám</Text>
        <View style={styles.grid}>
          {dates.map(d => (
            <TouchableOpacity key={d} style={[styles.box, selectedDate === d && styles.boxSelected]} onPress={() => setSelectedDate(d)}>
              <Text style={selectedDate === d ? styles.textSelected : styles.text}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Giờ khám</Text>
        <View style={styles.grid}>
          {times.map(t => (
            <TouchableOpacity key={t} style={[styles.box, selectedTime === t && styles.boxSelected]} onPress={() => setSelectedTime(t)}>
              <Text style={selectedTime === t ? styles.textSelected : styles.text}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
        <Text style={styles.nextBtnText}>Tiếp tục</Text>
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
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#111827' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  box: { padding: 12, backgroundColor: '#FFF', borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB', width: '30%', marginBottom: 10 },
  boxSelected: { borderColor: '#059669', backgroundColor: '#ECFDF5' },
  text: { textAlign: 'center', color: '#374151' },
  textSelected: { textAlign: 'center', color: '#059669', fontWeight: 'bold' },
  nextBtn: { backgroundColor: '#059669', padding: 15, margin: 20, borderRadius: 12, alignItems: 'center' },
  nextBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
