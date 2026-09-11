import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import {
  PlusCircle,
  Search,
  Navigation,
  CalendarClock,
} from 'lucide-react-native';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHomeData } from '../../hooks/useHomeData';
import GreetingHeader from '../../components/home/GreetingHeader';
import HeroCard from '../../components/home/HeroCard';
import QuickActions from '../../components/home/QuickActions';
import UpcomingAppointment from '../../components/home/UpcomingAppointment';
import AppointmentSection from '../../components/home/AppointmentSection';
import VehicleCard from '../../components/home/VehicleCard';
import TrendingServiceCard from '../../components/home/TrendingServiceCard';
import { formatDuration, formatPrice } from '../../utils/format';

export default function HomeScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const {
    groupedAppointments,
    upcomingConfirmed,
    activeTrackingAppointment,
    vehicles,
    trendingServices,
    loading: homeLoading,
  } = useHomeData();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#C1272D" />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) return null;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <GreetingHeader />

      <ScrollView
        className="flex-1 bg-background"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pt-6"
      >
        {/* Search */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/services')}
          className="mx-4 mb-6 flex-row items-center rounded-lg bg-secondary px-4 min-h-[44px]"
        >
          <Search size={18} color="#8E8E93" />
          <Text className="ml-2 text-base font-normal text-muted-foreground">
            Search services...
          </Text>
        </TouchableOpacity>

        <HeroCard />

        <QuickActions />

        {/* Schedule */}
        <View className="mb-8">
          <View className="mb-2 flex-row items-end justify-between px-4">
            <View className="flex-row items-center">
              <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <CalendarClock size={17} color="#C1272D" />
              </View>

              <Text className="text-lg font-semibold text-foreground">
                Schedule
              </Text>
            </View>

            <Link href="/appointments" asChild>
              <TouchableOpacity className="min-h-[44px] justify-center">
                <Text className="text-sm font-medium text-primary">
                  View All
                </Text>
              </TouchableOpacity>
            </Link>
          </View>

          {homeLoading ? (
            <View className="mx-4 h-32 items-center justify-center rounded-xl bg-card">
              <ActivityIndicator color="#C1272D" />
            </View>
          ) : (
            <UpcomingAppointment appointment={upcomingConfirmed} />
          )}
        </View>

        {/* Waiting for Approval */}
        {!homeLoading && (
          <AppointmentSection
            title="Waiting for Approval"
            appointments={groupedAppointments.waitingForApproval}
            statusKey="WAITING_FOR_APPROVAL"
            limit={null}
          />
        )}

        {/* Under Inspection */}
        {!homeLoading && (
          <AppointmentSection
            title="Under Inspection"
            appointments={groupedAppointments.underInspection}
            statusKey="UNDER_INSPECTION"
            limit={4}
          />
        )}

        {/* In Progress */}
        {!homeLoading && (
          <AppointmentSection
            title="In Progress"
            appointments={groupedAppointments.inProgress}
            statusKey="IN_PROGRESS"
            limit={4}
          />
        )}

        {/* Pending */}
        {!homeLoading && (
          <AppointmentSection
            title="Pending"
            appointments={groupedAppointments.pending}
            statusKey="PENDING"
            limit={4}
          />
        )}

        {/* Completed */}
        {!homeLoading && (
          <AppointmentSection
            title="Completed"
            appointments={groupedAppointments.completed}
            statusKey="COMPLETED"
            limit={4}
          />
        )}

        {/* Cancelled */}
        {!homeLoading && (
          <AppointmentSection
            title="Cancelled"
            appointments={groupedAppointments.cancelled}
            statusKey="CANCELLED"
            limit={4}
          />
        )}

        {/* Garage */}
        <View className="mb-8">
          <View className="mb-2 flex-row items-end justify-between px-4">
            <Text className="text-lg font-semibold text-foreground">
              Garage
            </Text>

            <Link href="/vehicles" asChild>
              <TouchableOpacity className="min-h-[44px] justify-center">
                <Text className="text-sm font-medium text-primary">
                  Manage
                </Text>
              </TouchableOpacity>
            </Link>
          </View>

          {homeLoading ? (
            <View className="mx-4 h-40 items-center justify-center rounded-xl bg-card">
              <ActivityIndicator color="#C1272D" />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="px-4"
            >
              {vehicles.map((vehicle, index) => (
                <VehicleCard
                  key={vehicle.id || `${vehicle.make}-${vehicle.model}-${index}`}
                  name={`${vehicle.make || ''} ${vehicle.model || ''}`.trim() || 'My Vehicle'}
                  plate={vehicle.plateNumber || vehicle.plate || 'No plate'}
                  year={vehicle.year ? String(vehicle.year) : ''}
                  isLast={false}
                />
              ))}

              <TouchableOpacity
                activeOpacity={0.7}
                className="w-32 min-h-[44px] items-center justify-center rounded-xl border border-dashed border-border bg-card py-8"
                onPress={() => router.push('/vehicles')}
              >
                <PlusCircle size={24} color="#C1272D" />

                <Text className="mt-2 text-sm font-medium text-primary">
                  Add Vehicle
                </Text>
              </TouchableOpacity>

              {vehicles.length === 0 && (
                <View className="mr-3 w-64 rounded-xl bg-card px-5 py-7">
                  <Text className="text-base font-semibold text-foreground">
                    No vehicle added yet
                  </Text>

                  <Text className="mt-1 text-sm leading-5 text-muted-foreground">
                    Add your car to make booking and tracking easier.
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>

        {/* Services
            No "Services" heading and no "See All".
        */}
        <View className="pb-14">
          {trendingServices.length === 0 ? (
            <View className="mx-4 rounded-xl bg-card px-6 py-8 items-center">
              <Text className="text-sm font-normal text-muted-foreground">
                No services available yet
              </Text>
            </View>
          ) : (
            <>
              <View className="mx-4 overflow-hidden rounded-xl bg-card">
                {trendingServices.map((service, index) => (
                  <TrendingServiceCard
                    key={service.id}
                    name={service.name}
                    duration={formatDuration(service.durationMinutes)}
                    price={formatPrice(service.basePrice)}
                    rank={index + 1}
                    count={service.appointmentCount}
                    isLast={index === trendingServices.length - 1}
                    onPress={() =>
                      router.push(`/booking?serviceId=${service.id}`)
                    }
                  />
                ))}
              </View>

              {/* Working tracking CTA inside services section */}
              {activeTrackingAppointment && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() =>
                    router.push(
                      `/tracking?appointmentId=${activeTrackingAppointment.id}`
                    )
                  }
                  className="mx-4 mt-3 min-h-[52px] flex-row items-center justify-center rounded-xl bg-primary px-4"
                >
                  <Navigation size={19} color="#FFFFFF" />
                  <View className="ml-2">
                    <Text className="text-sm font-semibold text-white">
                      Track Your Booking
                    </Text>
                    <Text className="text-xs text-white/75">
                      {activeTrackingAppointment.trackingNumber ||
                        'Open current appointment'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}