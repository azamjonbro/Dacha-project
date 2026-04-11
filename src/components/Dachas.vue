<template>
  <div class="dachas-container">
    <!-- MODALS (Consolidated at top for maximum layout stability) -->
    
    <!-- Dacha Delete Modal -->
    <transition name="fade">
      <div v-if="showDeleteDachaMessage" class="sheet-overlay" @click.self="showDeleteDachaMessage = false"></div>
    </transition>
    <transition name="slide-up">
      <div v-if="showDeleteDachaMessage" class="bottom-sheet z-super-top">
        <div class="sheet-handle"></div>
        <h3 class="sheet-header danger-text">Dachani O'chirish</h3>
        <p class="text-center text-muted mb-4">Dacha va unga tegishli barcha ma'lumotlar bilan nima qilishni xohlaysiz?</p>
        
        <div class="sheet-actions">
          <button class="primary-btn w-full mb-3" @click="deleteConfirm('keep')">🗄️ Tarixda saqlash</button>
          <button class="danger-btn w-full mb-3" @click="deleteConfirm('full')">🗑️ O'chirish</button>
          <button class="cancel-btn w-full mt-2" @click="cancel">Bekor qilish</button>
        </div>
      </div>
    </transition>

    <!-- Dacha Edit Modal -->
    <transition name="fade">
      <div v-if="showEditDachaModal" class="sheet-overlay" @click.self="closeEditDachaModal"></div>
    </transition>
    <transition name="slide-up">
      <div v-if="showEditDachaModal" class="bottom-sheet z-super-top" style="min-height: 50vh;">
        <div class="sheet-handle" @click="closeEditDachaModal"></div>
        <h3 class="sheet-header">Dachani tahrirlash</h3>
        
        <div class="modal-form-content">
          <div class="input-field">
            <label>Nomi</label>
            <input class="modern-input" type="text" v-model="editDachaPayload.name" />
          </div>

          <div class="input-field">
            <label>Manzil</label>
            <input class="modern-input" type="text" v-model="editDachaPayload.location" placeholder="Nanay, Namangan" />
          </div>

          <div class="input-field">
            <label>Media (Rasm va Video)</label>
            <MediaDropzone 
              v-model:images="editDachaPayload.images" 
              v-model:video="editDachaPayload.video"
              @uploading="mediaUploading = $event"
            />
          </div>

          <div class="input-field">
            <FeatureSelector v-model="editDachaPayload.features" />
          </div>
        </div>
        
        <div class="sheet-actions mt-4">
          <button 
            class="primary-btn w-full mb-3" 
            @click="saveEditedDacha" 
            :disabled="mediaUploading"
          >
            {{ mediaUploading ? "Fayl yuklanmoqda..." : "Saqlash" }}
          </button>
          <button class="cancel-btn w-full mt-2" @click="closeEditDachaModal">Ortga</button>
        </div>
      </div>
    </transition>

    <!-- Booking Delete Modal (The "Message" Modal) -->
    <transition name="fade">
      <div v-if="showDeleteBookingMessage" class="sheet-overlay" @click.self="showDeleteBookingMessage = false">
        <div class="bottom-sheet z-super-top" @click.stop>
          <div class="sheet-handle"></div>
          <h3 class="sheet-header danger-text">Bandlikni o'chirish</h3>
          <p class="text-center text-muted mb-4">Ushbu band qilingan kunlarni rostan ham o'chirmoqchimisiz?</p>
          <div class="sheet-actions">
            <button class="danger-btn w-full mb-3" @click="deleteBookingConfirm">🗑️ O'chirish</button>
            <button class="cancel-btn w-full" @click="cancel">Bekor qilish</button>
          </div>
        </div>
      </div>
    </transition>

    <div
      class="page"
    v-for="dacha in dachas"
    :key="dacha._id"
    @click.self="activeDay = null"
  >
    <div
      class="card"
      @click.self="
        activeDay = null;
        activeMenu = null;
      "
    >
      <div >
        <h2 class="title">{{ dacha.name }}</h2>
        <p class="status" :class="todayStatus(dacha).status">
          Bugun: {{ formatTodayStatus(todayStatus(dacha).status) }}
        </p>
      </div>

      <div class="right">
        <div
          class="lines"
          aria-label="Menu"
          role="button"
          @click.stop="toggleMenu(dacha._id)"
        >
          <div class="line"></div>
          <div class="line"></div>
          <div class="line"></div>
        </div>
        <div v-if="activeMenu === dacha._id" class="menu-drop">
          <button @click.stop="editDacha(dacha)">O'zgartirish</button>
          <button @click.stop="deleteDacha(dacha._id)">O'chirish</button>
        </div>
        <button class="primary-btn" @click="showBookingModal(dacha._id)">
          Band qilish
        </button>
      </div>
    </div>

    <div class="calendar-card" @click.self="showAllBookigStatus=false">
      <div class="calendar-header"  >
        <span
          role="button"
          aria-label="Oldingi oy"
          class="next"
          @click="prevMonth(dacha)"
          >‹</span
        >
        <h3 @click="showAllBooking(dacha.booking)">{{ monthName(dacha) }} {{ dacha.calendar.year }}</h3>
        <span
          role="button"
          class="next"
          aria-label="Keyingi oy"
          @click="nextMonth(dacha)"
          >›</span
        >
      </div>

      <div class="weekdays">
        <span v-for="d in days" :key="d">{{ d }}</span>
      </div>

      <div class="days">
        <span v-for="n in getBlanks(dacha)" :key="'b' + n"></span>

        <div
          v-for="day in monthDays(dacha)"
          :key="day"
          class="day"
          :class="[
            getDayStatus(dacha, day).status,
            { disabled: isPastDay(dacha, day) },
            { 'is-selected': activeDay?.day === day && activeDay?.dachaId === dacha._id }
          ]"
          @mousedown="startPress(dacha._id, day)"
          @touchstart="startPress(dacha._id, day)"
          @mouseup="endPress(dacha, day)"
          @touchend="endPress(dacha, day)"
          @mouseleave="cancelPress"
          @touchmove="cancelPress"
        >
          <span class="day-number">{{ day }}</span>
          <div v-if="getDayStatus(dacha, day).status === 'pending'" class="pending-indicator"></div>
        </div>
      </div>
      
      <!-- Action Bar when tapped -->
      <transition name="slide-up">
        <div class="day-action-bar" v-if="activeDay && activeDay.dachaId === dacha._id">
           <div class="action-info" v-if="getBookingInfo(dacha, activeDay.day)">
             <div class="action-header">
                <span :class="['action-title', getBookingInfo(dacha, activeDay.day).status === 'pending' ? 'pending-text' : 'bad']">
                  {{ getBookingInfo(dacha, activeDay.day).status === 'pending' ? '🔔 So\'rov kutilmoqda' : '❌ Band qilingan' }}
                </span>
                <span>{{ activeDay.day }} {{ monthName(dacha) }}</span>
             </div>
             <p class="action-client">Mijoz: <strong>{{ getBookingInfo(dacha, activeDay.day).name || getBookingInfo(dacha, activeDay.day).OrderedUser }}</strong></p>
             <button v-if="getBookingInfo(dacha, activeDay.day).status === 'pending'" class="primary-btn mt-2 w-full" @click="goToDashboard(dacha, activeDay.day)">Dashboarddan tasdiqlash</button>
             <button v-else class="primary-btn mt-2 w-full" @click="editExistingBooking(dacha, activeDay.day)">Tahrirlash</button>
           </div>
           
           <div class="action-info" v-else>
             <div class="action-header">
                <span class="action-title good">✅ Bo'sh joy</span>
                <span>{{ activeDay.day }} {{ monthName(dacha) }}</span>
             </div>
             <button class="primary-btn mt-2 w-full" @click="bookNewDay(dacha, activeDay.day)">Band qilish</button>
           </div>
        </div>
      </transition>
  <!-- Action Bar ends here -->
    </div>
  </div>

  <p v-if="loading" class="loading">Yuklanmoqda...</p>
  <Booking
    v-if="bookingModal"
    :booking="isCreate === 'edit' ? selectedDacha : null"
    :dachaId="isCreate === 'create' ? selectedDacha : selectedDacha.dachaId"
    :mode="isCreate"
    :defaultStartDate="selectedStartDate"
    @close="bookingModal = false"
    @saved="getAllDachas()"
  />
  <div
    class="allBookings"
    v-if="showAllBookigStatus"
    @click.self="showDeleteBookingMessage = false; showAllBookigStatus= false"
  >
    <div class="allBookingModal">
      <div class="header">
        <p>Ega</p>
        <p>Sana</p>
        <p>Summa</p>
        <p></p>
      </div>
      <div class="items">
        <div class="item" v-for="item in AllShowBookingItems" :key="item._id">
          <p class="name">{{ item.name || item.OrderedUser }}</p>

          <div class="date">
            <p>{{ $dView(item.startDate) }}</p>
            <p>{{ $dView(item.endDate) }}</p>
          </div>

          <div class="price">
            <p>{{ formatMoney(item.totalPrice) }}</p>
            <p>{{ formatMoney(item.prepayment || item.avans) }}</p>
          </div>

          <div class="iconbox">
            <div class="edit" @click="editBooking(item)">🖋️</div>
            <div class="delete" @click="deleteBooking(item._id)">🗑️</div>
          </div>
        </div>
      </div>

      <div class="bottom">
        <button @click="closeAllBookingModalFunct" class="close add-btn">
          Ortga
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import api from "../utils/axios";
import Booking from "./Booking.vue";
import MediaDropzone from "./MediaDropzone.vue";
import FeatureSelector from "./FeatureSelector.vue";
import { useToast } from "vue-toastification";
const toast = useToast();
export default {
  components: {
    Booking,
    MediaDropzone,
    FeatureSelector
  },
  data() {
    return {
      loading: false,
      dachas: [],
      activeDay: null,
      activeMenu: null,
      bookingModal: false,
      selectedDacha: null, // used for active dacha or booking item
      selectedStartDate: null,
      pressTimer: null,
      isLongPress: false,
      selectDeleteDacha: null,
      showAllBookigStatus: false,
      showEditDachaModal: false,
      editDachaPayload: { _id: null, name: "", location: "", images: [], video: "", features: [] },
      mediaUploading: false,
      showDeleteDachaMessage: false,
      showDeleteBookingMessage: false,
      isCreate: "create",
      deleteBookingId: null,
      AllShowBookingItems: [],
      days: ["Du", "Se", "Cho", "Pa", "Ju", "Sha", "Ya"],
    };
  },

  methods: {
    editDacha(dacha) {
      this.activeMenu = null;
      this.editDachaPayload = {
        _id: dacha._id,
        name: dacha.name,
        location: dacha.location || "",
        images: Array.isArray(dacha.images) ? [...dacha.images] : [],
        video: dacha.video || "",
        features: Array.isArray(dacha.features) ? [...dacha.features] : []
      };
      this.showEditDachaModal = true;
    },
    closeEditDachaModal() {
      this.showEditDachaModal = false;
    },
    async saveEditedDacha() {
      try {
        const payload = { ...this.editDachaPayload };
        await api.put(`/dacha/${payload._id}`, { 
          name: payload.name, 
          location: payload.location,
          images: payload.images, 
          video: payload.video,
          features: payload.features
        });
        toast.success("Dacha tahrirlandi!");
        this.closeEditDachaModal();
        this.getAllDachas();
      } catch (e) {
        toast.error("Xatolik yuz berdi");
      }
    },
    startPress(dachaId, day) {
      this.isLongPress = false;
      this.pressTimer = setTimeout(() => {
        this.isLongPress = true;
      }, 500); // 500ms for long press
    },
    cancelPress() {
      if (this.pressTimer) clearTimeout(this.pressTimer);
    },
    endPress(dacha, day) {
      if (this.pressTimer) clearTimeout(this.pressTimer);
      if (this.isPastDay(dacha, day)) return;

      if (this.isLongPress) {
        // Trigger action immediately on long press
        const booking = this.getBookingInfo(dacha, day);
        if (booking && booking.status === 'confirmed') {
          this.editExistingBooking(dacha, day);
        } else if (!booking) {
          this.bookNewDay(dacha, day);
        }
      } else {
        // Short press defaults to toggling selection logic
        if (this.activeDay?.day === day && this.activeDay?.dachaId === dacha._id) {
           this.activeDay = null;
        } else {
           this.activeDay = { dachaId: dacha._id, day };
        }
      }
    },
    bookNewDay(dacha, day) {
      this.selectedDacha = dacha._id;
      this.selectedStartDate = this.formatDate(dacha, day);
      this.isCreate = "create";
      this.bookingModal = true;
      this.activeDay = null; // hide panel
    },
    editExistingBooking(dacha, day) {
      const booking = this.getBookingInfo(dacha, day);
      if (!booking) return;
      this.selectedDacha = booking;
      this.isCreate = "edit";
      this.bookingModal = true;
      this.activeDay = null;
    },
    toggleMenu(id) {
      this.activeMenu = this.activeMenu === id ? null : id;
    },
    async getAllDachas() {
      this.loading = true;
      try {
        const res = await api.get("/dacha");
        const list = res?.data || [];
        const now = new Date();

        this.dachas = list.map((d) => ({
          ...d,
          booking: Array.isArray(d.booking) ? d.booking : [],
          calendar: {
            year: now.getFullYear(),
            month: now.getMonth(),
          },
        }));
      } catch (e) {
        console.error("Failed to load dachas:", e);
      } finally {
        this.loading = false;
      }
    },
    showAllBooking(item) {
      this.showAllBookigStatus = true;
      this.AllShowBookingItems = item;
    },
    monthDays(d) {
      return new Date(d.calendar.year, d.calendar.month + 1, 0).getDate();
    },
    getBlanks(dacha) {
      const first = new Date(
        dacha.calendar.year,
        dacha.calendar.month,
        1,
      ).getDay();

      return first === 0 ? 6 : first - 1;
    },
    deleteDacha(id) {
      this.showDeleteDachaMessage = true;
      this.selectDeleteDacha = id;
      // Close menu after a tiny delay to ensure modal state is processed
      setTimeout(() => { this.activeMenu = null; }, 50);
    },
    async deleteConfirm(modeStr) {
      let data = await api.delete("/dacha/" + this.selectDeleteDacha + "?mode=" + modeStr);
      if (data.deleted) {
        this.getAllDachas();
        toast.success(modeStr === 'full' ? "Dacha to'liq tozalab tashlandi 🗑️" : "Dacha o'chirildi, tarix qoldi 🗄️");
        this.showDeleteDachaMessage = false;
      }
    },
    monthName(d) {
      return [
        "Yanvar",
        "Fevral",
        "Mart",
        "Aprel",
        "May",
        "Iyun",
        "Iyul",
        "Avgust",
        "Sentabr",
        "Oktabr",
        "Noyabr",
        "Dekabr",
      ][d.calendar.month];
    },
    closeAllBookingModalFunct() {
      this.showAllBookigStatus = false;
    },
    editBooking(item){
      this.bookingModal=true
      this.selectedDacha= item
      this.isCreate="edit"
    },
    prevMonth(d) {
      d.calendar.month === 0
        ? ((d.calendar.month = 11), d.calendar.year--)
        : d.calendar.month--;
    },
    deleteBooking(id) {
      this.deleteBookingId = id;
      this.showDeleteBookingMessage = true;
    },
    async deleteBookingConfirm() {
      await api.delete("/booking/" + this.deleteBookingId);
      this.getAllDachas();
      toast.success("Band bekor qilindi");
      this.showDeleteBookingMessage = false;
      this.showAllBookigStatus = false;
    },

    nextMonth(d) {
      d.calendar.month === 11
        ? ((d.calendar.month = 0), d.calendar.year++)
        : d.calendar.month++;
    },

    formatDate(dacha, day) {
      return `${dacha.calendar.year}-${String(dacha.calendar.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    },

    isPastDay(dacha, day) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(dacha.calendar.year, dacha.calendar.month, day) < today;
    },

    isInRange(date, from, to) {
      const d = new Date(date);
      const f = new Date(from);
      const t = new Date(to);

      const localD = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const localF = new Date(f.getFullYear(), f.getMonth(), f.getDate());
      const localT = new Date(t.getFullYear(), t.getMonth(), t.getDate());

      return localD >= localF && localD <= localT;
    },

    getStatusByDate(dacha, date) {
      const booking = dacha.booking.find((b) => this.isInRange(date, b.startDate, b.endDate));
      if (booking) {
        // If it's explicitly pending, use pending. Otherwise default to confirmed.
        return { status: booking.status === "pending" ? "pending" : "confirmed" };
      }
      return { status: "bosh" };
    },

    getDayStatus(dacha, day) {
      return this.getStatusByDate(dacha, this.formatDate(dacha, day));
    },

    getBookingInfo(dacha, day) {
      const date = this.formatDate(dacha, day);
      return (
        dacha.booking.find((b) =>
          this.isInRange(date, b.startDate, b.endDate),
        ) || null
      );
    },

    todayStatus(dacha) {
      const today = new Date().getDate();
      return this.getStatusByDate(dacha, this.formatDate(dacha, today));
    },

    formatTodayStatus(status) {
      if (status === 'pending') return 'Kutilmoqda 🔔';
      if (status === 'bosh') return 'Bo\'sh ✅';
      return 'Band ❌'; // Defaults to confirmed
    },

    goToDashboard(dacha, day) {
      const booking = this.getBookingInfo(dacha, day);
      if (booking) {
        this.$router.push(`/?confirm=${booking._id}`);
      } else {
        this.$router.push('/');
      }
    },

    toggleTooltip(dachaId, day) {
      this.activeDay =
        this.activeDay?.day === day && this.activeDay?.dachaId === dachaId
          ? null
          : { dachaId, day };
    },

    formatMoney(val) {
      return Number(val || 0).toLocaleString("uz-UZ");
    },
    cancel() {
      this.activeMenu = null;
      this.showDeleteDachaMessage = false;
      this.showDeleteBookingMessage = false;
    },

    async showBookingModal(id) {
      this.selectedDacha = id;
      this.bookingModal = true;
    },
  },

  mounted() {
    this.getAllDachas();
  },
};
</script>

<style scoped>
.is-selected {
  transform: scale(1.08); /* slight scale up for selected day */
  box-shadow: 0 0 0 2px var(--primary-color);
  z-index: 10;
}
.day-action-bar {
  background: #1e293b;
  border-radius: 16px;
  padding: 16px;
  margin-top: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
.action-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 14px;
}
.action-title.bad { color: #fca5a5; }
.action-title.good { color: #86efac; }
.action-title.pending-text { color: #fbbf24; }

.action-client {
  font-size: 13px;
  color: var(--text-muted);
}
.action-client strong { color: white; }
.w-full { width: 100%; }
.mt-2 { margin-top: 8px; }

/* Calendar Day States */
.day.confirmed {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(185, 28, 28, 0.3)) !important;
  color: #fca5a5 !important;
  border: 1.5px solid #ef4444 !important;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15), inset 0 0 8px rgba(239, 68, 68, 0.1);
  font-weight: 700;
  position: relative;
}

.day.confirmed::after {
  content: '✕';
  position: absolute;
  top: 2px;
  right: 4px;
  font-size: 8px;
  opacity: 0.6;
}

.day.pending {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(217, 119, 6, 0.15));
  color: #fbbf24;
  border: 1px dashed #fbbf24;
  position: relative;
  font-weight: 500;
}

.pending-indicator {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 6px;
  height: 6px;
  background: #fbbf24;
  border-radius: 50%;
  box-shadow: 0 0 8px #fbbf24;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}

.day.bosh {
  background: rgba(15, 23, 42, 0.3);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.05);
}



.status.confirmed { color: #f87171; }
.status.pending { color: #fbbf24; }
.status.bosh { color: #4ade80; }

/* Menu Styling */
.right {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}
.lines {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
}
.lines:active {
  background: rgba(255,255,255,0.1);
}
.line {
  width: 5px;
  height: 5px;
  background-color: #94a3b8;
  border-radius: 50%;
}
.menu-drop {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  min-width: 140px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  z-index: 100;
  gap: 4px;
}
.menu-drop button {
  background: transparent;
  border: none;
  color: #f8fafc;
  padding: 10px 12px;
  text-align: left;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  font-weight: 500;
}
.menu-drop button:active {
  background: rgba(255,255,255,0.1);
}

/* All Bookings Modal */
.allBookings {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.allBookingModal {
  background: var(--card-bg);
  width: 100%;
  max-width: 500px;
  border-radius: 24px;
  padding: 24px;
  border: 1px solid var(--border-color);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}
.allBookingModal .header {
  display: grid;
  grid-template-columns: 2fr 2fr 2fr 1fr;
  font-weight: 700;
  color: var(--text-muted);
  font-size: 13px;
  margin-bottom: 12px;
  padding: 0 8px;
}
.allBookingModal .items {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}
.allBookingModal .item {
  display: grid;
  grid-template-columns: 2fr 2fr 2fr 1fr;
  align-items: center;
  padding: 12px 8px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.allBookingModal .item:last-child {
  border-bottom: none;
}
.allBookingModal .name {
  font-size: 14px;
  font-weight: 600;
}
.allBookingModal .date p, .allBookingModal .price p {
  font-size: 12px;
}
.allBookingModal .iconbox {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.allBookingModal .iconbox div {
  cursor: pointer;
  font-size: 16px;
}
.allBookingModal .bottom {
  margin-top: 20px;
}

.dachas-container {
  min-height: 100%;
}

.z-super-top {
  z-index: 100005 !important;
}

.modal-form-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.input-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-field label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
}

.text-center { text-align: center; }
.text-muted { color: #94a3b8; font-size: 13px; line-height: 1.4; }
.danger-text { color: #fca5a5; }
.mb-4 { margin-bottom: 16px; }
.mt-4 { margin-top: 16px; }

.danger-btn {
  background: #dc2626;
  color: #ffffff;
  border: none;
  border-radius: 14px;
  min-height: 48px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
  transition: transform 0.2s ease, background 0.2s ease;
}
.danger-btn:active {
  transform: scale(0.95);
  background: #b91c1c;
}
</style>

