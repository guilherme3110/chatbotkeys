<template>
  <n-space vertical size="large" class="p-6">
    <n-layout>
      <n-layout-content content-style="padding: 24px;">
        <div>
          <div class="container">
            <n-h2>Chat Bot Keys</n-h2>
            <div class="flex justify-end mb-4">
              <n-button
                style="width:100%"
                size="large"
                type="warning"
                @click="criarBot()"
              >
                Adicionar novo Bot
              </n-button>
            </div>
          </div>

          <n-input
            v-model:value="search"
            placeholder="Pesquisar bot por nome..."
            clearable
            class="w-full md:w-1/2"
            @input="fetchKeys"
          />
        </div>

        <div class="container-02">
          <n-grid y-gap="24" x-gap="24" :cols="24">
            <n-grid-item span="24">
              <n-grid
                y-gap="24"
                x-gap="24"
                cols="2 300:1 400:2 600:3 800:4 s:3 m:4 l:5 xl:6 2xl:7"
                responsive="screen"
              >
                <n-grid-item
                  v-for="bot in paginatedBots"
                  :key="bot.id"
                  v-if="!loading && botKeys.length > 0"
                >
                  <n-card size="medium" embedded>
                    <template #cover>
                      <n-image
                        src="https://dummyimage.com/600x250/transparent/fff"
                        :alt="bot.nome"
                        object-fit="cover"
                        style="width:1920px; height: 250px"
                        @error="onImgError"
                      />

                      <div style="padding: 0px 24px 24px">
                        <n-h3 class="text-center mb-4">{{ bot.nome }}</n-h3>

                        <p class="text-center mb-4">
                          Lorem Ipsum is simply dummy text of the printing and
                          typesetting industry.
                        </p>

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
                          <!-- FEEDBACK CORRIGIDO -->
                          <n-button
                            style="width:100%"
                            size="medium"
                            type="success"
                            @click="showFeedbackModal = true"
                          >
                            Enviar feedback
                          </n-button>

                          <n-button
                            style="width:100%"
                            size="medium"
                            type="warning"
                            @click="abrirModalEdicao(bot)"
                          >
                            Editar Bot
                          </n-button>
                        </div>

                        <n-space justify="center">
                          <n-tag
                            v-for="tag in bot.tags"
                            :key="tag"
                            type="success"
                          >
                            {{ tag }}
                          </n-tag>
                        </n-space>
                      </div>
                    </template>
                  </n-card>
                </n-grid-item>
              </n-grid>
            </n-grid-item>
          </n-grid>
        </div>

        <div class="w-full justify-center mt-10">
          <n-pagination
            v-model:page="page"
            :page-size="pageSize"
            :item-count="botKeys.length"
            size="large"
            show-quick-jumper
          />
        </div>
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

  <!-- MODAL CRIAR -->
  <n-modal v-model:show="showCreateModal" preset="dialog" title="Criar Novo Bot">
    <n-form @submit.prevent="handleCreateBot" label-placement="top">
      <n-form-item label="Nome do Bot">
        <n-input v-model:value="newBot.nome" required />
      </n-form-item>

      <n-form-item label="Imagem (URL)">
        <n-input v-model:value="newBot.preview_url" />
      </n-form-item>

      <n-form-item label="Chave do Bot">
        <n-input v-model:value="newBot.key" required />
      </n-form-item>

      <n-form-item label="Tag">
        <n-input v-model:value="newBot.tag" required />
      </n-form-item>

      <n-form-item label="Descrição">
        <n-input v-model:value="newBot.descricao" type="textarea" />
      </n-form-item>

      <n-space justify="end">
        <n-button @click="showCreateModal = false">Cancelar</n-button>
        <n-button type="primary" @click="handleCreateBot">Salvar</n-button>
      </n-space>
    </n-form>
  </n-modal>

  <!-- MODAL EDITAR -->
  <n-modal v-model:show="showEditModal" preset="dialog" title="Editar Bot">
    <n-form @submit.prevent="handleEditBot" label-placement="top">
      <n-form-item label="Nome do Bot">
        <n-input v-model:value="editBot.nome" required />
      </n-form-item>

      <n-form-item label="Imagem (URL)">
        <n-input v-model:value="editBot.preview_url" />
      </n-form-item>

      <n-form-item label="Chave do Bot">
        <n-input v-model:value="editBot.key" required />
      </n-form-item>

      <n-form-item label="Descrição">
        <n-input v-model:value="editBot.descricao" type="textarea" />
      </n-form-item>

      <n-space justify="end">
        <n-button @click="showEditModal = false">Cancelar</n-button>
        <n-button type="primary" @click="handleEditBot">
          Salvar Alterações
        </n-button>
      </n-space>
    </n-form>
  </n-modal>

  <!-- MODAL FEEDBACK -->
  <n-modal v-model:show="showFeedbackModal" preset="dialog" title="Enviar Feedback">
    <n-form @submit.prevent="handleSubmitFeedback" label-placement="top">
      <n-form-item label="Nome">
        <n-input v-model:value="feedback.nome" required />
      </n-form-item>

      <n-form-item label="Email">
        <n-input v-model:value="feedback.email" type="email" required />
      </n-form-item>

      <n-form-item label="Avaliação">
        <n-rate v-model:value="feedback.avaliacao" />
      </n-form-item>

      <n-form-item label="Mensagem">
        <n-input v-model:value="feedback.mensagem" type="textarea" />
      </n-form-item>

      <n-space justify="end">
        <n-button @click="showFeedbackModal = false">Cancelar</n-button>
        <n-button type="primary" @click="handleSubmitFeedback">
          Enviar
        </n-button>
      </n-space>
    </n-form>
  </n-modal>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import { getBotKeys, insertBotKey, updateBotKey, supabase } from "../supabase"

const page = ref(1)
const pageSize = 8
const botKeys = ref([])
const search = ref("")
const loading = ref(false)
const error = ref(null)

const fallbackImage = "https://via.placeholder.com/300x200"

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showFeedbackModal = ref(false)

const feedback = ref({
  nome: "",
  email: "",
  avaliacao: 0,
  mensagem: ""
})

async function handleSubmitFeedback() {
  if (feedback.value.avaliacao < 1) {
    alert("Selecione uma avaliação")
    return
  }

  await supabase.from("feedbacks").insert(feedback.value)

  showFeedbackModal.value = false
  feedback.value = { nome: "", email: "", avaliacao: 0, mensagem: "" }
}

function onImgError(e) {
  e.target.src = fallbackImage
}

async function fetchKeys() {
  loading.value = true
  botKeys.value = await getBotKeys(search.value)
  loading.value = false
}

function abrirWhatsapp(numero, key) {
  window.open(`https://wa.me/${numero}?text=${key}`, "_blank")
}

const newBot = ref({})
const editBot = ref({})

function criarBot() {
  showCreateModal.value = true
}

async function handleCreateBot() {
  await insertBotKey(newBot.value)
  showCreateModal.value = false
  fetchKeys()
}

function abrirModalEdicao(bot) {
  editBot.value = { ...bot }
  showEditModal.value = true
}

async function handleEditBot() {
  await updateBotKey(editBot.value.id, editBot.value)
  showEditModal.value = false
  fetchKeys()
}

const paginatedBots = computed(() => {
  const start = (page.value - 1) * pageSize
  return botKeys.value.slice(start, start + pageSize)
})

onMounted(fetchKeys)
</script>

<style scoped>
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
