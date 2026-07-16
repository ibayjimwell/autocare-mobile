import { View, ScrollView, ActivityIndicator } from "react-native";
import { useServices } from "../../hooks/useServices";
import ServicesHeader from "../../components/services/ServicesHeader";
import ServiceCard from "../../components/services/ServiceCard";
import ServicesFooter from "../../components/services/ServicesFooter";

export default function ServicesScreen() {
  const { services, loading } = useServices();

  return (
    <ScrollView className="flex-1 pb-10 bg-background" showsVerticalScrollIndicator={false}>
      <View className="px-6 pt-14 pb-10">
        <ServicesHeader />

        {loading ? (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color="#C1272D" />
          </View>
        ) : services.length === 0 ? (
          <View className="py-20 rounded-[40px] border border-dashed border-border items-center">
            <Ionicons name="construct-outline" size={48} color="#666" />
            <Text className="mt-4 font-bold text-lg text-foreground">No services available</Text>
          </View>
        ) : (
          services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))
        )}

        <ServicesFooter />
        <View className="h-10" />
      </View>
    </ScrollView>
  );
}