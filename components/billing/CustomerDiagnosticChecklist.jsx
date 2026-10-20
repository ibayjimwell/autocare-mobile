import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ImageBackground } from 'react-native';
import { ClipboardCheck, ChevronDown, ChevronUp } from 'lucide-react-native';
import api, { API_BASE_URL } from '../../services/api';

/** Read-only. Customer identity is verified by the server from their JWT. */
export default function CustomerDiagnosticChecklist({ appointmentId }) {
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let mounted = true;
    if (!appointmentId) { setData(null); return () => { mounted = false; }; }
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.request(`/customers/diagnostic-checklist?appointmentId=${encodeURIComponent(appointmentId)}`, 'GET', null, true);
        if (mounted) setData(res?.data || null);
      } catch (error) {
        if (mounted) { setData(null); console.warn('[Customer diagnostic checklist]', error?.message); }
      } finally { if (mounted) setLoading(false); }
    };
    void load();
    return () => { mounted = false; };
  }, [appointmentId]);
  if (!appointmentId) return null;
  const sections = Array.isArray(data?.sections) ? data.sections : [];
  const map = new Map((data?.entries || []).map(item => [item.itemKey, item.status]));
  const checklist = data?.checklist;
  return (
    <View className="border-t border-border bg-card px-4 py-3">
      <TouchableOpacity onPress={() => setExpanded(value => !value)} activeOpacity={0.8} className="min-h-[48px] flex-row items-center">
        <ClipboardCheck size={20} color="#C1272D" />
        <View className="flex-1 ml-3">
          <Text className="text-sm font-semibold text-foreground">Diagnostic Checklist</Text>
          <Text className="text-xs text-muted-foreground">View recorded inspection results (read only)</Text>
        </View>
        {loading ? <ActivityIndicator size="small" color="#C1272D" /> : expanded ? <ChevronUp size={18} color="#8E8E93" /> : <ChevronDown size={18} color="#8E8E93" />}
      </TouchableOpacity>
      {expanded && (
        !checklist ? <Text className="py-3 text-sm text-muted-foreground">No diagnostic checklist recorded for this appointment.</Text> :
        <View className="pt-2">
          <Text className="mb-3 text-xs text-muted-foreground">Engine: {checklist.engineType || '—'} · Transmission: {checklist.transmissionType || '—'}</Text>
          {sections.map(section => (
            <View key={section.id} className="mb-3 rounded-lg border border-border overflow-hidden">
              <Text className="bg-background px-3 py-2 text-xs font-bold text-foreground">{section.title}</Text>
              {section.items.map(([key,label]) => {
                const status = map.get(key) || 'NOT CHECKED';
                const color = status === 'REPLACE' ? '#C1272D' : status === 'WARNING' ? '#B7791F' : status === 'GOOD' ? '#15803D' : '#8E8E93';
                return <View key={key} className="flex-row items-center justify-between border-t border-border px-3 py-2">
                  <Text className="flex-1 pr-3 text-xs text-foreground">{label}</Text>
                  <Text className="text-xs font-bold" style={{ color }}>{status}</Text>
                </View>;
              })}
            </View>
          ))}
          {checklist.remarks ? <Text className="text-xs text-foreground mb-2">Remarks: {checklist.remarks}</Text> : null}
          {checklist.dentsNotes ? <Text className="text-xs text-foreground mb-2">Dent notes: {checklist.dentsNotes}</Text> : null}
          <Text className="mb-2 text-xs font-semibold text-foreground">Vehicle Dent Inspection (read only)</Text>
          <ImageBackground
            source={{ uri: `${API_BASE_URL.replace(/\/api\/?$/, '')}/images/autocare-vehicle-dent-template.png` }}
            resizeMode="stretch"
            className="w-full overflow-hidden rounded-lg"
            style={{ aspectRatio: 500 / 175 }}
          >
            {(Array.isArray(checklist.dentsMarks) ? checklist.dentsMarks : []).map((mark, index) => (
              <Text key={index} style={{ position: 'absolute', left: `${Math.max(0, Math.min(100, (Number(mark.x) || 0) / 5))}%`, top: `${Math.max(0, Math.min(100, (Number(mark.y) || 0) / 1.75))}%`, color: '#C1272D', fontSize: 18, fontWeight: '900' }}>X</Text>
            ))}
          </ImageBackground>
          <Text className="mt-1 text-xs text-muted-foreground">Dent marks: {Array.isArray(checklist.dentsMarks) ? checklist.dentsMarks.length : 0}</Text>
        </View>
      )}
    </View>
  );
}
