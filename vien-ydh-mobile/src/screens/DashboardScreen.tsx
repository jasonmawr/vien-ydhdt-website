import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.26:4000/api';

export default function DashboardScreen({ navigation }: any) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_URL}/cms/posts?limit=3`);
      if (res.data.success) {
        setPosts(res.data.data);
      }
    } catch (error) {
      console.error('Lỗi tải tin tức:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Profile */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Xin chào,</Text>
            <Text style={styles.userName}>Khách Hàng</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Tài khoản')}>
            <Image source={{uri: 'https://ui-avatars.com/api/?name=KH&background=059669&color=fff'}} style={styles.avatar} />
          </TouchableOpacity>
        </View>

        {/* Hero Banner */}
        <View style={styles.bannerContainer}>
          <Image 
            source={{uri: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop'}} 
            style={styles.bannerImage} 
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>Chăm sóc sức khỏe toàn diện</Text>
            <Text style={styles.bannerSub}>Đội ngũ y bác sĩ hàng đầu</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Đặt Khám')}>
            <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
              <Text style={{fontSize: 24}}>📅</Text>
            </View>
            <Text style={styles.actionText}>Đặt khám</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Text style={{fontSize: 24}}>💊</Text>
            </View>
            <Text style={styles.actionText}>Đơn thuốc</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEF2F2' }]}>
              <Text style={{fontSize: 24}}>🔬</Text>
            </View>
            <Text style={styles.actionText}>Kết quả</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFFBEB' }]}>
              <Text style={{fontSize: 24}}>🏥</Text>
            </View>
            <Text style={styles.actionText}>Cẩm nang</Text>
          </TouchableOpacity>
        </View>

        {/* News Section */}
        <View style={styles.newsSection}>
          <Text style={styles.sectionTitle}>Tin tức Y tế</Text>
          {loading ? (
            <ActivityIndicator color="#059669" />
          ) : (
            posts.map((post, index) => (
              <TouchableOpacity key={index} style={styles.newsCard}>
                <Image source={{uri: 'https://images.unsplash.com/photo-1504813184591-01572f98c85f?auto=format&fit=crop&w=500'}} style={styles.newsImage} />
                <View style={styles.newsContent}>
                  <Text style={styles.newsTitle} numberOfLines={2}>{post.title}</Text>
                  <Text style={styles.newsDate}>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20 },
  greeting: { color: '#6B7280', fontSize: 14 },
  userName: { color: '#111827', fontSize: 20, fontWeight: 'bold' },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  bannerContainer: { marginHorizontal: 20, borderRadius: 16, overflow: 'hidden', height: 160, marginBottom: 20 },
  bannerImage: { width: '100%', height: '100%' },
  bannerOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 15, backgroundColor: 'rgba(0,0,0,0.4)' },
  bannerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  bannerSub: { color: '#D1FAE5', fontSize: 13, marginTop: 4 },
  actionsGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 25 },
  actionBtn: { alignItems: 'center', width: '22%' },
  iconCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionText: { fontSize: 12, color: '#374151', textAlign: 'center', fontWeight: '500' },
  newsSection: { paddingHorizontal: 20, paddingBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 15 },
  newsCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 12, padding: 10, marginBottom: 12, elevation: 1 },
  newsImage: { width: 80, height: 80, borderRadius: 8 },
  newsContent: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  newsTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 6 },
  newsDate: { fontSize: 12, color: '#9CA3AF' }
});
