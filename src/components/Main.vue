<template>
  <div class="page" @click.self="activeDay = null">
    <!-- INFO CARD -->
    <div class="card">
      <div>
        <h2 class="title">Istanbul</h2>
        <p class="status" :class="todayStatus.status">
          Bugun: {{ todayStatus.status.toUpperCase() }}
        </p>
      </div>

      <button class="primary-btn">Band qilish</button>
    </div>

    <!-- CALENDAR -->
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
        <span v-for="n in blanks" :key="'b'+n"></span>

        <div
          v-for="day in monthDays"
          :key="day"
          class="day"
          :class="getDayStatus(day).status"
          @click.stop="toggleTooltip(day)"
        >
          {{ day }}

          <!-- TOOLTIP -->
          <div v-if="activeDay === day" class="tooltip">
            <template v-if="getDayStatus(day).status === 'band'">
              <strong>❌ Band</strong>
              <p>👤 {{ getBookingInfo(day).by }}</p>
              <p>📅 {{ getBookingInfo(day).from }} → {{ getBookingInfo(day).to }}</p>
            </template>

            <template v-else>
              <strong>✅ Bo‘sh</strong>
              <p>Band qilish mumkin</p>
              <button class="tooltip-btn">Band qilish</button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DachaCalendar",
  data() {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      activeDay: null,
      days: ["Du", "Se", "Chor", "Pay", "Ju", "Shan", "Yak"],
      dacha: {
        bookings: [
          { from: "2026-01-10", to: "2026-01-15", by: "Ali" },
          { from: "2026-01-20", to: "2026-01-22", by: "Vali" },
        ],
      },
    };
  },

  computed: {
    monthDays() {
      return new Date(this.year, this.month + 1, 0).getDate();
    },
    blanks() {
      return new Date(this.year, this.month, 1).getDay();
    },
    monthName() {
      return new Date(this.year, this.month).toLocaleString("default", {
        month: "long",
      });
    },
    todayStatus() {
      const today = this.formatDate(new Date().getDate());
      return this.getStatusByDate(today);
    },
  },

  methods: {
    prevMonth() {
      this.month === 0 ? (this.month = 11, this.year--) : this.month--;
    },
    nextMonth() {
      this.month === 11 ? (this.month = 0, this.year++) : this.month++;
    },

    formatDate(day) {
      return `${this.year}-${String(this.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    },

    isInRange(date, from, to) {
      const d = new Date(date);
      return d >= new Date(from) && d <= new Date(to);
    },

    getStatusByDate(date) {
      for (const b of this.dacha.bookings) {
        if (this.isInRange(date, b.from, b.to)) {
          return { status: "band" };
        }
      }
      return { status: "bosh" };
    },

    getDayStatus(day) {
      return this.getStatusByDate(this.formatDate(day));
    },

    toggleTooltip(day) {
      this.activeDay = this.activeDay === day ? null : day;
    },

    getBookingInfo(day) {
      const date = this.formatDate(day);
      return this.dacha.bookings.find(b =>
        this.isInRange(date, b.from, b.to)
      );
    },
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

.status.band { color: var(--secondary-color); }
.status.bosh { color: var(--primary-color); }

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
  box-shadow: 0 10px 25px rgba(0,0,0,.4);
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
  .days{
    gap: 2px;
  }
  .day{
    height: 36px;
    gap: 4px;
    width: 36px;
  }
}
</style>
