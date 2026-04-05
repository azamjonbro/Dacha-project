<template>
  <div class="history-page page">
    <div class="header-container">
      <h1 class="page-title">Ijaralar tarixi</h1>
    </div>

    <!-- Segmented Control -->
    <div class="segment-control">
      <button 
        class="segment-btn" 
        :class="{ active: activeSubTab === 'active' }" 
        @click="activeSubTab = 'active'"
      >
        Jarayonda
      </button>
      <button 
        class="segment-btn" 
        :class="{ active: activeSubTab === 'completed' }" 
        @click="activeSubTab = 'completed'"
      >
        Yakunlangan
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="loading-state">
      <div v-for="i in 5" :key="i" class="history-skeleton skeleton"></div>
    </div>

    <!-- Current Tab Empty State -->
    <div v-else-if="displayedHistory.length === 0" class="empty-state card">
      <div class="icon">📭</div>
      <p>Bu bo'limda ma'lumotlar mavjud emas</p>
    </div>

    <!-- Bookings List -->
    <div v-else class="history-list">
      <transition-group name="fade">
        <div 
          v-for="booking in displayedHistory" 
          :key="booking._id" 
          class="card history-card" 
          :class="{ inactive: !booking.isActive }"
        >
          <div class="card-left">
            <div class="avatar">{{ booking.OrderedUser?.charAt(0).toUpperCase() || 'M' }}</div>
            <div class="info">
              <h4>{{ booking.OrderedUser || 'Mijoz' }}</h4>
              
              <!-- User phone representation -->
              <p class="phone" v-if="booking.phone1 || booking.phone2">
                📞 {{ booking.phone1 || '--' }} 
                <span v-if="booking.phone2">/ {{ booking.phone2 }}</span>
              </p>

              <span class="dacha-name">{{ booking.dachaId?.name || "Noma'lum Dacha" }}</span>
              <span class="dates">
                {{ formatDate(booking.startDate) }} — {{ formatDate(booking.endDate) }}
              </span>
            </div>
          </div>
          <div class="card-right">
            <span class="price">{{ formatMoney(booking.totalPrice) }}</span>
            <span class="badge" :class="booking.isActive ? 'active' : 'completed'">
              {{ booking.isActive ? 'Aktiv' : 'Yakunlangan' }}
            </span>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import api from "../utils/axios";

export default {
  data() {
    return {
      history: [],
      loading: true,
      activeSubTab: "active" // 'active' or 'completed'
    }
  },
  computed: {
    activeHistory() {
      return this.history.filter(b => b.isActive === true);
    },
    completedHistory() {
      return this.history.filter(b => b.isActive === false);
    },
    displayedHistory() {
      return this.activeSubTab === "active" ? this.activeHistory : this.completedHistory;
    }
  },
  async mounted() {
    await this.fetchHistory();
  },
  methods: {
    async fetchHistory() {
      this.loading = true;
      try {
        const res = await api.get('/booking/history');
        if (res && res.data) {
          this.history = res.data;
        } else if (res && Array.isArray(res)) {
          this.history = res;
        } else {
          this.history = res?.data || [];
        }
      } catch (e) {
        console.error("Failed to list history:", e);
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return "-";
      return new Date(dateStr).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
    },
    formatMoney(val) {
      if (!val) return "0 UZS";
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + "M";
      }
      return Number(val).toLocaleString("uz-UZ");
    }
  }
}
</script>

<style scoped>
.header-container {
  margin-bottom: 20px;
}
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
}

/* Segmented Control UI */
.segment-control {
  display: flex;
  background: rgba(30,41,59,0.8);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 24px;
  border: 1px solid var(--border-color);
}
.segment-btn {
  flex: 1;
  background: transparent;
  color: #94a3b8;
  border: none;
  border-radius: 8px;
  padding: 10px 0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.segment-btn.active {
  background: var(--card-bg);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.history-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  transition: transform 0.2s ease, opacity 0.2s;
  margin-bottom: 12px;
}
.history-card.inactive {
  opacity: 0.8;
  background: rgba(30,41,59,0.7);
}
.card-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.avatar {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(37,99,235,0.15);
  color: #60a5fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  flex-shrink: 0;
}
.info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.info h4 {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}
.phone {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 2px;
  font-weight: 500;
}
.dacha-name {
  font-size: 12px;
  color: #94a3b8;
}
.dates {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}

.card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}
.price {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
}
.badge {
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 8px;
  font-weight: 600;
}
.active {
  background: rgba(22,163,74,0.15);
  color: #4ade80;
}
.completed {
  background: rgba(148,163,184,0.15);
  color: #94a3b8;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}
.icon {
  font-size: 40px;
  margin-bottom: 12px;
}
.empty-state p {
  color: var(--text-muted);
  font-size: 15px;
}

/* Skeletons */
.loading-state {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.history-skeleton {
  height: 80px;
  border-radius: 16px;
  background: var(--card-bg);
  animation: pulse 1.5s infinite;
}

/* Vue Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}
</style>
