import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '../../context/ThemeContext';

export default function NotificationModal({ visible, onClose }) {
  const { theme } = useTheme();
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotifications();

  const handleClearAll = () => {
    Alert.alert('Clear All', 'Are you sure you want to clear all notifications?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearAll },
    ]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[80%] min-h-[60%]">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b border-slate-200">
            <Text className="text-xl font-bold text-foreground">Notifications</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Actions */}
          <View className="flex-row items-center justify-end gap-3 px-5 py-2 border-b border-slate-100">
            <TouchableOpacity onPress={markAllAsRead} className="flex-row items-center">
              <Ionicons name="checkmark-done" size={16} color="#C1272D" />
              <Text className="text-xs font-bold text-primary ml-1">Mark all read</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClearAll} className="flex-row items-center">
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
              <Text className="text-xs font-bold text-red-500 ml-1">Clear all</Text>
            </TouchableOpacity>
          </View>

          {/* List */}
          <ScrollView className="flex-1 px-4 pt-3">
            {notifications.length === 0 ? (
              <View className="py-12 items-center">
                <Ionicons name="notifications-off-outline" size={48} color="#CCC" />
                <Text className="text-sm text-muted-foreground mt-3">No notifications</Text>
              </View>
            ) : (
              notifications.map((notif) => (
                <TouchableOpacity
                  key={notif.id}
                  className={`p-3 rounded-xl mb-2 border ${notif.read ? 'bg-white border-slate-200' : 'bg-primary/5 border-primary/20'}`}
                  onPress={() => markAsRead(notif.id)}
                >
                  <View className="flex-row items-start">
                    {!notif.read && (
                      <View className="w-2 h-2 rounded-full bg-red-500 mt-1.5 mr-2" />
                    )}
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-foreground">{notif.title}</Text>
                      <Text className="text-sm text-muted-foreground mt-0.5">{notif.body}</Text>
                      <Text className="text-[10px] text-muted-foreground/70 mt-1">
                        {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}