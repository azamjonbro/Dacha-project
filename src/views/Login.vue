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
  background: #121212;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Inter, system-ui;
}

.login-card {
  width: 100%;
  max-width: 360px;
  background: #1e1e1e;
  padding: 32px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.title {
  font-size: 24px;
  color: #fff;
}

.subtitle {
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 8px;
}

input {
  background: #111;
  border: 1px solid #2a2a2a;
  padding: 12px;
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
}

input::placeholder {
  color: #6b7280;
}

input:focus {
  border-color: #4caf50;
}

button {
  margin-top: 6px;
  padding: 12px;
  border-radius: 10px;
  background: #4caf50;
  color: #000;
  font-weight: 600;
  transition: 0.2s;
  outline: none;
  border: none;
}

button:hover {
  background: #43a047;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: #1e1e1e;
  padding: 24px;
  border-radius: 16px;
  width: 320px;
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal h3 {
  margin-bottom: 6px;
}

.question {
  font-size: 24px;
  font-weight: 700;
  color: #4caf50;
  text-align: center;
}

.error {
  color: #ff4d4f;
  font-size: 13px;
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.modal-actions button {
  flex: 1;
}

.cancel {
  background: #333;
  color: #fff;
}

.cancel:hover {
  background: #444;
}

/* MOBILE */
@media (max-width: 420px) {
  .login-card {
    margin: 0 10px;
    padding: 24px;
  }

  .modal {
    width: 90%;
  }
}

</style>

