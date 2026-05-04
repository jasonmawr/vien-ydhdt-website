import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import axios from 'axios';

// Dành cho Android Emulator truy cập localhost của máy host
// Với iOS Simulator thì dùng http://localhost:4000/api
// Nếu dùng máy thật, thay bằng IP LAN (vd: http://192.168.1.x:4000/api)
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:4000/api' : 'http://localhost:4000/api';

export default function HomeScreen({ navigation }: any) {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API_URL}/departments`);
      if (res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (error) {
      console.error('Lỗi lấy danh sách chuyên khoa:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => console.log('Navigate to Booking with dept:', item.id)}
    >
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Viện Y Dược Học Dân Tộc</Text>
        <Text style={styles.headerSubtitle}>Đặt lịch khám bệnh trực tuyến</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Chuyên khoa khám</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#059669" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={departments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#059669', // Emerald-600
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#D1FAE5', // Emerald-100
    fontSize: 14,
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 15,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cardDesc: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 20,
  },
});
