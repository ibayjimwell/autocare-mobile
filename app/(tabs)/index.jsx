import { ScrollView, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
  const {
    upcomingAppointment,
    underInspectionAppointments,
    inProgressAppointments,
    trendingServices,
    loading,
  } = useHomeData();

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      <GreetingHeader />
      <HeroCard />
      <QuickActions />

      {/* Upcoming Appointment */}
      <View className="px-6 mt-8">
        <View className="flex-row justify-between items-end mb-4 px-1">
          <Text className="text-lg font-heading font-black text-foreground">Schedule</Text>
          <Link href="/appointments">
            <Text className="text-xs font-bold uppercase tracking-wider text-primary">View All</Text>
          </Link>
        </View>
        {loading ? (
          <View className="h-32 rounded-3xl items-center justify-center border border-dashed border-border bg-card">
            <ActivityIndicator color="#C1272D" />
          </View>
        ) : (
          <UpcomingAppointment appointment={upcomingAppointment} />
        )}
      </View>

      {/* Under Inspection */}
      {!loading && (
        <AppointmentSection
          title="Under Inspection"
          appointments={underInspectionAppointments}
          statusKey="UNDER_INSPECTION"
        />
      )}

      {/* In Progress */}
      {!loading && (
        <AppointmentSection
          title="In Progress"
          appointments={inProgressAppointments}
          statusKey="IN_PROGRESS"
        />
      )}

      {/* My Vehicles */}
      <View className="mt-8">
        <View className="flex-row justify-between items-center mb-4 px-7">
          <Text className="text-lg font-heading font-black text-foreground">Garage</Text>
          <Link href="/vehicles">
            <Text className="text-xs font-bold uppercase tracking-wider text-primary">Manage</Text>
          </Link>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 24, paddingRight: 8 }}>
          <VehicleCard name="Toyota Vios" plate="ABC 1234" year="2021" />
          <VehicleCard name="Honda Civic" plate="XYZ 5678" year="2022" />
          <TouchableOpacity
            className="mr-4 p-5 rounded-3xl w-40 h-32 items-center justify-center border border-dashed border-border"
            onPress={() => router.push('/vehicles')}
          >
            <Ionicons name="add-circle" size={32} color="#C1272D" />
            <Text className="text-[10px] font-bold mt-2 uppercase tracking-tighter text-muted-foreground">Add Vehicle</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Trending Services */}
      <View className="px-6 mt-8 mb-12">
        <Text className="text-lg font-heading font-black mb-4 px-1 text-foreground">Trending Services</Text>
        {trendingServices.length === 0 ? (
          <View className="p-6 rounded-3xl items-center border border-dashed border-border">
            <Text className="text-sm font-bold text-muted-foreground/50">No trending services yet</Text>
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
              onPress={() => router.push(`/booking?serviceId=${service.id}`)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}