import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import customersApi from "../services/customersApi";

interface ProfileStats {
  vehicles: number;
  visits: number;
  completedAppointments: any[];
}

export function useProfileData() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProfileStats>({
    vehicles: 0,
    visits: 0,
    completedAppointments: [],
  });

  useEffect(() => {
    if (!user?.id) return;
    const fetchData = async () => {
      try {
        const res = await customersApi.getStats(user.id);
        const data = res.data?.data || res.data || {};
        setStats({
          vehicles: data.vehicleCount || 0,
          visits: data.visitCount || 0,
          completedAppointments: data.recentCompleted || [],
        });
      } catch (err) {
        console.error("Failed to load profile data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  return { loading, stats };
}