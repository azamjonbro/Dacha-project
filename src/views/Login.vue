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
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";

/* ROUTER & TOAST */
const router = useRouter();
const toast = useToast();

/* LOGIN DATA */
const form = reactive({
  username: "",
  password: "",
});

/* CAPTCHA STATE */
const showCaptcha = ref(false);
const firstNumber = ref(0);
const secondNumber = ref(0);
const captchaAnswer = ref(null);
const error = ref("");

/* OPEN CAPTCHA */
function openCaptcha() {
  generateNumbers();
  showCaptcha.value = true;
}

/* CLOSE CAPTCHA */
function closeCaptcha() {
  showCaptcha.value = false;
  captchaAnswer.value = null;
  error.value = "";
}

/* RANDOM NUMBERS */
function generateNumbers() {
  firstNumber.value = Math.floor(Math.random() * 10) + 1;
  secondNumber.value = Math.floor(Math.random() * 10) + 1;
}

/* CHECK CAPTCHA */
function checkCaptcha() {
  if (captchaAnswer.value === firstNumber.value + secondNumber.value) {
    closeCaptcha();
    submitLogin();
  } else {
    error.value = "❌ Noto‘g‘ri javob. Qayta urinib ko‘ring";
    captchaAnswer.value = null;
    generateNumbers();
  }
}

/* LOGIN REQUEST */
async function submitLogin() {
  try {
    const res = await fetch(
      "https://dacha.techinfo.uz/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      }
    );

    const data = await res.json();

    // ❌ TOKEN YO‘Q
    if (!data?.token) {
      toast.error(data?.message || "Login yoki parol noto‘g‘ri");
      return;
    }

    // ✅ TOKEN BOR
    localStorage.setItem("token", JSON.stringify(data.token));

    toast.success("Muvaffaqqiyatli kirdingiz ✅");

    setTimeout(() => {
      router.push("/");
    }, 800);

  } catch (err) {
    console.error(err);
    toast.error("Server bilan aloqa yo‘q ❌");
  }
}
</script>

<style>

    input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}
    *{
        margin: 0;
        padding: 0;
    }
/* PAGE */
.login-wrapper {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #0f0f0f;
  font-family: system-ui;
}

/* CARD */
.login-card {
  width: 100%;
  max-width: 360px;
  background: #181818;
  padding: 32px;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* TEXT */
.title {
  color: #fff;
  font-size: 24px;
}
.subtitle {
  color: #9ca3af;
  font-size: 14px;
}

/* INPUT */
input {
  background: #111;
  border: 1px solid #2a2a2a;
  padding: 12px;
  border-radius: 10px;
  color: #fff;
}
input:focus {
  border-color: #4caf50;
}

/* BUTTON */
button {
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: #4caf50;
  color: #fff;
  cursor: pointer;
}
button:hover {
  background: #45a049;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: grid;
  place-items: center;
}

.modal {
  background: #181818;
  padding: 24px;
  border-radius: 14px;
  width: 300px;
  text-align: center;
}

.modal h3 {
  color: #fff;
  margin-bottom: 12px;
}

.question {
  font-size: 22px;
  color: #4caf50;
  margin-bottom: 12px;
}

/* ERROR */
.error {
  color: #ff4d4f;
  font-size: 13px;
  margin-top: 6px;
}

/* ACTIONS */
.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.cancel {
  background: #333;
}
</style>
