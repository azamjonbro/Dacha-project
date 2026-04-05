<template>
  <div class="stats-page page">
    <div class="page-header">
      <h1 class="page-title">Statistika</h1>
      <input 
        type="month" 
        v-model="selectedMonth" 
        @change="fetchAllData"
        class="month-picker"
      />
    </div>

    <div v-if="loading" class="loading-state">
      <div class="skeleton-card rev-skel"></div>
      <div class="skeleton-card chart-skel"></div>
      <div class="skeleton-card"></div>
    </div>

    <template v-else>
      <div class="card revenue-card">
        <div class="rev-header">
          <p>Tanlangan Oydagi Tushum</p>
          <span class="badge">{{ selectedMonth ? 'Tanlangan oy' : 'So\'nggi 30 kun' }}</span>
        </div>
        <h2>{{ formatMoney(totalThirtyDays) }}</h2>
      </div>

      <!-- Revenue Chart (Line) -->
      <div class="chart-container">
        <h3>Kunlik Daromad</h3>
        <Line v-if="revenueLoaded" :data="revenueChartData" :options="chartOptions" />
        <div v-else class="empty-state">Ma'lumot yo'q</div>
      </div>

      <!-- Dacha Usage Chart (Bar) -->
      <div class="chart-container">
        <h3>Dachalar Mashhurligi</h3>
        <Bar v-if="usageLoaded" :data="usageChartData" :options="chartOptions" />
        <div v-else class="empty-state">Ma'lumot yo'q</div>
      </div>

      <div class="card details-card">
        <div class="detail-row">
          <span>{{ occupancy.timeframe || 'Shu oy' }}</span>
          <strong>{{ occupancy.activeBookingsThisMonth }} ta Umudiy Bandlik</strong>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import api from "../utils/axios";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler
} from 'chart.js'
import { Line, Bar } from 'vue-chartjs'

ChartJS.register(
  Title, Tooltip, Legend, LineElement, BarElement,
  CategoryScale, LinearScale, PointElement, Filler
)

export default {
  components: { Line, Bar },
  data() {
    return {
      loading: true,
      revenueLoaded: false,
      usageLoaded: false,
      selectedMonth: "", // yyyy-mm
      
      totalThirtyDays: 0,
      occupancy: {},

      revenueChartData: { labels: [], datasets: [] },
      usageChartData: { labels: [], datasets: [] },

      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false, drawBorder: false },
            ticks: { color: "#94a3b8" }
          },
          y: {
            grid: { color: "rgba(255,255,255,0.05)", drawBorder: false },
            ticks: { color: "#94a3b8", display: false }
          }
        },
        elements: {
          line: { tension: 0.4 },
          point: { radius: 0, hitRadius: 10, hoverRadius: 4 }
        }
      }
    }
  },
  async mounted() {
    // Set default month to current month if we wanted, but empty means 'last 30 days' based on backend
    await this.fetchAllData();
  },
  methods: {
    async fetchAllData() {
      this.loading = true;
      this.revenueLoaded = false;
      this.usageLoaded = false;
      
      const query = this.selectedMonth ? `?month=${this.selectedMonth}` : '';

      try {
        const [revRes, usageRes, occRes] = await Promise.all([
          api.get(`/stats/revenue${query}`),
          api.get(`/stats/dacha-usage${query}`),
          api.get(`/stats/occupancy${query}`)
        ]);

        this.occupancy = occRes || {};
        this.processRevenueData(revRes?.dailyRevenue);
        this.processUsageData(usageRes);
      } catch (err) {
        console.error("Stats fetching error:", err);
      } finally {
        this.loading = false;
      }
    },
    processRevenueData(daily) {
      if (!daily || daily.length === 0) {
        this.totalThirtyDays = 0;
        this.revenueChartData = { labels: [], datasets: [] };
        this.revenueLoaded = false;
        return;
      }
      
      const labels = daily.map(d => {
        const date = new Date(d._id);
        return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
      });
      const data = daily.map(d => d.total);
      
      this.totalThirtyDays = data.reduce((a, b) => a + b, 0);

      this.revenueChartData = {
        labels,
        datasets: [
          {
            label: 'Daromad (UZS)',
            data,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            fill: true,
            borderWidth: 3
          }
        ]
      };
      this.revenueLoaded = true;
    },
    processUsageData(usage) {
      if (!usage || usage.length === 0) {
        this.usageChartData = { labels: [], datasets: [] };
        this.usageLoaded = false;
        return;
      }

      const labels = usage.map(u => u.dachaName);
      const data = usage.map(u => u.count);

      this.usageChartData = {
        labels,
        datasets: [{
          label: 'Bandliklar soni',
          data,
          backgroundColor: '#3b82f6',
          borderRadius: 6,
          barPercentage: 0.6
        }]
      };
      this.usageLoaded = true;
    },
    formatMoney(val) {
      if (!val) return "0 UZS";
      if (val >= 1000000) {
        return (val / 1000000).toFixed(2) + "M UZS";
      }
      return Number(val).toLocaleString("uz-UZ") + " UZS";
    }
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
}
.month-picker {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  color: white;
  padding: 8px 12px;
  border-radius: 12px;
  min-height: 40px;
  outline: none;
  font-size: 14px;
  transition: border-color 0.2s;
  width: 140px;
}
.month-picker:focus {
  border-color: var(--primary-color);
}

.revenue-card {
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  background: linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(30,41,59,0) 100%), var(--card-bg);
  border: 1px solid rgba(37,99,235,0.3);
}
.rev-header {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
}
.rev-header p {
  color: var(--text-muted);
  font-size: 14px;
}
.badge {
  background: rgba(255,255,255,0.1);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  color: #fff;
}
.revenue-card h2 {
  font-size: 28px;
  color: #fff;
  font-weight: 800;
}

.chart-container {
  background: var(--card-bg);
  border-radius: 20px;
  border: 1px solid var(--border-color);
  padding: 16px;
  margin-top: 10px;
  margin-bottom: 10px;
  height: 250px;
  display: flex;
  flex-direction: column;
}
.chart-container h3 {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12px;
}

.details-card {
  flex-direction: column;
  gap: 16px;
  margin-bottom: 30px;
}
.detail-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.detail-row span {
  color: var(--text-muted);
  font-size: 14px;
}
.detail-row strong {
  color: #fff;
  font-size: 15px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--text-muted);
  font-size: 14px;
}

/* Skeletons */
.loading-state {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.skeleton-card {
  background: var(--card-bg);
  border-radius: 20px;
  animation: pulse 1.5s infinite;
}
.rev-skel { height: 100px; }
.chart-skel { height: 250px; }

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}
</style>
