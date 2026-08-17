import { ScrollView, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { PlusCircle, Search } from 'lucide-react-native';
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
    upcomingConfirmed,
    groupedAppointments,
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
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#C1272D" />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) return null;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Placed OUTSIDE the ScrollView so it stays fixed at the top */}
      <GreetingHeader />

      <ScrollView 
        className="flex-1 bg-background" 
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pt-6" // Added pt-6 here to give breathing room under the header
      >
        {/* Search */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/services')}
          className="mx-4 mb-6 flex-row items-center bg-secondary rounded-lg px-4 min-h-[44px]"
        >
          <Search size={18} color="#8E8E93" />
          <Text className="ml-2 text-base font-normal text-muted-foreground">
            Search services...
          </Text>
        </TouchableOpacity>

        <HeroCard />

        <QuickActions />

        {/* Upcoming Appointment */}
        <View className="mb-8">
          <View className="flex-row justify-between items-end mb-2 px-4">
            <Text className="text-lg font-semibold text-foreground">Schedule</Text>
            <Link href="/appointments" asChild>
              <TouchableOpacity className="min-h-[44px] justify-center">
                <Text className="text-sm font-medium text-primary">View All</Text>
              </TouchableOpacity>
            </Link>
          </View>
          {homeLoading ? (
            <View className="h-32 rounded-xl mx-4 items-center justify-center bg-card">
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

        {/* Garage / My Vehicles */}
        <View className="mb-8">
          <View className="flex-row justify-between items-end mb-2 px-4">
            <Text className="text-lg font-semibold text-foreground">Garage</Text>
            <Link href="/vehicles" asChild>
              <TouchableOpacity className="min-h-[44px] justify-center">
                <Text className="text-sm font-medium text-primary">Manage</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="px-4"
          >
            <VehicleCard name="Toyota Vios" plate="ABC 1234" year="2021" isLast={false} />
            <VehicleCard name="Honda Civic" plate="XYZ 5678" year="2022" isLast={false} />
            <TouchableOpacity
              activeOpacity={0.7}
              className="w-32 bg-card rounded-xl border border-dashed border-border items-center justify-center py-8 min-h-[44px]"
              onPress={() => router.push('/vehicles')}
            >
              <PlusCircle size={24} color="#C1272D" />
              <Text className="mt-2 text-sm font-medium text-primary">Add Vehicle</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Trending Services */}
        <View className="pb-14">
          <Text className="text-lg font-semibold px-4 mb-2 text-foreground">Trending Services</Text>

          <View className="bg-card rounded-xl mx-4 overflow-hidden">
            {trendingServices.length === 0 ? (
              <View className="p-6 items-center">
                <Text className="text-sm font-normal text-muted-foreground">No trending services yet</Text>
              </View>
            ) : (
              trendingServices.map((service, index) => (
                <TrendingServiceCard
                  key={service.id}
                  name={service.name}
                  duration={formatDuration(service.durationMinutes)}
                  price={formatPrice(service.basePrice)}
                  rank={index + 1}
                  count={service.appointmentCount}
                  isLast={index === trendingServices.length - 1}
                  onPress={() => router.push(`/booking?serviceId=${service.id}`)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}