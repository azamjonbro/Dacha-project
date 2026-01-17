<template>
  <div>
    <!-- NAVBAR -->
    <nav class="navbar">
      <div class="nav-brand">
        <h1>Istanbul</h1>
        <button class="add-btn" @click="openAddModal">➕ Dacha qo‘shish</button>
      </div>
    </nav>

    <!-- ADD DACHA MODAL -->
    <div v-if="showAddModal" class="modal-overlay">
      <div class="modal">
        <h3>Dacha qo‘shish</h3>

        <input type="text" placeholder="Dacha nomi" v-model="newDacha.name" />

        <select v-model="newDacha.status">
          <option value="bo'sh">Bo‘sh</option>
          <option value="band">Band</option>
        </select>

        <div class="modal-actions">
          <button class="save" @click="addDacha">Saqlash</button>
          <button class="cancel" @click="closeAddModal">Bekor qilish</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import api from "../utils/axios";
import { useToast } from "vue-toastification";
const toast = useToast()
export default {
  data() {
    return {
      showAddModal: false,
      newDacha: {
        name: "",
      },
    };
  },

  methods: {
    openAddModal() {
      this.showAddModal = true;
    },

    async addDacha() {
      if (!this.newDacha.name.trim()) {
        this.$toast.error("Dacha nomini kiriting ❗");
        return;
      }

      try {
        const adminId = localStorage.getItem("adminId");

        if (!adminId) {
          this.$toast.error("Admin topilmadi ❌");
          return;
        }

        await api.post("/dacha", {
          name: this.newDacha.name,
          adminId,
        });
        this.closeAddModal()

        toast.success("Dacha muvaffaqiyatli qo‘shildi ✅");
        this.$emit("reload")
        this.closeAddModal();
      } catch (error) {
        console.error(error);
        this.$toast.error(
          error?.response?.data?.message || "Xatolik yuz berdi ❌"
        );
      }
    },

    closeAddModal() {
      this.showAddModal = false;
      this.newDacha = { name: "" };
    },
  },
};
</script>


