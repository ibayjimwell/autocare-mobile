import { View, Text, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";

export default function LogoutModal({ visible, onClose, onConfirm }) {
  // Completely re-architected to look like a native iOS Action Sheet
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      backdropOpacity={0.4}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={{ margin: 0, justifyContent: 'flex-end' }}
      useNativeDriver
    >
      <View className="pb-8 px-4">
        
        {/* Destructive Actions Group */}
        <View className="bg-card rounded-2xl mb-2 overflow-hidden">
          {/* Header Message */}
          <View className="py-4 px-4 items-center border-b border-border">
            <Text className="text-sm font-normal text-muted-foreground text-center leading-5">
              Are you sure you want to end your session? You'll need to sign back in to book services.
            </Text>
          </View>
          
          {/* Logout Button */}
          <TouchableOpacity 
            activeOpacity={0.7}
            className="py-4 items-center min-h-[56px] justify-center" 
            onPress={onConfirm}
          >
            <Text className="text-xl font-normal text-primary">
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cancel Button */}
        <View className="bg-card rounded-2xl overflow-hidden">
          <TouchableOpacity 
            activeOpacity={0.7}
            className="py-4 items-center min-h-[56px] justify-center" 
            onPress={onClose}
          >
            <Text className="text-xl font-semibold text-[#007AFF]">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </Modal>
  );
}