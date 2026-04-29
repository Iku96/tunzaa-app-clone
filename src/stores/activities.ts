import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ActivityState {
  // Key is YYYY-MM-DD, value is time spent in seconds
  dailyTime: Record<string, number>;
  addTime: (seconds: number) => void;
  getDailyMinutes: (date: string) => number;
  getWeeklyStats: () => { day: string; height: number; minutes: number }[];
}

export const useActivitiesStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      dailyTime: {},
      
      addTime: (seconds: number) => {
        const today = new Date().toISOString().split('T')[0];
        set((state) => {
          const current = state.dailyTime[today] || 0;
          return {
            dailyTime: {
              ...state.dailyTime,
              [today]: current + seconds
            }
          };
        });
      },

      getDailyMinutes: (date: string) => {
        const seconds = get().dailyTime[date] || 0;
        return Math.floor(seconds / 60);
      },

      getWeeklyStats: () => {
        const stats = [];
        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const now = new Date();
        
        // Get last 7 days
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(now.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const seconds = get().dailyTime[dateStr] || 0;
          const minutes = Math.floor(seconds / 60);
          
          stats.push({
            day: days[d.getDay()],
            minutes,
            // Calculate height for chart (max 100)
            // Assuming 60 mins is 100% for visualization
            height: Math.min(100, Math.floor((minutes / 60) * 100))
          });
        }
        return stats;
      }
    }),
    {
      name: 'activities-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
