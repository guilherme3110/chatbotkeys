<template>
  <div class="flex justify-center items-center h-screen bg-gray-100">
    <n-card title="Login" class="w-full max-w-sm shadow-lg rounded-2xl" size="huge">
      <n-form @submit.prevent="login">
        <n-form-item label="Email">
          <n-input v-model:value="email" type="email" placeholder="Digite seu email" clearable />
        </n-form-item>

        <n-form-item label="Senha">
          <n-input
            v-model:value="password"
            type="password"
            placeholder="Digite sua senha"
            show-password-on="click"
          />
        </n-form-item>

        <div class="flex justify-between items-center mt-2">
          <n-button text @click="recuperarSenha">Esqueci minha senha</n-button>
          <n-button type="primary" attr-type="submit" round :loading="loading">
            Entrar
          </n-button>
        </div>

        <n-divider>ou</n-divider>

        <div class="text-center">
          <n-button type="info" secondary round @click="criarConta">
            Criar nova conta
          </n-button>
        </div>
      </n-form>
    </n-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import { supabase } from '../supabase'

const email = ref('')
const password = ref('')
const loading = ref(false)
const message = useMessage()

const login = async () => {
  loading.value = true
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  loading.value = false

  if (error) {
    message.error('Email ou senha incorretos.')
    console.error(error)
  } else {
    message.success('Login realizado com sucesso!')
    console.log('Usuário logado:', data.user)
    /
    router.push('/dashboard')
  }
}

const recuperarSenha = async () => {
  if (!email.value) {
    message.warning('Digite seu email para recuperar a senha.')
    return
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email.value)
  if (error) {
    message.error('Erro ao enviar link de recuperação.')
  } else {
    message.success('Verifique seu email para redefinir a senha.')
  }
}

const criarConta = async () => {
  loading.value = true
  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value
  })
  loading.value = false

  if (error) {
    message.error('Erro ao criar conta.')
    console.error(error)
  } else {
    message.success('Conta criada! Verifique seu email para confirmar.')
  }
}
</script>
