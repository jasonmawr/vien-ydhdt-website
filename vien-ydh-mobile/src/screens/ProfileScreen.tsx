import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform, Image, ScrollView } from 'react-native';

export default function ProfileScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hồ sơ của tôi</Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.profileCard}>
          <Image source={{uri: 'https://ui-avatars.com/api/?name=KH&background=059669&color=fff&size=100'}} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>Khách Hàng</Text>
            <Text style={styles.phone}>0987.654.321</Text>
            <TouchableOpacity style={styles.editBtn}>
              <Text style={styles.editBtnText}>Cập nhật thông tin</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Quản lý dịch vụ</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>📋</Text>
            <Text style={styles.menuText}>Lịch sử khám bệnh</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>👨‍👩‍👧</Text>
            <Text style={styles.menuText}>Hồ sơ người thân</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>💳</Text>
            <Text style={styles.menuText}>Thẻ bảo hiểm y tế</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Cài đặt & Hỗ trợ</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>⚙️</Text>
            <Text style={styles.menuText}>Cài đặt hệ thống</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🔒</Text>
            <Text style={styles.menuText}>Đổi mật khẩu</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>📞</Text>
            <Text style={styles.menuText}>Liên hệ CSKH</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={() => navigation.replace('Auth')}>
          <Text style={styles.logoutBtnText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { backgroundColor: '#059669', padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  profileCard: { backgroundColor: '#FFF', margin: 20, padding: 20, borderRadius: 16, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  avatar: { width: 70, height: 70, borderRadius: 35 },
  profileInfo: { marginLeft: 20, flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  phone: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  editBtn: { marginTop: 10, alignSelf: 'flex-start' },
  editBtnText: { color: '#059669', fontSize: 14, fontWeight: '600' },
  menuContainer: { backgroundColor: '#FFF', marginHorizontal: 20, marginBottom: 20, borderRadius: 16, padding: 10, elevation: 1 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#374151', margin: 10, marginBottom: 5 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  menuIcon: { fontSize: 22, width: 35, textAlign: 'center' },
  menuText: { flex: 1, fontSize: 15, color: '#1F2937', marginLeft: 10 },
  chevron: { fontSize: 24, color: '#9CA3AF' },
  logoutBtn: { backgroundColor: '#FEF2F2', padding: 15, marginHorizontal: 20, marginBottom: 40, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#FCA5A5' },
  logoutBtnText: { color: '#DC2626', fontWeight: 'bold', fontSize: 16 }
});
