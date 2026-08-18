import React from "react";
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
      <ServicesHeader />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="pt-6 pb-12">

          {loading ? (
            <View className="py-32 items-center justify-center">
              <ActivityIndicator size="large" color="#C1272D" />
            </View>
          ) : services.length === 0 ? (
            <View className="items-center justify-center py-32 px-4">
              <View className="w-20 h-20 bg-secondary rounded-full items-center justify-center mb-6 shadow-sm">
                <Wrench size={36} color="#8E8E93" />
              </View>
              <Text className="text-xl font-bold tracking-tight text-foreground text-center">
                No Services Available
              </Text>
              <Text className="text-base font-normal text-muted-foreground mt-2 text-center leading-6 px-4">
                Check back later for our new premium maintenance packages.
              </Text>
            </View>
          ) : (
            /* 2-Column Grid Wrapper */
            <View className="flex-row flex-wrap px-2 mt-2">
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

          {!loading && services.length > 0 && <ServicesFooter />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}