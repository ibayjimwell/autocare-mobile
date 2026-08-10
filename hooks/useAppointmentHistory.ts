import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import customersApi from "../services/customersApi";

interface HistoryEntry {
  id: string;
  appointmentId: string;
  fromStatus: string | null;
  toStatus: string;
  createdAt: string;
  appointment: any;
  staff?: { fullname: string } | null;
}

export function useAppointmentHistory() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const fetchHistory = async () => {
      try {
        const res = await customersApi.getAppointmentHistory(user.id);
        if (res.error) {
          setError(res.errorMessage || "Failed to load history.");
          setHistory([]);
        } else {
          setHistory(res.data || []);
          setError(null);
        }
      } catch (err: any) {
        setError(err.message || "Network error.");
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  return { history, loading, error };
}