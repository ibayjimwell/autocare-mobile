import { View, ScrollView, ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Wrench } from "lucide-react-native";
import { useServices } from "../../hooks/useServices";
import ServicesHeader from "../../components/services/ServicesHeader";
import ServiceCard from "../../components/services/ServiceCard";
import ServicesFooter from "../../components/services/ServicesFooter";

export default function ServicesScreen() {
  const { services, loading } = useServices();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="pt-4 pb-10">
          <ServicesHeader />

          {loading ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator size="large" color="#C1272D" />
            </View>
          ) : services.length === 0 ? (
            <View className="items-center justify-center py-32 px-4">
              <Wrench size={56} color="#8E8E93" />
              <Text className="text-lg font-semibold text-foreground mt-4">
                No Services Available
              </Text>
              <Text className="text-base font-normal text-muted-foreground mt-2 text-center">
                Check back later for new maintenance packages.
              </Text>
            </View>
          ) : (
            <View className="bg-card rounded-xl mx-4 overflow-hidden mb-6">
              {services.map((service, index) => (
                <ServiceCard 
                  key={service.id} 
                  service={service} 
                  index={index} 
                  isLast={index === services.length - 1} 
                />
              ))}
            </View>
          )}

          <ServicesFooter />
          <View className="h-10" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}