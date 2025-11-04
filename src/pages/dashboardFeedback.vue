<template>
  <div class="p-6 max-w-4xl mx-auto">
    <n-card title="Feedbacks Recebidos">
      <n-data-table
        :columns="columns"
        :data="feedbacks"
        :loading="loading"
        striped
        bordered
      />
    </n-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { NDataTable, NCard } from 'naive-ui'
import { supabase } from '../supabase'



const feedbacks = ref([])
const loading = ref(true)

const columns = [
  { title: 'Nome', key: 'nome' },
  { title: 'Email', key: 'email' },
  { title: 'Avaliação', key: 'avaliacao' },
  { title: 'Mensagem', key: 'mensagem' },
  { 
    title: 'Data', 
    key: 'created_at',
    render(row) {
      return new Date(row.created_at).toLocaleString('pt-BR')
    }
  }
]


onMounted(async () => {
  const { data, error } = await supabase
    .from('feedbacks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) console.error('Erro ao buscar feedbacks:', error)
  else feedbacks.value = data

  loading.value = false
})
</script>
