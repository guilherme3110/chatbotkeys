<template>
  <n-space vertical size="large" class="p-6">
    <n-layout>
      <n-layout-content content-style="padding: 24px;">
        <n-grid y-gap="24" x-gap="24" :cols="24">
          <n-grid-item span="24">
            <n-h2>Bot Keys</n-h2>
            <n-input
              v-model:value="search"
              placeholder="Pesquisar bot por nome..."
              clearable
              class="w-1/2"
              @input="fetchKeys"
            />
          </n-grid-item>
          <n-grid-item span="24">
            <n-grid y-gap="24" x-gap="24" :cols="24">
              <n-grid-item
                span="6"
                v-for="bot in botKeys"
                :key="bot.id"
                v-if="!loading && botKeys.length > 0"
              >
                <n-card size="medium" embedded>
                  <template #cover>
                    <n-image
                      src="https://dummyimage.com/600x250/transparent/fff"
                      :alt="bot.nome"
                      object-fit="cover"
                      style="width: 100%; height: 250px"
                      @error="onImgError($event)"
                    />
                    <div style="padding: 0px 24px 24px">
                      <n-h3 class="text-center mb-4">{{ bot.nome }}</n-h3>
                      <p class="text-center mb-4">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s</p>
                      <div class="flex justify-center gap-10 mb-4">
                        <n-button
                          v-if="bot.whatsapp"
                          style="width:100%"
                          size="medium"
                          type="success"
                          @click="abrirWhatsapp(bot.whatsapp, bot.key)"
                        >
                          Abrir WhatsApp
                        </n-button>
                       
                       
                      </div>
                      <div class="flex justify-center gap-20 mb-4">
                        <n-button
                          v-if="bot.whatsapp"
                          style="width:100%"
                          size="medium"
                          type="success"
                          @click="irParaFeedback"
                        >
                         Enviar feedback
                        </n-button>
                       
                       
                      </div>
                    </div>
                  </template>
                </n-card>
              </n-grid-item>
            </n-grid>
          </n-grid-item>
        </n-grid>
      </n-layout-content>
    </n-layout>

    <n-spin v-if="loading" size="large" description="Carregando bots..." />

    <n-alert v-if="error" type="error" closable>
      Erro ao buscar bots: {{ error }}
    </n-alert>
    
    <router-view></router-view>
    <n-empty
      v-if="!loading && botKeys.length === 0 && !error"
      description="Nenhum bot encontrado."
    />
  </n-space>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getBotKeys } from "@/supabase";
import { useRouter } from "vue-router";



const botKeys = ref([]);
const search = ref("");
const loading = ref(false);
const error = ref(null);
const fallbackImage = "https://via.placeholder.com/300x200?text=Sem+Preview";

function onImgError(e) {
  e.target.src = fallbackImage;
}

function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleString();
}

async function fetchKeys() {
  loading.value = true;
  error.value = null;
  try {
    const data = await getBotKeys(search.value.trim());
    botKeys.value = data;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}



function abrirWhatsapp(numero, key = "") {
  const numLimpo = numero.replace(/\D/g, "");
  const texto = encodeURIComponent(key || ""); // encode é importante!
  const url = `https://wa.me/${numLimpo}?text=${texto}`;
  window.open(url, "_blank");
}


const router = useRouter()

const irParaFeedback = () => {
  router.push('/feedback')
}

onMounted(fetchKeys);
</script>

<style scoped>
.shadow-md {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>
