// Opcional: retirar solo módulos obsoletos del ZIP visual; App ya no los importa.
const {rmSync}=require('node:fs');
for(const p of ['home/HomePage','schedule/SchedulePage','lodging/LodgingPage','food/FoodPage','transport/TransportPage','notices/NoticesPage','commissions/TeamPage','commissions/CommissionPage','checkin/SyncPage','offline/OfflinePage','coordination/DashboardPage','coordination/ParticipantsPage','coordination/ScheduleEditorPage','coordination/NoticeEditorPage','coordination/CommissionsPage'])rmSync(`src/features/${p}.tsx`,{force:true});
