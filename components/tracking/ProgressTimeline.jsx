import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { stages } from '../../utils/constants';

export default function ProgressTimeline({ currentStage }) {
  return (
    <View className="mb-10">
      <Text className="text-xl font-heading font-black mb-8 text-foreground">Progress</Text>
      {stages.map((stage, index) => {
        const isActive = index <= currentStage;
        const isCurrent = index === currentStage;
        return (
          <View key={index} className="flex-row mb-8">
            <View className="items-center mr-6">
              <View
                className={`w-10 h-10 rounded-2xl justify-center items-center shadow-sm ${
                  isActive ? 'bg-primary' : 'bg-card border border-border'
                }`}
              >
                <MaterialCommunityIcons name={stage.icon} size={20} color={isActive ? '#fff' : '#666'} />
              </View>
              {index < stages.length - 1 && (
                <View className={`w-0.5 h-10 mt-2 ${index < currentStage ? 'bg-primary' : 'bg-border'}`} />
              )}
            </View>
            <View className="flex-1 pt-1">
              <Text className={`text-base font-heading font-black ${isActive ? 'text-foreground' : 'text-foreground/30'}`}>
                {stage.name}
              </Text>
              <Text className="text-xs font-medium mt-1 leading-5 text-muted-foreground">{stage.description}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}