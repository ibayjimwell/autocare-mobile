// components/BillingListItem.jsx
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export function EstimateListItem({ item, onPress }) {
  const { theme } = useTheme();
  const vehicle = item.appointment?.vehicle;
  const date = new Date(item.createdAt).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const total = parseFloat(item.grandTotal || 0);

  return (
    <TouchableOpacity
      onPress={onPress}
      className="p-5 rounded-2xl mb-3 border"
      style={{ backgroundColor: theme.background, borderColor: theme.border }}
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-4">
          <View className="flex-row items-center mb-1">
            <MaterialCommunityIcons name="file-document-outline" size={16} color={theme.primary} />
            <Text className="text-xs font-black uppercase ml-1" style={{ color: theme.primary }}>
              Estimate
            </Text>
          </View>
          {vehicle && (
            <Text className="text-sm font-bold" style={{ color: theme.text }}>
              {vehicle.make} {vehicle.model} • {vehicle.plateNumber}
            </Text>
          )}
          <Text className="text-xs opacity-50 mt-1" style={{ color: theme.textSecondary }}>
            {date}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-sm font-black" style={{ color: theme.text }}>
            ₱{total.toLocaleString()}
          </Text>
          <View
            className="px-2 py-0.5 rounded-full mt-1"
            style={{
              backgroundColor:
                item.status === 'PENDING' ? '#f59e0b20' :
                item.status === 'APPROVED' ? '#10b98120' :
                item.status === 'DECLINED' ? '#ef444420' : '#6b728020',
            }}
          >
            <Text
              className="text-[10px] font-black"
              style={{
                color:
                  item.status === 'PENDING' ? '#f59e0b' :
                  item.status === 'APPROVED' ? '#10b981' :
                  item.status === 'DECLINED' ? '#ef4444' : '#6b7280',
              }}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </View>
      <View className="flex-row justify-end mt-2">
        <Ionicons name="chevron-forward" size={18} color={theme.border} />
      </View>
    </TouchableOpacity>
  );
}

export function FinalBillListItem({ item, onPress }) {
  const { theme } = useTheme();
  const date = new Date(item.createdAt).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const total = parseFloat(item.grandTotal || 0);

  return (
    <TouchableOpacity
      onPress={onPress}
      className="p-5 rounded-2xl mb-3 border"
      style={{ backgroundColor: theme.background, borderColor: theme.border }}
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-4">
          <View className="flex-row items-center mb-1">
            <Ionicons name="receipt-outline" size={16} color={theme.primary} />
            <Text className="text-xs font-black uppercase ml-1" style={{ color: theme.primary }}>
              Final Bill
            </Text>
          </View>
          <Text className="text-sm font-bold" style={{ color: theme.text }}>
            Invoice #{item.id?.slice(0, 8).toUpperCase()}
          </Text>
          <Text className="text-xs opacity-50 mt-1" style={{ color: theme.textSecondary }}>
            {date}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-sm font-black" style={{ color: theme.text }}>
            ₱{total.toLocaleString()}
          </Text>
          <View
            className="px-2 py-0.5 rounded-full mt-1"
            style={{
              backgroundColor:
                item.status === 'PAID' ? '#10b98120' :
                item.status === 'PENDING' ? '#f59e0b20' : '#ef444420',
            }}
          >
            <Text
              className="text-[10px] font-black"
              style={{
                color:
                  item.status === 'PAID' ? '#10b981' :
                  item.status === 'PENDING' ? '#f59e0b' : '#ef4444',
              }}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </View>
      <View className="flex-row justify-end mt-2">
        <Ionicons name="chevron-forward" size={18} color={theme.border} />
      </View>
    </TouchableOpacity>
  );
}