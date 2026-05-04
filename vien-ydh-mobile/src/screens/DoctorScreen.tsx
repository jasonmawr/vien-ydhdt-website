import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import axios from 'axios';

const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:4000/api' : 'http://localhost:4000/api';

export default function DoctorScreen({ route, navigation }: any) {
  const { departmentId } = route.params;
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${API_URL}/doctors?departmentId=${departmentId}`);
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (error) {
      console.error('Lỗi lấy danh sách bác sĩ:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDoctor = (doctorId: string) => {
    navigation.navigate('DateTimePicker', { departmentId, doctorId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn Bác Sĩ</Text>
      </View>
      <View style={styles.content}>
        <TouchableOpacity style={styles.card} onPress={() => handleSelectDoctor('any')}>
          <Text style={styles.cardTitle}>Khám bác sĩ bất kỳ</Text>
          <Text style={styles.cardDesc}>Hệ thống sẽ tự động sắp xếp bác sĩ phù hợp</Text>
        </TouchableOpacity>
        {loading ? (
          <ActivityIndicator size="large" color="#059669" />
        ) : (
          <FlatList
            data={doctors}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.card} onPress={() => handleSelectDoctor(item.id.toString())}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardDesc}>{item.specialty || 'Chuyên khoa'}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { backgroundColor: '#059669', padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20 },
  backBtn: { color: '#D1FAE5', fontSize: 16, marginBottom: 10 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  content: { flex: 1, padding: 20 },
  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  cardDesc: { fontSize: 14, color: '#6B7280', marginTop: 4 },
});
