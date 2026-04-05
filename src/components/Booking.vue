<template>
  <transition name="fade">
    <div v-if="isOpen" class="sheet-overlay" @click.self="close"></div>
  </transition>
  
  <transition name="slide-up">
    <div v-if="isOpen" class="bottom-sheet z-max">
      <div class="sheet-handle"></div>
      <h3 class="sheet-header">
        {{ mode === "create" ? "➕ Yangi Bandlik" : "✏️ Bandni tahrirlash" }}
      </h3>

      <div class="sheet-actions">
        <input 
          v-model="form.OrderedUser" 
          placeholder="Buyurtmachi ismi" 
          class="mb-2" 
        />

        <div class="date-row">
          <input 
            type="date" 
            v-model="form.startDate" 
            placeholder="Keladigan qaysi kun" 
            class="mb-2 w-half" 
          />
          <input 
            type="date" 
            v-model="form.endDate" 
            placeholder="Ketadigan qaysi kun" 
            class="mb-2 w-half" 
          />
        </div>

        <div class="price-row">
          <input
            type="number"
            v-model.number="form.totalPrice"
            placeholder="Umumiy narx"
            class="mb-2 w-half"
          />
          <input 
            type="number" 
            v-model.number="form.avans" 
            placeholder="Avans" 
            class="mb-2 w-half"
          />
        </div>

        <input v-model="form.phone1" placeholder="Telefon 1" class="mb-2" />
        <input v-model="form.phone2" placeholder="Telefon 2 (Ixtiyoriy)" class="mb-4" />

        <div class="action-buttons">
          <button class="primary-btn w-full" @click="submit">
            {{ mode === "create" ? "Saqlash" : "Yangilash" }}
          </button>
          
          <button v-if="mode === 'edit'" class="danger-btn w-full mt-2" @click="showDeleteOptions = true">
            🗑️ O'chirish
          </button>

          <button class="cancel-btn w-full mt-2" @click="close">Bekor qilish</button>
        </div>
      </div>
    </div>
  </transition>

  <!-- Nested Deletion Choices -->
  <transition name="fade">
    <div v-if="showDeleteOptions" class="sheet-overlay z-super"></div>
  </transition>
  <transition name="slide-up">
    <div v-if="showDeleteOptions" class="bottom-sheet z-super-top">
      <div class="sheet-handle"></div>
      <h3 class="sheet-header danger-text">Bandlikni O'chirish</h3>
      <p class="text-center text-muted mb-4">Ushbu jarayon uchun qaysi o'chirish usulini tanlaysiz?</p>
      
      <div class="sheet-actions">
        <button class="primary-btn w-full mb-3" @click="fireDelete('keep')">🗄️ Tarixni saqlash</button>
        <button class="danger-btn w-full mb-3" @click="fireDelete('full')">🗑️ O'chirish</button>
        <button class="cancel-btn w-full mt-2" @click="showDeleteOptions = false">Bekor qilish</button>
      </div>
    </div>
  </transition>
</template>

<script>
import api from "../utils/axios";
import { useToast } from "vue-toastification";
const toast = useToast();

export default {
  props: {
    selected: {
      type: [String, Number],
    },
    mode: {
      type: String,
      default: "create",
    },
    dachaId: String,
    booking: Object,
    defaultStartDate: String,
  },

  data() {
    return {
      isOpen: false,
      showDeleteOptions: false,
      form: {
        OrderedUser: "",
        startDate: "",
        endDate: "",
        totalPrice: null,
        avans: null,
        phone1: "",
        phone2: "",
        isActive: true,
      },
    };
  },

  mounted() {
    setTimeout(() => {
      this.isOpen = true;
    }, 10);

    if (this.mode === "edit" && this.booking) {
      this.form = {
        OrderedUser: this.booking.OrderedUser,
        startDate: this.booking.startDate.slice(0, 10),
        endDate: this.booking.endDate.slice(0, 10),
        totalPrice: this.booking.totalPrice,
        avans: this.booking.avans,
        phone1: this.booking.phone1,
        phone2: this.booking.phone2,
        isActive: this.booking.isActive,
      };
    } else if (this.defaultStartDate) {
      this.form.startDate = this.defaultStartDate;
    }
  },

  methods: {
    close() {
      this.isOpen = false;
      this.showDeleteOptions = false;
      setTimeout(() => {
        this.$emit('close');
      }, 300);
    },
    async submit() {
      try {
        const payload = {
          dachaId: this.dachaId,
          OrderedUser: this.form.OrderedUser,
          startDate: this.form.startDate,
          endDate: this.form.endDate,
          totalPrice: this.form.totalPrice,
          avans: this.form.avans,
          phone1: this.form.phone1,
          phone2: this.form.phone2,
        };

        if (this.mode === "create") {
          await api.post("/booking", payload);
          toast.success("Band qilindi ✅");
        } else {
          await api.put(`/booking/${this.booking._id}`, payload);
          toast.success("Yangilandi ✅");
        }

        this.$emit("saved");
        this.close();
      } catch (e) {
        console.error("API ERROR:", e);
        toast.error(e.message || "Xatolik yuz berdi ❌");
      }
    },
    async fireDelete(modeStr) {
      try {
        const res = await api.delete(`/booking/${this.booking._id}?mode=${modeStr}`);
        toast.success(modeStr === 'full' ? "To'liq bazadan o'chirildi ✅" : "Tarixga arxivlandi 🗄️");
        this.$emit("saved");
        this.close();
      } catch (e) {
        toast.error(e.message || "Xatolik yuz berdi");
      }
    }
  },
};
</script>

<style scoped>
.z-max {
  z-index: 10000;
}
.z-super {
  z-index: 10001;
}
.z-super-top {
  z-index: 10002;
  background: var(--card-bg);
}
.sheet-overlay {
  z-index: 9999;
}
.bottom-sheet {
  max-height: 90vh;
  overflow-y: auto;
}
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.mt-2 { margin-top: 8px; }
.w-full { width: 100%; }

.date-row, .price-row {
  display: flex;
  gap: 10px;
}
.w-half { 
  flex: 1; 
  min-width: 0; /* Avoid flex overflow on tiny device dates */
  height: 48px;
}

.text-center { text-align: center; }
.text-muted { color: #94a3b8; font-size: 13px; line-height: 1.4; }
.danger-text { color: #fca5a5; }

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
