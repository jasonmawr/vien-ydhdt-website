import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, Image, ActivityIndicator } from 'react-native';
import axios from 'axios';

const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:4000/api' : 'http://localhost:4000/api';

export default function PaymentScreen({ route, navigation }: any) {
  const { formData, amount } = route.params;
  const [qrUrl, setQrUrl] = useState('');
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateQR();
  }, []);

  const generateQR = async () => {
    try {
      const res = await axios.post(`${API_URL}/payment/generate-qr`, {
        amount,
        orderInfo: `Kham benh ${formData.patientPhone}`
      });
      if (res.data.success) {
        setQrUrl(res.data.data.qrCodeUrl);
        setOrderId(res.data.data.orderId);
      }
    } catch (error) {
      console.error('Lỗi tạo mã QR:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulatePaymentSuccess = async () => {
    try {
      setLoading(true);
      const result = await axios.post(`${API_URL}/appointments`, formData);
      if (result.data.success) {
        navigation.replace('Success', {
          appointmentId: result.data.data?.id || orderId,
          stt: result.data.data?.stt || 0,
          message: result.data.message
        });
      }
    } catch (err) {
      alert('Lỗi khi lưu lịch khám');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backBtn}>← Quay lại</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán VietQR</Text>
      </View>
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#059669" />
        ) : (
          <View style={styles.qrContainer}>
            <Text style={styles.amountText}>Số tiền: {amount.toLocaleString()} VNĐ</Text>
            {qrUrl ? (
              <Image source={{ uri: qrUrl }} style={styles.qrImage} resizeMode="contain" />
            ) : <Text>Không thể tải QR</Text>}
            <Text style={styles.instructions}>Mở App Ngân hàng trên điện thoại để quét mã QR và thanh toán.</Text>
            
            <TouchableOpacity style={styles.demoBtn} onPress={simulatePaymentSuccess}>
              <Text style={styles.demoBtnText}>(Bấm để giả lập Webhook thành công)</Text>
            </TouchableOpacity>
          </View>
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
  content: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  qrContainer: { backgroundColor: '#FFF', padding: 20, borderRadius: 16, alignItems: 'center', elevation: 3, width: '100%' },
  amountText: { fontSize: 20, fontWeight: 'bold', color: '#DC2626', marginBottom: 20 },
  qrImage: { width: 250, height: 250, marginBottom: 20 },
  instructions: { color: '#4B5563', textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  demoBtn: { backgroundColor: '#3B82F6', padding: 12, borderRadius: 8, marginTop: 10 },
  demoBtnText: { color: '#FFF', fontWeight: 'bold' }
});
