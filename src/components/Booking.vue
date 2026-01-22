<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <h3>
        {{ mode === "create" ? "➕ Band qilish" : "✏️ Bandni tahrirlash" }}
      </h3>

      <input v-model="form.OrderedUser" placeholder="Buyurtmachi ismi" />

      <input type="date" v-model="form.startDate" placeholder="Keladigan kun" />
      <input type="date" v-model="form.endDate" placeholder="Ketadigan kun" />

      <input
        type="number"
        v-model.number="form.totalPrice"
        placeholder="Umumiy narx"
      />
      <input type="number" v-model.number="form.avans" placeholder="Avans" />

      <input v-model="form.phone1" placeholder="Telefon 1" />
      <input v-model="form.phone2" placeholder="Telefon 2" />

      <!-- <select v-model="form.isActive">
        <option :value="true">Faol</option>
        <option :value="false">Faol emas</option>
      </select> -->

      <div class="actions">
        <button class="save" @click="submit">
          {{ mode === "create" ? "Saqlash" : "Yangilash" }}
        </button>
        <button class="cancel" @click="$emit('close')">Bekor qilish</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from "../utils/axios";
import { useToast } from "vue-toastification";
const toast = useToast();
export default {
  props: {
    selected: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      default: "create",
    },
    dachaId: String,
    booking: Object,
  },

  data() {
    return {
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
    }
  },

  methods: {
    async submit() {
      try {
        const payload = {
          dachaId: this.dachaId,
          OrderedUser: this.form.OrderedUser,
          startDate: this.form.startDate, // 🔥 STRING
          endDate: this.form.endDate, // 🔥 STRING
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
        this.$emit("close");
      } catch (e) {
        console.log("API ERROR:", e.response?.data);
        toast.error(e.response?.data?.message || "Xatolik yuz berdi ❌");
      }
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: #1e1e1e;
  color: #fff;
  padding: 24px;
  border-radius: 14px;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

input,
select {
  padding: 8px;
  border-radius: 8px;
  border: none;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.save {
  background: #4caf50;
  color: #fff;
}

.cancel {
  background: #444;
  color: #fff;
}
</style>
