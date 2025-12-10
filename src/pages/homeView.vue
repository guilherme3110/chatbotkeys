<template>
  <n-space vertical size="large" class="p-6">
    <n-layout>
      <n-layout-content content-style="padding: 24px;">
        <n-grid y-gap="24" x-gap="24" :cols="24">

          <!-- HEADER -->
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

          <!-- LISTA DE BOTS -->
          <n-grid-item span="24">
            <n-grid y-gap="24" x-gap="24" :cols="24">

              <n-grid-item
                v-for="bot in botKeys"
                :key="bot.id"
                span="6"
                v-if="!loading && botKeys.length > 0"
              >
                <n-card size="medium" embedded>
                  <template #cover>
                    <n-image
                      :src="bot.preview_url || fallbackImage"
                      :alt="bot.nome"
                      object-fit="cover"
                      style="width: 100%; height: 250px"
                      @error="onImgError"
                    />

                    <div style="padding: 0px 24px 24px">
                      <n-h3 class="text-center mb-4">{{ bot.nome }}</n-h3>

                      <p class="text-center mb-4">
                        {{ bot.descricao || "Sem descrição disponível." }}
                      </p>

                      <div class="flex flex-col gap-4">

                        <n-button
                          v-if="bot.whatsapp"
                          size="medium"
                          type="success"
                          @click="abrirWhatsapp(bot.whatsapp, bot.key)"
                        >
                          Abrir WhatsApp
                        </n-button>

                        <n-button
                          size="medium"
                          type="success"
                          @click="abrirFeedbackModal"
                        >
                          Enviar Feedback
                        </n-button>

                        <n-button
                          size="medium"
                          type="warning"
                          @click="abrirModalEdicao(bot)"
                        >
                          Editar Bot
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

 
    <n-empty
      v-if="!loading && botKeys.length === 0 && !error"
      description="Nenhum bot encontrado."
    />
  </n-space>


  <n-modal v-model:show="showCreateModal" preset="dialog" title="Criar Novo Bot">
    <n-form @submit.prevent="handleCreateBot" label-placement="top">

      <n-form-item label="Nome do Bot">
        <n-input v-model:value="newBot.nome" required />
      </n-form-item>

      <n-form-item label="Imagem (URL)">
        <n-input v-model:value="newBot.preview_url" />
      </n-form-item>

      <n-form-item label="WhatsApp">
        <n-input v-model:value="newBot.whatsapp" />
      </n-form-item>

      <n-form-item label="Chave do Bot">
        <n-input v-model:value="newBot.key" required />
      </n-form-item>

      <n-form-item label="Descrição">
        <n-input
          v-model:value="newBot.descricao"
          type="textarea"
          rows="3"
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

 
  <n-modal v-model:show="feedbackModal" preset="dialog" title="Enviar Feedback">
    <n-form @submit.prevent="sendFeedback" label-placement="top">

      <n-form-item label="Nome">
        <n-input v-model:value="form.nome" />
      </n-form-item>

      <n-form-item label="Email">
        <n-input v-model:value="form.email" />
      </n-form-item>

      <n-form-item label="Avaliação (1 a 5)">
        <n-input-number v-model:value="form.avaliacao" :min="1" :max="5" />
      </n-form-item>

      <n-form-item label="Mensagem">
        <n-input
          v-model:value="form.mensagem"
          type="textarea"
        />
      </n-form-item>

      <n-space justify="end">
        <n-button @click="feedbackModal = false">Cancelar</n-button>
        <n-button type="primary" @click="sendFeedback">Enviar</n-button>
      </n-space>
    </n-form>
  </n-modal>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getBotKeys, insertBotKey, supabase } from "../supabase";
import { useRouter } from "vue-router";


const botKeys = ref([]);
const search = ref("");
const loading = ref(false);
const error = ref(null);
const fallbackImage = "https://via.placeholder.com/300x200?text=Sem+Preview";


function onImgError(e) {
  e.target.src = fallbackImage;
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
  const texto = encodeURIComponent(key);
  window.open(`https://wa.me/${numLimpo}?text=${texto}`, "_blank");
}


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
    await insertBotKey(newBot.value);

    showCreateModal.value = false;

    newBot.value = {
      nome: "",
      preview_url: "",
      key: "",
      descricao: "",
      whatsapp: ""
    };

    fetchKeys();
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
    const { error } = await supabase
      .from("bots")
      .update(editBot.value)
      .eq("id", editBot.value.id);

    if (error) throw error;

    showEditModal.value = false;
    fetchKeys();
  } catch (err) {
    console.error("Erro ao atualizar bot:", err);
  }
}

const feedbackModal = ref(false);
const form = ref({
  nome: "",
  email: "",
  avaliacao: null,
  mensagem: ""
});

function abrirFeedbackModal() {
  feedbackModal.value = true;
}

async function sendFeedback() {
  if (!form.value.nome || !form.value.email || !form.value.avaliacao || !form.value.mensagem) {
    return;
  }

  const { error } = await supabase
    .from("feedbacks")
    .insert(form.value);

  if (error) {
    console.error("Erro ao enviar feedback:", error);
    return;
  }

  feedbackModal.value = false;

  form.value = {
    nome: "",
    email: "",
    avaliacao: null,
    mensagem: ""
  };
}

onMounted(fetchKeys);
</script>

<style scoped>
.shadow-md {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>
