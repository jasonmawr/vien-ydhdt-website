import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';

export default function SuccessScreen({ route, navigation }: any) {
  const { appointmentId, stt, message } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>✓</Text>
        </View>
        <Text style={styles.title}>Thanh toán thành công!</Text>
        <Text style={styles.subtitle}>{message}</Text>

        <View style={styles.ticketCard}>
          <Text style={styles.ticketLabel}>Số thứ tự của bạn:</Text>
          <Text style={styles.ticketStt}>{stt}</Text>
          <Text style={styles.ticketId}>Mã vé: {appointmentId}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.homeBtnText}>Về trang chủ</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#059669' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  iconText: { fontSize: 40, color: '#059669', fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#D1FAE5', textAlign: 'center', marginBottom: 40 },
  ticketCard: { backgroundColor: '#FFF', padding: 30, borderRadius: 16, alignItems: 'center', width: '100%', elevation: 5 },
  ticketLabel: { fontSize: 16, color: '#4B5563', marginBottom: 10 },
  ticketStt: { fontSize: 60, fontWeight: 'bold', color: '#059669', marginBottom: 10 },
  ticketId: { fontSize: 14, color: '#9CA3AF' },
  homeBtn: { backgroundColor: '#FFF', padding: 15, margin: 20, borderRadius: 12, alignItems: 'center' },
  homeBtnText: { color: '#059669', fontSize: 16, fontWeight: 'bold' }
});
