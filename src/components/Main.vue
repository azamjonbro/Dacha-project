<template>
  <div
    class="page"
    v-for="dacha in dachas"
    :key="dacha._id"
    @click.self="activeDay = null"
  >
    <div class="card">
      <div>
        <h2 class="title">{{ dacha.name }}</h2>
        <p class="status" :class="todayStatus(dacha).status">
          Bugun: {{ todayStatus(dacha).status.toUpperCase() }}
        </p>
      </div>

      <button class="primary-btn">Band qilish</button>
    </div>

    <div class="calendar-card">
      <div class="calendar-header">
        <span @click="prevMonth">‹</span>
        <h3>{{ monthName }} {{ year }}</h3>
        <span @click="nextMonth">›</span>
      </div>

      <div class="weekdays">
        <span v-for="d in days" :key="d">{{ d }}</span>
      </div>

      <div class="days">
        <span v-for="n in blanks" :key="'b' + n"></span>

        <div
          v-for="day in monthDays"
          :key="day"
          class="day"
          :class="[
            getDayStatus(dacha, day).status,
            { disabled: isPastDay(day) }
          ]"
          @click.stop="!isPastDay(day) && toggleTooltip(dacha._id, day)"
        >
          {{ day }}

          <div
            v-if="activeDay?.day === day && activeDay?.dachaId === dacha._id"
            class="tooltip"
          >
            <template v-if="getBookingInfo(dacha, day)">
              <strong>❌ Band</strong>
              <p>Kim: {{getBookingInfo(dacha, day).OrderedUser}}</p>
              <p>
                {{ formatHuman(getBookingInfo(dacha, day).startDate) }}
                →
                {{ formatHuman(getBookingInfo(dacha, day).endDate) }}
              </p>
              <p>Summa {{ formatMoney(getBookingInfo(dacha, day).totalPrice) }}</p>
              <p>Avans {{ formatMoney(getBookingInfo(dacha, day).avans) }}</p>
            </template>

            <template v-else>
              <strong>✅ Bo‘sh</strong>
              <button class="tooltip-btn">Band qilish</button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>

  <p v-if="loading" class="loading">Yuklanmoqda...</p>
</template>


<script>
import api from "../utils/axios";

export default {
  data() {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      activeDay: null,
      loading: false,
      days: ["Du", "Se", "Cho", "Pa", "Ju", "Sha", "Ya"],
      dachas: [],
    };
  },

  computed: {
    monthDays() {
      return new Date(this.year, this.month + 1, 0).getDate();
    },

    blanks() {
      const firstDay = new Date(this.year, this.month, 1).getDay();
      return firstDay === 0 ? 6 : firstDay - 1;
    },

    monthName() {
      return new Date(this.year, this.month).toLocaleString("uz-UZ", {
        month: "long",
      });
    },
  },

  methods: {
    async getAllDachas() {
      this.loading = true;
      const res = await api.get("/dacha");

      this.dachas = res.data.map(d => ({
        ...d,
        booking: Array.isArray(d.booking) ? d.booking : [],
      }));

      this.loading = false;
    },

    prevMonth() {
      this.month === 0 ? ((this.month = 11), this.year--) : this.month--;
    },

    nextMonth() {
      this.month === 11 ? ((this.month = 0), this.year++) : this.month++;
    },

    formatDate(day) {
      return `${this.year}-${String(this.month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
    },

    isPastDay(day) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(this.year, this.month, day) < today;
    },

    isInRange(date, from, to) {
      const d = new Date(date);
      return d >= new Date(from) && d <= new Date(to);
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
      return this.getStatusByDate(dacha, this.formatDate(day));
    },

    getBookingInfo(dacha, day) {
      const date = this.formatDate(day);
      return (
        dacha.booking.find(b =>
          this.isInRange(date, b.startDate, b.endDate)
        ) || null
      );
    },

    todayStatus(dacha) {
      const today = this.formatDate(new Date().getDate());
      return this.getStatusByDate(dacha, today);
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
  },

  mounted() {
    this.getAllDachas();
  },
};
</script>




<style scoped>
:root {
  --primary-color: #4caf50;
  --primary-color-hover: #45a049;
  --secondary-color: #ff9800;
  --background-color: rgba(38, 38, 38, 1);
  --text-color: #ffffff;
}

.disabled {
  background: #676767 !important;
  color: #000 !important;
  cursor: disabled;
}

.page {
  background: var(--background-color);
  color: var(--text-color);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: #1f1f1f;
  border-radius: 14px;
  padding: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  margin: 0;
}

.status.band {
  color: var(--secondary-color);
}

.status.bosh {
  color: var(--primary-color);
}

.primary-btn {
  background: var(--primary-color);
  color: #000;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
}

.calendar-card {
  background: #1b1b1b;
  border-radius: 14px;
  padding: 12px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.weekdays,
.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-top: 10px;
  gap: 6px;
}

.weekdays span {
  text-align: center;
  opacity: 0.6;
  font-size: 12px;
}

.day {
  position: relative;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.day.bosh {
  background: rgba(76, 175, 80, 0.15);
  color: var(--primary-color);
}

.day.band {
  background: rgba(255, 152, 0, 0.2);
  color: var(--secondary-color);
}

.tooltip {
  position: absolute;
  bottom: 115%;
  left: 50%;
  transform: translateX(-50%);
  background: #000;
  padding: 10px;
  border-radius: 10px;
  min-width: 180px;
  z-index: 10;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
}

.tooltip-btn {
  margin-top: 8px;
  width: 100%;
  background: var(--primary-color);
  border: none;
  padding: 6px;
  border-radius: 6px;
}

@media (max-width: 600px) {
  .page {
    padding: 12px;
  }

  .days {
    gap: 2px;
  }

  .day {
    height: 36px;
    gap: 4px;
    width: 36px;
  }
}
</style>
