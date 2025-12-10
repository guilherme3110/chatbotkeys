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
          <n-button type="info" secondary round @click="criarBot">
            Adicionar novo bot
          </n-button>
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

                        <div class="flex justify-center gap-20 mb-4">
                        <n-button
                          style="width:100%"
                          size="medium"
                          type="warning"
                          @click="abrirModalEdicao(bot)"
                          >
                        Editar Bot
                        </n-button>
                      </div>  
                        
                       
                       
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

  <n-modal v-model:show="showCreateModal" preset="dialog" title="Criar Novo Bot">
  <n-form @submit.prevent="handleCreateBot" label-placement="top">
    
    <n-form-item label="Nome do Bot">
      <n-input v-model:value="newBot.nome" required placeholder="Digite o nome..." />
    </n-form-item>

    <n-form-item label="Imagem (URL)">
      <n-input v-model:value="newBot.preview_url" placeholder="https://imagem.com/bot.png" />
    </n-form-item>
    
    <n-form-item label="WhatsApp">
      <n-input v-model:value="newBot.whatsapp" placeholder="5511999999999" />
    </n-form-item>

    <n-form-item label="Chave do Bot">
      <n-input v-model:value="newBot.key" required placeholder="Ex: abc123key" />
    </n-form-item>

    <n-form-item label="Descrição">
      <n-input
        v-model:value="newBot.descricao"
        type="textarea"
        rows="3"
        placeholder="Descrição do bot..."
      />
    </n-form-item>

    <n-space justify="end">
      <n-button @click="showCreateModal = false">Cancelar</n-button>
      <n-button type="primary" @click="handleCreateBot">Salvar</n-button>
    </n-space>

  </n-form>
</n-modal>

<n-modal v-model:show="showEditModal" preset="dialog" title="Editar Bot">
  <n-form @submit.prevent="handleEditBot" label-placement="top">

    <n-form-item label="Nome do Bot">
      <n-input v-model:value="editBot.nome" required />
    </n-form-item>

    <n-form-item label="Imagem (URL)">
      <n-input v-model:value="editBot.preview_url" />
    </n-form-item>

    <n-form-item label="WhatsApp">
      <n-input v-model:value="editBot.whatsapp" />
    </n-form-item>

    <n-form-item label="Chave do Bot">
      <n-input v-model:value="editBot.key" required />
    </n-form-item>

    <n-form-item label="Descrição">
      <n-input
        v-model:value="editBot.descricao"
        type="textarea"
        rows="3"
      />
    </n-form-item>

    <n-space justify="end">
      <n-button @click="showEditModal = false">Cancelar</n-button>
      <n-button type="primary" @click="handleEditBot">Salvar Alterações</n-button>
    </n-space>

  </n-form>
</n-modal>



</template>

<script setup>
import { ref, onMounted } from "vue";
import { getBotKeys } from "../supabase";
import { useRouter } from "vue-router";
import { NButton } from "naive-ui";



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
  const texto = encodeURIComponent(key || ""); 
  const url = `https://wa.me/${numLimpo}?text=${texto}`;
  window.open(url, "_blank");
}

import { insertBotKey } from "../supabase";

const showCreateModal = ref(false);

const newBot = ref({
  nome: "",
  preview_url: "",
  key: "",
  descricao: "",
  whatsapp: ""
});

function criarBot() {
  showCreateModal.value = true;
}

async function handleCreateBot() {
  try {
    await insertBotKey({
      nome: newBot.value.nome,
      preview_url: newBot.value.preview_url,
      key: newBot.value.key,
      descricao: newBot.value.descricao,
      whatsapp: newBot.value.whatsapp
    });

    showCreateModal.value = false;

    newBot.value = {
      nome: "",
      preview_url: "",
      key: "",
      descricao: "",
      whatsapp: ""
    };

    await fetchKeys();
  } catch (error) {
    console.error("Erro ao criar bot:", error.message);
  }
}

const showEditModal = ref(false);

const editBot = ref({
  id: null,
  nome: "",
  preview_url: "",
  whatsapp: "",
  key: "",
  descricao: ""
});

function abrirModalEdicao(bot) {
  editBot.value = { ...bot }; 
  showEditModal.value = true;
}

async function handleEditBot() {
  try {
    const response = await fetch(`/api/bots/${editBot.value.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editBot.value),
    });

    if (!response.ok) throw new Error("Erro ao editar bot");

    showEditModal.value = false;
    fetchKeys(); 

  } catch (err) {
    console.error("Erro ao atualizar bot:", err);
  }
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
