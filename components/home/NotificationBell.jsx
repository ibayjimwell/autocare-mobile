import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useNotifications } from '../../context/NotificationContext';
import NotificationModal from './NotificationModal';

export default function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        className="w-11 h-11 rounded-full bg-white/15 border border-white/20 items-center justify-center min-h-[44px] min-w-[44px] relative"
        onPress={() => setModalVisible(true)}
      >
        <Bell size={20} color="#FFFFFF" />
        {unreadCount > 0 && (
          <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center border border-white">
            <Text className="text-[9px] font-black text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      <NotificationModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </>
  );
}