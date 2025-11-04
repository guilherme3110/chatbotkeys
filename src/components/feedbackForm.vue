<template>
  <div class="p-6 max-w-md mx-auto">
    <n-card title="Enviar Feedback">
      <n-form @submit.prevent="enviarFeedback">
        <n-form-item label="Nome">
          <n-input v-model:value="form.nome" placeholder="Digite seu nome" />
        </n-form-item>

        <n-form-item label="Email">
          <n-input v-model:value="form.email" placeholder="Digite seu email" />
        </n-form-item>

        <n-form-item label="Avaliação (1 a 5)">
          <n-input-number v-model:value="form.avaliacao" :min="1" :max="5" />
        </n-form-item>

        <n-form-item label="Mensagem">
          <n-input
            v-model:value="form.mensagem"
            type="textarea"
            placeholder="Escreva seu feedback"
          />
        </n-form-item>

        <n-button type="primary" attr-type="submit" :loading="loading">
          Enviar
        </n-button>
      </n-form>
    </n-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'

const form = ref({
  nome: '',
  email: '',
  avaliacao: '',
  mensagem: ''
})

const loading = ref(false)

const enviarFeedback = async () => {
  loading.value = true
  try {
    // 1️⃣ Salva no banco
    const { error } = await supabase.from('feedbacks').insert([
      {
        nome: form.value.nome,
        email: form.value.email,
        avaliacao: form.value.avaliacao,
        mensagem: form.value.mensagem,
        created_at: new Date()
      }
    ])

    if (error) throw error

    // 2️⃣ Envia notificação no Google Chat
    const chatWebhookUrl =
      'https://chat.googleapis.com/v1/spaces/AAQAj2Rk1NI/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=Kp89TFVk14mFZMtVyjmlkN-zi-WJk3K19jiuRJ-0s7M'

    const horario = new Date().toLocaleString('pt-BR')

    const mensagemChat = {
      text: `📝 *Novo feedback recebido!*\n\n**Nome:** ${form.value.nome}\n**Email:** ${form.value.email}\n**Avaliação:** ${form.value.avaliacao}\n**Mensagem:** ${form.value.mensagem}\n\n📅 *Horário:* ${horario}`
    }

    await fetch(chatWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mensagemChat)
    })

    // 3️⃣ Confirmação para o usuário
    alert('Feedback enviado com sucesso!')
    form.value = { nome: '', email: '', avaliacao: '', mensagem: '' }
  } catch (err) {
    console.error('Erro ao enviar feedback:', err)
    alert('Erro ao enviar feedback')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* estilos opcionais */
</style>
