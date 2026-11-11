import React,{useCallback,useEffect,useState} from 'react';
import {View,Text,ActivityIndicator,AppState,TouchableOpacity} from 'react-native';
import {Clock3,AlertTriangle,ShieldCheck,RefreshCw,CheckCircle2} from 'lucide-react-native';
import api from '../../services/api';
/** One authoritative service timeline, same backend data as AutoCare Web.
 * Poll when foregrounded; never store another copy of appointment status. */
export default function ServiceJourneyCard({appointmentId}){
 const [data,setData]=useState(null);const [loading,setLoading]=useState(false);const [error,setError]=useState('');
 const refresh=useCallback(async()=>{if(!appointmentId)return;setLoading(true);try{const response=await api.request(`/service-journey/${encodeURIComponent(appointmentId)}`,'GET',null,true);if(response?.error)throw new Error(response.errorMessage||'Unable to load journey.');setData(response?.data||null);setError('');}catch(e){setError(e?.message||'Unable to load progress.');}finally{setLoading(false);}},[appointmentId]);
 useEffect(()=>{if(!appointmentId)return;void refresh();const timer=setInterval(()=>{if(AppState.currentState==='active')void refresh();},30000);const sub=AppState.addEventListener('change',state=>{if(state==='active')void refresh();});return()=>{clearInterval(timer);sub.remove();};},[appointmentId,refresh]);
 if(!appointmentId)return null;
 return <View className="mb-5 rounded-2xl border border-border bg-card p-4">
 <View className="flex-row items-center justify-between mb-3"><Text className="text-lg font-bold text-foreground">Live Service Journey</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="Refresh service progress" onPress={refresh} className="p-2">{loading?<ActivityIndicator size="small" color="#C1272D"/>:<RefreshCw size={18} color="#C1272D"/>}</TouchableOpacity></View>
 {error?<Text className="text-xs text-muted-foreground mb-2">{error}</Text>:null}
 {data?<>
 <Text className="text-sm text-muted-foreground mb-3">{data.customerMessage}</Text>
 {data.phases?.map((p,index)=><View key={p.key} className="flex-row items-center py-2 border-b border-border/40"><View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${p.state==='UPCOMING'?'bg-background':'bg-primary'}`}>{p.state==='DONE'?<CheckCircle2 size={17} color="#FFFFFF"/>:<Text style={{color:p.state==='UPCOMING'?'#8E8E93':'#FFFFFF'}} className="font-bold text-xs">{index+1}</Text>}</View><Text className={`flex-1 text-sm ${p.state==='UPCOMING'?'text-muted-foreground':'text-foreground font-semibold'}`}>{p.label}</Text>{p.state==='CURRENT'?<Text className="text-xs font-bold text-primary">CURRENT</Text>:null}</View>)}
 {['IN_PROGRESS','UNDER_INSPECTION'].includes(data.status)?<View className="mt-3"><Text className="text-sm font-medium text-foreground">Tasks completed: {data.status==='IN_PROGRESS'?`${data.work?.done}/${data.work?.total}`:`${data.inspection?.done}/${data.inspection?.total}`}</Text><View className="h-2 bg-background rounded-full overflow-hidden mt-2"><View style={{width:`${data.progressPercent||0}%`,height:'100%',backgroundColor:'#C1272D'}}/></View></View>:null}
 <View className="mt-3 flex-row items-center"><Clock3 size={16} color={data.delay?'#B45309':'#15803D'}/><Text className="ml-2 text-xs text-muted-foreground">{data.delay?'Delay reported by workshop':'No delay reported — timing subject to inspection'}</Text></View>
 {data.delay?<View className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3"><View className="flex-row items-center"><AlertTriangle size={17} color="#B45309"/><Text className="ml-2 text-sm font-bold text-amber-900">Service delayed</Text></View><Text className="mt-1 text-xs text-amber-900">{data.delay.reason}</Text>{data.delay.expectedReadyAt?<Text className="mt-1 text-xs text-amber-800">Expected ready: {new Date(data.delay.expectedReadyAt).toLocaleString('en-PH')}</Text>:null}</View>:null}
 {data.warranty?<View className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3"><View className="flex-row items-center"><ShieldCheck size={17} color="#047857"/><Text className="ml-2 text-sm font-bold text-emerald-900">Service warranty</Text></View><Text className="mt-1 text-xs text-emerald-900">{data.warranty.coverage}</Text><Text className="mt-1 text-xs text-emerald-800">Valid until {new Date(data.warranty.expiresAt).toLocaleDateString('en-PH')}</Text><Text className="mt-1 text-xs text-emerald-800">{data.warranty.terms}</Text></View>:null}
 </>:loading?<ActivityIndicator color="#C1272D"/>:null}
 </View>;
}
