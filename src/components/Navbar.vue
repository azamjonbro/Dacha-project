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
        status: "bo'sh",
      },
    };
  },

  methods: {
    openAddModal() {
      this.showAddModal = true;
    },
    async addDacha() {
      if (!this.newDacha.name.trim()) {
        this.$toast("Dacha nomini kiriting ❗", "error");
        return;
      }

      try {
        await api.post("/dacha", {
          ...this.newDacha,
        });

        toast.success("ishladi")
        this.closeAddModal();
      } catch (error) {
        toast.error("Xatolik yuz berdi ❌", "error");
      }
    },

    closeAddModal() {
      this.showAddModal = false;
      this.newDacha = { name: "", status: "bo'sh" };
    },
  },
};
</script>

<style>
.navbar {
  padding: 1rem 2rem;
  background-color: #333;
  color: white;
  border-radius: 8px;
}

.nav-brand {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-btn {
  background: #2ecc71;
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal {
  background: var(--background-color);
  padding: 20px;
  width: 300px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal input,
.modal select {
  padding: 10px;
  border-radius: 6px;
  background: var(--background-color);
  color: var(--text-color);
  border: 1px solid #ccc;
}
.modal input::placeholder {
  color: #999;
}
.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
.modal > h3 {
  color: #fff;
}
.save {
  background: #2ecc71;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
}

.cancel {
  background: #bdc3c7;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
}
.cancel:hover {
  background: #95a5a6;
}
</style>
