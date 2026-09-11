import React, { useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Wrench,
  Clock3,
  ChevronRight,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useServices } from '../../hooks/useServices';
import ServicesHeader from '../../components/services/ServicesHeader';
import ServicesFooter from '../../components/services/ServicesFooter';

const SERVICE_TYPE_LABELS = {
  PMS: 'PMS',
  REPAIR: 'Repair',
  CHECKUP: 'Checkup',
};

function formatServiceDuration(minutes) {
  const totalMinutes = Number(minutes) || 0;

  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function formatPrice(value) {
  const amount = Number(value) || 0;

  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function ServiceTypeTabs({
  types,
  selectedType,
  onSelect,
}) {
  return (
    <View className="mb-5">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-4"
      >
        {types.map((type) => {
          const selected = type === selectedType;

          return (
            <TouchableOpacity
              key={type}
              activeOpacity={0.75}
              onPress={() => onSelect(type)}
              className={`mr-2 min-h-[44px] rounded-full px-5 items-center justify-center border ${
                selected
                  ? 'bg-primary border-primary'
                  : 'bg-card border-border'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  selected
                    ? 'text-white'
                    : 'text-foreground'
                }`}
              >
                {type}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function ServiceListCard({
  service,
  onPress,
  isLast,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.72}
      onPress={onPress}
      className="bg-card"
    >
      <View className="min-h-[92px] flex-row items-center px-4 py-4">
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
          <Wrench size={20} color="#C1272D" />
        </View>

        <View className="ml-3 flex-1 mr-3">
          <Text
            className="text-base font-semibold text-foreground"
            numberOfLines={2}
          >
            {service.name}
          </Text>

          <View className="mt-1.5 flex-row items-center">
            <Clock3 size={13} color="#8E8E93" />

            <Text className="ml-1 text-sm font-normal text-muted-foreground">
              {formatServiceDuration(
                service.durationMinutes
              )}
            </Text>
          </View>

          {!!service.type && (
            <Text className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {SERVICE_TYPE_LABELS[service.type] ||
                service.type}
            </Text>
          )}
        </View>

        <View className="items-end">
          <Text className="text-base font-bold text-primary">
            {formatPrice(service.basePrice)}
          </Text>

          <ChevronRight
            size={19}
            color="#8E8E93"
            style={{ marginTop: 5 }}
          />
        </View>
      </View>

      {!isLast && (
        <View className="ml-[68px] h-px bg-border" />
      )}
    </TouchableOpacity>
  );
}

export default function ServicesScreen() {
  const router = useRouter();
  const { services, loading } = useServices();

  const [selectedType, setSelectedType] = useState('ALL');

  const serviceTypes = useMemo(() => {
    const uniqueTypes = Array.from(
      new Set(
        services
          .map((service) => service?.type)
          .filter(Boolean)
      )
    );

    return [
      'ALL',
      ...uniqueTypes.map(
        (type) =>
          SERVICE_TYPE_LABELS[type] || type
      ),
    ];
  }, [services]);

  const typeValueMap = useMemo(() => {
    const map = {};

    Object.entries(SERVICE_TYPE_LABELS).forEach(
      ([key, label]) => {
        map[label] = key;
      }
    );

    return map;
  }, []);

  const filteredServices = useMemo(() => {
    if (selectedType === 'ALL') {
      return services;
    }

    const actualType =
      typeValueMap[selectedType] || selectedType;

    return services.filter(
      (service) => service?.type === actualType
    );
  }, [
    services,
    selectedType,
    typeValueMap,
  ]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ServicesHeader />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="pt-5 pb-12">
          {loading ? (
            <View className="py-32 items-center justify-center">
              <ActivityIndicator
                size="large"
                color="#C1272D"
              />
            </View>
          ) : services.length === 0 ? (
            <View className="items-center justify-center px-4 py-32">
              <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-secondary">
                <Wrench size={36} color="#8E8E93" />
              </View>

              <Text className="text-center text-xl font-bold tracking-tight text-foreground">
                No Services Available
              </Text>

              <Text className="mt-2 px-4 text-center text-base font-normal leading-6 text-muted-foreground">
                Check back later for our new premium
                maintenance packages.
              </Text>
            </View>
          ) : (
            <>
              <ServiceTypeTabs
                types={serviceTypes}
                selectedType={selectedType}
                onSelect={setSelectedType}
              />

              {filteredServices.length === 0 ? (
                <View className="mx-4 items-center rounded-xl bg-card px-6 py-12">
                  <Wrench size={28} color="#8E8E93" />

                  <Text className="mt-3 text-base font-semibold text-foreground">
                    No services in this category
                  </Text>

                  <Text className="mt-1 text-center text-sm text-muted-foreground">
                    Try another service type.
                  </Text>
                </View>
              ) : (
                <View className="mx-4 overflow-hidden rounded-xl bg-card">
                  {filteredServices.map(
                    (service, index) => (
                      <ServiceListCard
                        key={service.id}
                        service={service}
                        isLast={
                          index ===
                          filteredServices.length - 1
                        }
                        onPress={() =>
                          router.push(
                            `/booking?serviceId=${service.id}`
                          )
                        }
                      />
                    )
                  )}
                </View>
              )}
            </>
          )}

          {!loading &&
            filteredServices.length > 0 && (
              <ServicesFooter />
            )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}