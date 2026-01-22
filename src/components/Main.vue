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
          ]"
          @click.stop="!isPastDay(dacha, day) && toggleTooltip(dacha._id, day)"
        >
          {{ day }}
          <div
            v-if="activeDay?.day === day && activeDay?.dachaId === dacha._id"
            class="tooltip"
          >
            <template v-if="getBookingInfo(dacha, day)">
              <strong>❌ Band</strong>
              <p>Kim: {{ getBookingInfo(dacha, day).OrderedUser }}</p>
              <p>
                {{ formatHuman(getBookingInfo(dacha, day).startDate) }} →
                {{ formatHuman(getBookingInfo(dacha, day).endDate) }}
              </p>
              <p>
                Summa {{ formatMoney(getBookingInfo(dacha, day).totalPrice) }}
              </p>
              <p>Avans {{ formatMoney(getBookingInfo(dacha, day).avans) }}</p>
            </template>

            <template v-else>
              <strong>✅ Bo‘sh</strong>
              <button @click="showBookingModal(dacha._id)">Band qilish</button>
            </template>
          </div>
        </div>
      </div>
      <div
        class="message"
        v-if="showDeleteDachaMessage"
        @click.self="showDeleteDachaMessage = false"
      >
        <div class="message-modal">
          <h2>Dachani o'chirmoqchimisiz ?</h2>
          <div class="btnbox">
            <button class="delete prev" @click="deleteConfirm">
              O'chirish
            </button>
            <button class="cancel" @click="cancel">Ortga</button>
          </div>
        </div>
      </div>
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
    </div>
  </div>

  <p v-if="loading" class="loading">Yuklanmoqda...</p>
  <Booking
    v-if="bookingModal"
    :booking="selectedDacha"
    :mode="isCreate"
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
      selectedDacha: null,
      selectDeleteDacha: null,
      showAllBookigStatus: false,
      showDeleteDachaMessage: false,
      showDeleteBookingMessage: false,
      isCreate : "create",
      deleteBookingId: null,
      AllShowBookingItems: [],
      days: ["Du", "Se", "Cho", "Pa", "Ju", "Sha", "Ya"],
    };
  },

  methods: {
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
    async deleteConfirm() {
      let data = await api.delete("/dacha/" + this.selectDeleteDacha);
      if (data.deleted) {
        this.getAllDachas();
        toast.success("Dacha muvaffaqqiyatli o'chirildi");
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
