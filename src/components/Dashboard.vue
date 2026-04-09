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


    <div class="card recent-bookings pending-section" v-if="pendingBookings.length > 0">
      <div class="section-header">
        <h3 style="color: #fbbf24;">Kutilayotgan So'rovlar</h3>
        <span class="pulse-dot"></span>
      </div>
      <div class="upcoming-list">
        <div v-for="booking in pendingBookings" :key="booking._id" class="upcoming-card pending-card">
          <div class="up-left">
            <div class="avatar" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24;">
              {{ getInitials(booking.name || booking.OrderedUser) }}
            </div>
            <div class="up-info">
              <h4>{{ booking.name || booking.OrderedUser || 'Mijoz' }}</h4>
              <p class="up-phone">📞 {{ booking.phone || booking.phone1 || "-" }}</p>
              <p class="up-dacha">{{ booking.dachaId?.name || "Noma'lum Dacha" }}</p>
              <span class="up-date">{{ $dView(booking.startDate) }} — {{ $dView(booking.endDate) }}</span>
            </div>
          </div>
          <div class="up-right actions">
            <button class="approve-btn" @click="openConfirmModal(booking)">✅ Tasdiqlash</button>
            <button class="decline-btn" @click="cancelBooking(booking._id)">❌ Bekor</button>
          </div>
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
            <div class="avatar">{{ getInitials(booking.name || booking.OrderedUser) }}</div>
            <div class="up-info">
              <h4>{{ booking.name || booking.OrderedUser || 'Mijoz' }}</h4>
              <p class="up-dacha">{{ booking.dachaId?.name || "Noma'lum Dacha" }}</p>
            </div>
          </div>
          <div class="up-right">
            <span class="up-date">{{ $dView(booking.startDate) }} — {{ $dView(booking.endDate) }}</span>
            <span class="up-price">{{ formatMoney(booking.totalPrice) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Premium Confirmation Modal -->
    <transition name="fade">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-content-premium">
          <!-- Glassmorphism Shimmer Effect -->
          <div class="shimmer-layer"></div>
          
          <div class="modal-header-fancy">
            <div class="header-main">
              <div class="header-icon">✨</div>
              <div class="header-text">
                <h3>Bookingni Tasdiqlash</h3>
                <p>Mijoz so'rovini qabul qilish</p>
              </div>
            </div>
            <button class="close-btn-fancy" @click="showModal = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          <div class="modal-body-fancy">
            <!-- Premium Summary Card -->
            <div class="booking-receipt">
              <div class="receipt-item">
                <span class="r-label">DACHA</span>
                <span class="r-value">🏡 {{ selectedBooking?.dachaId?.name }}</span>
              </div>
              <div class="receipt-divider"></div>
              <div class="receipt-item">
                <span class="r-label">MUDDAT</span>
                <span class="r-value">📅 {{ $dView(selectedBooking?.startDate) }} — {{ $dView(selectedBooking?.endDate) }}</span>
              </div>
            </div>

            <!-- Form Sections -->
            <div class="form-container">
              <div class="section-tag">
                <span class="tag-icon">👤</span>
                <span class="tag-text">Mijoz ma'lumotlari</span>
              </div>
              
              <div class="input-grid">
                <div class="input-group">
                  <label>Ism</label>
                  <div class="input-wrapper">
                    <input type="text" v-model="confirmData.name" placeholder="Ism" class="premium-input" />
                  </div>
                </div>
                <div class="input-group">
                  <label>Telefon</label>
                  <div class="input-wrapper">
                    <input type="text" v-model="confirmData.phone" placeholder="+998" class="premium-input" />
                  </div>
                </div>
              </div>

              <div class="section-tag mt-6">
                <span class="tag-icon">💰</span>
                <span class="tag-text">To'lov va Hisob-kitob</span>
              </div>

              <div class="input-grid">
                <div class="input-group">
                  <label>Umumiy summa (UZS)</label>
                  <div class="input-wrapper highlight">
                    <input type="number" v-model="confirmData.totalPrice" placeholder="0" class="premium-input text-bold" />
                  </div>
                </div>
                <div class="input-group">
                  <label>Oldindan to'lov (Avans)</label>
                  <div class="input-wrapper">
                    <input type="number" v-model="confirmData.prepayment" placeholder="0" class="premium-input" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer-fancy">
            <button class="btn-cancel-fancy" @click="showModal = false">Bekor qilish</button>
            <button class="btn-confirm-fancy" @click="confirmBooking" :disabled="confirmLoading">
              <span v-if="!confirmLoading">Tasdiqlash va Bron qilish 🚀</span>
              <span v-else class="loader-dots"><span>.</span><span>.</span><span>.</span></span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import api from "../utils/axios";
import { useToast } from "vue-toastification";

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
      recentBookings: [],
      pendingBookings: [],
      showModal: false,
      selectedBooking: null,
      confirmLoading: false,
      confirmData: {
        name: "",
        phone: "",
        totalPrice: 0,
        prepayment: 0
      },
      pollingInterval: null
    }
  },
  async mounted() {
    this.fetchOverview();
    await this.fetchPending();
    
    // Handle automatic modal opening from query
    const confirmId = this.$route.query.confirm;
    if (confirmId) {
      const booking = this.pendingBookings.find(b => b._id === confirmId);
      if (booking) {
        this.openConfirmModal(booking);
      }
    }
    
    // Start polling every 15 seconds
    this.pollingInterval = setInterval(() => {
      this.fetchPending();
      this.fetchOverview();
    }, 15000);
  },
  beforeUnmount() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  },
  methods: {
    async fetchPending() {
      try {
        const res = await api.get("/booking/pending");
        this.pendingBookings = res?.data || [];
      } catch (e) {
        console.error("Failed to fetch pending bookings", e);
      }
    },
    openConfirmModal(booking) {
      this.selectedBooking = booking;
      this.confirmData.name = booking.name || "";
      this.confirmData.phone = booking.phone || "";
      this.confirmData.totalPrice = booking.totalPrice || 0;
      this.confirmData.prepayment = booking.prepayment || 0;
      this.showModal = true;
    },
    async confirmBooking() {
      if (!this.selectedBooking) return;

      // VALIDATION: Ensure price is entered
      if (!this.confirmData.totalPrice || this.confirmData.totalPrice <= 0) {
        useToast().error("Iltimos, umumiy summani to'g'ri kiriting! 💰");
        return;
      }
      
      this.confirmLoading = true;
      try {
        await api.patch(`/booking/${this.selectedBooking._id}/confirm`, {
          name: this.confirmData.name,
          phone: this.confirmData.phone,
          totalPrice: Number(this.confirmData.totalPrice),
          prepayment: Number(this.confirmData.prepayment || 0)
        });
        
        useToast().success("Booking muvaffaqiyatli tasdiqlandi! ✅");
        this.showModal = false;
        
        // Remove the query param once confirmed
        if (this.$route.query.confirm) {
          this.$router.replace({ query: {} });
        }
        
        this.fetchPending();
        this.fetchOverview();
      } catch (e) {
        useToast().error(e.response?.data?.message || "Xatolik yuz berdi ❌");
      } finally {
        this.confirmLoading = false;
      }
    },
    async cancelBooking(id) {
      if (!confirm("Rostdan ham ushbu so'rovni bekor qilasizmi?")) return;
      try {
        await api.patch(`/booking/${id}/cancel`);
        useToast().success("So'rov bekor qilindi ❌");
        this.fetchPending();
      } catch (e) {
        useToast().error(e.response?.data?.message || "Xatolik");
      }
    },
    async fetchOverview() {
      try {
        this.loading = true;
        const results = await Promise.allSettled([
          api.get("/stats/overview"),
          api.get("/booking")
        ]);
        
        // Handle Statistics
        if (results[0].status === 'fulfilled') {
          this.stats = results[0].value || this.stats;
        } else {
          console.error("Stats Overview Error:", results[0].reason);
        }

        // Handle Recent Bookings
        if (results[1].status === 'fulfilled') {
          const rawBookings = results[1].value?.data || [];
          this.recentBookings = rawBookings.slice(0, 5);
        } else {
          console.error("Recent Bookings Error:", results[1].reason);
        }

      } catch (e) {
        console.error("Fatal Dashboard Error:", e);
      } finally {
        this.loading = false;
      }
    },
    formatMoney(val) {
      if (!val) return "0 UZS";
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + "M UZS";
      }
      return Number(val).toLocaleString("uz-UZ") + " UZS";
    },
    getInitials(name) {
      if (!name) return "?";
      const words = name.trim().split(/\s+/);
      if (words.length === 0) return "?";
      if (words.length === 1) return words[0].charAt(0).toUpperCase();
      return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
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
  margin-bottom: 20px;
}
.recent-bookings h3 {
  font-size: 16px;
  font-weight: 600;
}
.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.pulse-dot {
  width: 8px;
  height: 8px;
  background: #fbbf24;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.7);
  animation: pulse-ring 1.5s infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(251, 191, 36, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
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
  align-items: flex-start;
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
  margin-top: 4px;
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
.up-phone {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 4px;
}
.up-dacha {
  font-size: 12px;
  color: var(--primary-color);
  font-weight: 600;
  margin-bottom: 4px;
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

.actions {
  flex-direction: row !important;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.approve-btn, .decline-btn {
  padding: 8px 12px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.approve-btn {
  background: #16a34a;
  color: #fff;
}
.approve-btn:hover { background: #15803d; }

.decline-btn {
  background: rgba(220, 38, 38, 0.2);
  color: #f87171;
}
.decline-btn:hover { background: rgba(220, 38, 38, 0.4); }

.pending-card {
  border: 1px solid rgba(245, 158, 11, 0.3) !important;
  background: rgba(245, 158, 11, 0.05) !important;
}

/* PREMIUM MODAL STYLES REDESIGN */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.75);
  backdrop-filter: blur(24px) saturate(180%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.modal-content-premium {
  width: 100%;
  max-width: 480px;
  background: linear-gradient(165deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 32px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  position: relative;
  overflow: hidden;
  animation: modal-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modal-pop {
  0% { opacity: 0; transform: scale(0.95) translateY(10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.shimmer-layer {
  position: absolute;
  top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.modal-header-fancy {
  padding: 28px 28px 20px 28px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: rgba(37, 99, 235, 0.1);
  border: 1px solid rgba(37, 99, 235, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.header-text h3 {
  font-size: 20px;
  font-weight: 800;
  background: linear-gradient(to right, #fff, #94a3b8);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
}

.header-text p {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  margin-top: 2px;
}

.close-btn-fancy {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn-fancy:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.2);
}

.modal-body-fancy {
  padding: 0 28px 28px 28px;
}

.booking-receipt {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.receipt-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.r-label {
  font-size: 10px;
  font-weight: 800;
  color: #475569;
  letter-spacing: 0.1em;
}

.r-value {
  font-size: 14px;
  color: #f1f5f9;
  font-weight: 600;
}

.receipt-divider {
  height: 1px;
  background: linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.05), rgba(255,255,255,0));
}

.section-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.tag-icon { font-size: 14px; }
.tag-text {
  font-size: 13px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: -0.01em;
}

.input-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  margin-left: 2px;
}

.input-wrapper {
  position: relative;
  transition: all 0.2s;
}

.premium-input {
  width: 100%;
  background: rgba(15, 23, 42, 0.6) !important;
  border: 1.5px solid rgba(255, 255, 255, 0.05) !important;
  border-radius: 14px !important;
  padding: 12px 16px !important;
  color: #fff !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.premium-input:focus {
  background: rgba(15, 23, 42, 0.8) !important;
  border-color: #2563eb !important;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15) !important;
}

.input-wrapper.highlight .premium-input {
  border-color: rgba(37, 99, 235, 0.2) !important;
  background: rgba(37, 99, 235, 0.02) !important;
}

.text-bold { font-weight: 700 !important; font-size: 16px !important; color: #60a5fa !important; }

.modal-footer-fancy {
  padding: 24px 28px;
  background: rgba(2, 6, 23, 0.2);
  display: flex;
  gap: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.btn-cancel-fancy {
  flex: 1;
  padding: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  color: #94a3b8;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel-fancy:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #f8fafc;
}

.btn-confirm-fancy {
  flex: 1.6;
  padding: 14px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border: none;
  border-radius: 16px;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 8px 16px -4px rgba(37, 99, 235, 0.4);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.btn-confirm-fancy:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -6px rgba(37, 99, 235, 0.5);
  filter: brightness(1.1);
}

.btn-confirm-fancy:active {
  transform: translateY(0);
}

.btn-confirm-fancy:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loader-dots span {
  animation: dot-pulse 1.4s infinite;
  display: inline-block;
}
.loader-dots span:nth-child(2) { animation-delay: 0.2s; }
.loader-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dot-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
}

.mt-6 { margin-top: 24px; }

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}
</style>

