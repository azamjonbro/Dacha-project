<template>
  <div class="page">
    <!-- DACHA INFO -->
    <div class="card">
      <div class="card-left">
        <h2>Istambul</h2>
        <p :class="todayStatus.status">
          Bugun: {{ todayStatus.status.toUpperCase() }}
        </p>
      </div>
      <div class="right">
          <div class="icons">
            <img src="../assets/trash.svg" loading="lazy" alt="this is trash icon" />
            <img src="../assets/edit-2.svg" loading="lazy" alt="this is edit icon" />
          </div>
          <button class="primary-btn">Band qilish</button>
      </div>
    </div>

    <!-- CALENDAR -->
    <div class="calendar-card">
      <div class="calendar-header">
        <div class="prev" @click="prevMonth">‹</div>
        <h3>{{ monthName }} {{ year }}</h3>
        <div class="next" @click="nextMonth">›</div>
      </div>

      <div class="weekdays">
        <span v-for="d in days" :key="d">{{ d }}</span>
      </div>

      <div class="days">
        <span v-for="n in blanks" :key="'b' + n" class="empty"></span>

        <div
          v-for="day in monthDays"
          :key="day"
          class="day"
          :class="getDayStatus(day).status"
          @click="selectDay(day)"
        >
          <span class="day-number">{{ day }}</span>
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
      days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],

      dacha: {
        name: "Istanbul",
        bookings: [
          {
            from: "2026-01-10",
            to: "2026-01-15",
            by: "Ali",
          },
          {
            from: "2026-01-20",
            to: "2026-01-22",
            by: "Vali",
          },
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
      if (this.month === 0) {
        this.month = 11;
        this.year--;
      } else this.month--;
    },

    nextMonth() {
      if (this.month === 11) {
        this.month = 0;
        this.year++;
      } else this.month++;
    },

    formatDate(day) {
      return `${this.year}-${String(this.month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
    },

    isInRange(date, from, to) {
      const d = new Date(date);
      return d >= new Date(from) && d <= new Date(to);
    },

    getStatusByDate(date) {
      for (const booking of this.dacha.bookings) {
        if (this.isInRange(date, booking.from, booking.to)) {
          return { status: "band", by: booking.by };
        }
      }
      return { status: "bo'sh", by: null };
    },

    getDayStatus(day) {
      return this.getStatusByDate(this.formatDate(day));
    },

    selectDay(day) {
      const date = this.formatDate(day);
      console.log("Tanlangan sana:", date, this.getStatusByDate(date));
    },
  },
};
</script>

<style>
/* PAGE */
.page {
  width: 100%;
  padding: 10px;
  font-family: "Inter", system-ui, sans-serif;
  background: var(--background-color);
  color: var(--text-color);
  border: 1px solid #e5e7eb75;
  border-radius: 8px;
}
.right{
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}
.icons{
    display: flex;
    gap: 10px;
}
.icons img{
    width: 20px;
    height: 20px;
    cursor: pointer;
}

/* CARD */
.card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #484848;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}
.card-left h2 {
  margin: 0;
  font-size: 16px;
}

.card-left p {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 600;
}
.card-left .band {
  color: #dc2626;
}
.card-left .bosh {
  color: #16a34a;
}

/* BUTTON */
.next,
.prev,
.primary-btn {
  background: linear-gradient(135deg, #16a34a, #22c55e);
  border: none;
  color: white;
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

/* CALENDAR */
.calendar-card {
  background: #525252;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.calendar-header h3 {
  margin: 0;
  font-size: 18px;
}

/* WEEKDAYS */
.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
}

/* DAYS GRID */
.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.day {
  background: #f9fafb;
  border-radius: 10px;
  padding: 10px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s ease;
  color: #000;
  position: relative;
}
.day:hover {
  transform: translateY(-2px);
}

/* DAY STATES */
.day.band {
  background: #f6abab;
  color: #991b1b;
}
.day.bosh {
  background: #ecfdf5;
  color: #065f46;
}

.day-number {
  font-weight: 600;
  font-size: 10px;
}

.day small {
  display: block;
  margin-top: 4px;
  font-size: 11px;
}

.empty {
  visibility: hidden;
}

@media (max-width: 500px) {
  .day {
    background: #f9fafb;
    border-radius: 10px;
    width: 100%;
    height: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: 0.2s ease;
    color: #000;
    position: relative;
  }
}
</style>
