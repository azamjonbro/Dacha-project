<template>
  <div>
    <!-- BOTTOM NAVBAR -->
    <nav class="bottom-navbar">
      <div class="nav-brand">
        <h1 class="brand-title">Istanbul</h1>
      </div>
      <div class="nav-actions">
        <button class="icon-btn" @click="toggleTheme">
          <span v-if="isDarkMode">☀️</span>
          <span v-else>🌙</span>
        </button>
        <button class="add-btn" @click="openAddModal">+ Qo‘shish</button>
      </div>
    </nav>

    <!-- ADD DACHA MODAL -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
      <div class="modal">
        <h3>Dacha qo‘shish</h3>

        <input type="text" placeholder="Dacha nomi" v-model="newDacha.name" />

        <div class="modal-actions">
          <button class="cancel" @click="closeAddModal">Bekor qilish</button>
          <button class="save" @click="addDacha">Saqlash</button>
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
      isDarkMode: false,
    };
  },
  mounted() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
      this.isDarkMode = true;
    } else {
      document.body.removeAttribute('data-theme');
      this.isDarkMode = false;
    }
  },
  methods: {
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode;
      if (this.isDarkMode) {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
      }
    },
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
      } catch (error) {
        toast.error(
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

<style scoped>
.bottom-navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: var(--nav-bg);
  box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  border-top: 1px solid var(--border-color);
  z-index: 1000;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  transition: background-color 0.3s ease, border-color 0.3s ease;
}
.brand-title {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin: 0;
  color: var(--text-color);
}
.nav-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
.icon-btn {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  box-shadow: var(--card-shadow);
  transition: all 0.3s ease;
}
.icon-btn:active {
  transform: scale(0.92);
}
.add-btn {
  background: var(--primary-color);
  color: #fff;
  border: none;
  font-weight: 600;
  letter-spacing: 0.5px;
  border-radius: 24px;
  padding: 0 20px;
  height: 44px;
  font-size: 15px;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  transition: all 0.3s ease;
}
.add-btn:active {
  transform: scale(0.96);
  background: var(--primary-color-hover);
}
</style>


