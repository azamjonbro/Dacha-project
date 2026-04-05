<template>
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
          Bugun: {{ todayStatus(dacha).status.toUpperCase() }}
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
          <button @click="editDacha(dacha)">O'zgartirish</button>
          <button @click="deleteDacha(dacha._id)">O'chirish</button>
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
        </div>
      </div>
      
      <!-- Action Bar when tapped -->
      <transition name="slide-up">
        <div class="day-action-bar" v-if="activeDay && activeDay.dachaId === dacha._id">
           <div class="action-info" v-if="getBookingInfo(dacha, activeDay.day)">
             <div class="action-header">
                <span class="action-title bad">❌ Band qilingan</span>
                <span>{{ activeDay.day }} {{ monthName(dacha) }}</span>
             </div>
             <p class="action-client">Buyurtmachi: <strong>{{ getBookingInfo(dacha, activeDay.day).OrderedUser }}</strong></p>
             <button class="primary-btn mt-2 w-full" @click="editExistingBooking(dacha, activeDay.day)">Tahrirlash</button>
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

  <!-- MODALS (Extracted outside v-for to prevent duplication) -->
  <transition name="fade">
    <div v-if="showDeleteDachaMessage" class="sheet-overlay" @click.self="showDeleteDachaMessage = false"></div>
  </transition>
  <transition name="slide-up">
    <div v-if="showDeleteDachaMessage" class="bottom-sheet" style="z-index: 10000;">
      <div class="sheet-handle"></div>
      <h3 class="sheet-header" style="color: #fca5a5;">Dachani O'chirish</h3>
      <p class="sheet-desc" style="color: #94a3b8; text-align: center; margin-bottom: 16px; font-size: 13px;">Dacha va unga tegishli barcha ma'lumotlar bilan nima qilishni xohlaysiz?</p>
      
      <div class="sheet-actions">
        <button class="primary-btn w-full mb-3" @click="deleteConfirm('keep')">🗄️ Tarixda saqlash</button>
        <button class="danger-btn w-full mb-3" style="background:#dc2626; color:white; border:none; border-radius:14px; min-height:48px; font-weight:600;" @click="deleteConfirm('full')">🗑️ O'chirish</button>
        <button class="cancel-btn w-full mt-2" @click="cancel">Bekor qilish</button>
      </div>
    </div>
  </transition>

  <div
    class="message"
    v-if="showDeleteBookingMessage"
    @click.self="showDeleteBookingMessage = false"
  >
    <div class="message-modal">
      <h2>Ushbu band qilingan kunlarni o'chirmoqchimisiz ?</h2>
      <div class="btnbox">
        <button class="delete prev" @click="deleteBookingConfirm">
          O'chirish
        </button>
        <button class="cancel" @click="cancel">Ortga</button>
      </div>
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
          <p class="name">{{ item.OrderedUser }}</p>

          <div class="date">
            <p>{{ formattedDate(item.startDate) }}</p>
            <p>{{ formattedDate(item.endDate) }}</p>
          </div>

          <div class="price">
            <p>{{ formatMoney(item.totalPrice) }}</p>
            <p>{{ formatMoney(item.avans) }}</p>
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
import { useToast } from "vue-toastification";
const toast = useToast();
export default {
  components: {
    Booking,
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
      showDeleteDachaMessage: false,
      showDeleteBookingMessage: false,
      isCreate: "create",
      deleteBookingId: null,
      AllShowBookingItems: [],
      days: ["Du", "Se", "Cho", "Pa", "Ju", "Sha", "Ya"],
    };
  },

  methods: {
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
        if (booking) {
          this.editExistingBooking(dacha, day);
        } else {
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
      const now = new Date();

      const res = await api.get("/dacha");

      this.dachas = res.data.map((d) => ({
        ...d,
        booking: Array.isArray(d.booking) ? d.booking : [],
        calendar: {
          year: now.getFullYear(),
          month: now.getMonth(),
        },
      }));

      this.loading = false;
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
      this.activeMenu = null;
      this.showDeleteDachaMessage = true;
      this.selectDeleteDacha = id;
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
    formattedDate(date) {
      const d = new Date(date);
      const day = d.getDate();
      const months = [
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
      ];
      return `${day}-${months[d.getMonth()]}`;
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
      for (const b of dacha.booking) {
        if (this.isInRange(date, b.startDate, b.endDate)) {
          return { status: "band" };
        }
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

    toggleTooltip(dachaId, day) {
      this.activeDay =
        this.activeDay?.day === day && this.activeDay?.dachaId === dachaId
          ? null
          : { dachaId, day };
    },

    formatHuman(date) {
      return new Date(date).toLocaleDateString("uz-UZ");
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
  background: #334155;
  border-radius: 16px;
  padding: 16px;
  margin-top: 12px;
  border: 1px solid var(--border-color);
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
.action-client {
  font-size: 13px;
  color: var(--text-muted);
}
.action-client strong { color: white; }
.w-full { width: 100%; }
.mt-2 { margin-top: 8px; }

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
</style>
