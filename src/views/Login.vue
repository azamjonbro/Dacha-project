<template>
  <div class="login-wrapper">
    <!-- LOGIN CARD -->
    <form class="login-card" @submit.prevent="openCaptcha">
      <h2 class="title">Kirish</h2>
      <p class="subtitle">Hisobingizga kiring</p>

      <input
        v-model="form.username"
        type="text"
        placeholder="Username"
        required
      />

      <input
        v-model="form.password"
        type="password"
        placeholder="Parol"
        required
      />

      <button type="submit">Kirish</button>
    </form>

    <!-- CAPTCHA MODAL -->
    <div v-if="showCaptcha" class="modal-overlay">
      <div class="modal">
        <h3>Xavfsizlik tekshiruvi</h3>

        <div class="question">
          {{ firstNumber }} + {{ secondNumber }} = ?
        </div>

        <input
          v-model.number="captchaAnswer"
          type="number"
          placeholder="Javobni kiriting"
        />

        <p v-if="error" class="error">{{ error }}</p>

        <div class="modal-actions">
          <button class="cancel" @click="closeCaptcha">
            Bekor qilish
          </button>
          <button @click="checkCaptcha">
            Tasdiqlash
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";

const router = useRouter();
const toast = useToast();

const form = reactive({
  username: "",
  password: "",
});

const showCaptcha = ref(false);
const firstNumber = ref(0);
const secondNumber = ref(0);
const captchaAnswer = ref(null);
const error = ref("");

function openCaptcha() {
  generateNumbers();
  showCaptcha.value = true;
}

function closeCaptcha() {
  showCaptcha.value = false;
  captchaAnswer.value = null;
  error.value = "";
}

function generateNumbers() {
  firstNumber.value = Math.floor(Math.random() * 10) + 1;
  secondNumber.value = Math.floor(Math.random() * 10) + 1;
}

function checkCaptcha() {
  if (captchaAnswer.value === firstNumber.value + secondNumber.value) {
    closeCaptcha();
    submitLogin();
  } else {
    error.value = "❌ Noto‘g‘ri javob";
    captchaAnswer.value = null;
    generateNumbers();
  }
}

async function submitLogin() {
  try {
    const res = await fetch("https://dacha.techinfo.uz/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!data?.token) {
      toast.error(data?.message || "Login yoki parol noto‘g‘ri");
      return;
    }



    const decoded = jwtDecode(data.token);
    localStorage.setItem("token", data.token);
    localStorage.setItem("adminId", decoded._id || decoded.id);
    localStorage.setItem("adminRole", decoded.role);

    toast.success("Muvaffaqqiyatli kirdingiz ✅");

    setTimeout(() => {
      router.push("/");
    }, 600);
  } catch (err) {
    toast.error("Server bilan aloqa yo‘q ❌");
  }
}
</script>


<style scoped>
.login-wrapper {
  min-height: 100vh;
  background: var(--background-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 380px;
  background: var(--card-bg);
  padding: 40px 30px;
  border-radius: 24px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: var(--card-shadow);
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-color);
  text-align: center;
  margin-bottom: 2px;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 14px;
  color: var(--text-muted);
  text-align: center;
  margin-bottom: 12px;
}

input {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border-color);
  padding: 0 16px;
  min-height: 52px;
  border-radius: 14px;
  color: var(--text-color);
  font-size: 16px;
  transition: all 0.2s ease;
  width: 100%;
  outline: none;
}

input::placeholder {
  color: #64748b;
  font-weight: 400;
}

input:focus {
  border-color: var(--primary-color);
  background: rgba(15, 23, 42, 0.9);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

button {
  margin-top: 10px;
  padding: 0 20px;
  min-height: 52px;
  border-radius: 14px;
  background: var(--primary-color);
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.25);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

button:active {
  transform: scale(0.96);
}

button:hover {
  background: var(--primary-color-hover);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: var(--card-bg);
  padding: 30px;
  border-radius: 24px;
  width: 100%;
  max-width: 340px;
  border: 1px solid var(--border-color);
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: modalScale 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes modalScale {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.modal h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
}

.question {
  font-size: 32px;
  font-weight: 800;
  color: var(--primary-color);
  text-align: center;
  letter-spacing: 2px;
  background: rgba(37, 99, 235, 0.1);
  padding: 16px;
  border-radius: 16px;
  border: 1px dashed rgba(37, 99, 235, 0.3);
  margin: 8px 0;
}

.error {
  color: var(--danger-color);
  font-size: 14px;
  text-align: center;
  font-weight: 500;
  background: rgba(220, 38, 38, 0.1);
  padding: 10px;
  border-radius: 10px;
  margin-top: -4px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.modal-actions button {
  flex: 1;
  margin-top: 0;
  min-height: 48px;
  font-size: 15px;
}

.cancel {
  background: #334155;
  color: #f8fafc;
  box-shadow: none;
}

.cancel:hover {
  background: #475569;
}

/* MOBILE */
@media (max-width: 420px) {
  .login-card {
    padding: 32px 20px;
    border-radius: 28px;
  }
}
</style>

