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
    console.error(err);
    toast.error("Server bilan aloqa yo‘q ❌");
  }
}
</script>



