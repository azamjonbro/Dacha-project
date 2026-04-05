<template>
  <div class="dashboard-page page">
    <h1 class="page-title">Asosiy Panel</h1>
    
    <div v-if="loading" class="stats-grid">
      <!-- Skeletons -->
      <div v-for="i in 4" :key="i" class="stat-card skeleton">
        <div class="skeleton-icon"></div>
        <div class="stat-info">
          <div class="skeleton-text short"></div>
          <div class="skeleton-text long"></div>
        </div>
      </div>
    </div>

    <div v-else class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon b-blue">💰</div>
        <div class="stat-info">
          <h3>Jami Tushum</h3>
          <p>{{ formatMoney(stats.totalRevenue) }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon b-green">✅</div>
        <div class="stat-info">
          <h3>Bugun Band</h3>
          <p>{{ stats.activeBookings }} ta</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon b-orange">🏡</div>
        <div class="stat-info">
          <h3>Jami Dachalar</h3>
          <p>{{ stats.totalDachas }} ta</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon b-purple">📅</div>
        <div class="stat-info">
          <h3>Jami Bandliklar</h3>
          <p>{{ stats.totalBookings }} ta</p>
        </div>
      </div>
    </div>

    <div class="card recent-bookings">
      <h3>Yaqin oradagi bandliklar</h3>
      
      <div v-if="loading" class="empty-state">
        <p>Yuklanmoqda...</p>
      </div>
      
      <div v-else-if="recentBookings.length === 0" class="empty-state">
        <p>Hozircha yaqin kunlarda hech qanday bandlik yo'q ✨</p>
      </div>
      
      <div v-else class="upcoming-list">
        <div v-for="booking in recentBookings" :key="booking._id" class="upcoming-card">
          <div class="up-left">
            <div class="avatar">{{ booking.OrderedUser?.charAt(0).toUpperCase() || 'M' }}</div>
            <div class="up-info">
              <h4>{{ booking.OrderedUser || 'Mijoz' }}</h4>
              <p class="up-dacha">{{ booking.dachaId?.name || "Noma'lum Dacha" }}</p>
            </div>
          </div>
          <div class="up-right">
            <span class="up-date">{{ formatShortDate(booking.startDate) }} — {{ formatShortDate(booking.endDate) }}</span>
            <span class="up-price">{{ formatMoney(booking.totalPrice) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "../utils/axios";

export default {
  data() {
    return {
      loading: true,
      stats: {
        totalBookings: 0,
        totalRevenue: 0,
        totalDachas: 0,
        activeBookings: 0,
        availableDachas: 0
      },
      recentBookings: []
    }
  },
  mounted() {
    this.fetchOverview();
  },
  methods: {
    async fetchOverview() {
      try {
        this.loading = true;
        const [statsRes, bookingsRes] = await Promise.all([
          api.get("/stats/overview"),
          api.get("/booking")
        ]);
        
        this.stats = statsRes || {
          totalBookings: 0, totalRevenue: 0, totalDachas: 0, activeBookings: 0, availableDachas: 0
        };
        
        // Take the top 5 nearest upcoming bookings
        const rawBookings = bookingsRes?.data || [];
        this.recentBookings = rawBookings.slice(0, 5);
      } catch (e) {
        console.error("Failed to load overview data", e);
      } finally {
        this.loading = false;
      }
    },
    formatShortDate(dateStr) {
      if (!dateStr) return "-";
      return new Date(dateStr).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
    },
    formatMoney(val) {
      if (!val) return "0 UZS";
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + "M UZS";
      }
      return Number(val).toLocaleString("uz-UZ") + " UZS";
    }
  }
}
</script>

<style scoped>
.page-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #fff;
}
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}
.stat-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid var(--border-color);
  box-shadow: var(--card-shadow);
  transition: transform 0.2s ease;
}
.stat-card:active {
  transform: scale(0.96);
}
.stat-icon {
  font-size: 24px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}
.b-blue { background: rgba(37,99,235,0.15); }
.b-green { background: rgba(22,163,74,0.15); }
.b-orange { background: rgba(249,115,22,0.15); }
.b-purple { background: rgba(168,85,247,0.15); }

.stat-info h3 {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
  margin-bottom: 2px;
}
.stat-info p {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
}
.recent-bookings {
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}
.recent-bookings h3 {
  font-size: 16px;
  font-weight: 600;
}
.empty-state {
  width: 100%;
  padding: 40px 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  background: rgba(255,255,255,0.02);
  border-radius: 12px;
}

/* SKELETONS */
.skeleton {
  background: var(--card-bg);
  animation: pulse 1.5s infinite;
}
.skeleton-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255,255,255,0.05);
}
.skeleton-text {
  height: 12px;
  border-radius: 6px;
  background: rgba(255,255,255,0.05);
  margin-bottom: 6px;
}
.skeleton-text.short { width: 50%; }
.skeleton-text.long { width: 80%; height: 18px; }

.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-top: 12px;
}
.upcoming-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(15, 23, 42, 0.4);
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.05);
}
.up-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.up-left .avatar {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: rgba(37,99,235,0.15);
  color: #60a5fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
}
.up-info {
  display: flex;
  flex-direction: column;
}
.up-info h4 {
  font-size: 14px;
  color: #fff;
  font-weight: 600;
  margin-bottom: 2px;
}
.up-dacha {
  font-size: 12px;
  color: var(--primary-color);
  font-weight: 600;
}
.up-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.up-date {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  background: rgba(148, 163, 184, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
}
.up-price {
  font-size: 13px;
  color: #fff;
  font-weight: 700;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}
</style>
