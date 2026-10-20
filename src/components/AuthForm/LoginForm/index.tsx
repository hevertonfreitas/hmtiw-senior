import { Button, Field, Input, Stack } from '@chakra-ui/react'
import { useState } from 'react'
import { AuthCredentialRequest } from '../../../services/senior/dtos/auth-data'

type LoginFormProps = {
  onSubmit: (credentials: AuthCredentialRequest) => void
  loading: boolean
}

export const LoginForm = ({ onSubmit, loading }: LoginFormProps) => {
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    if (user.trim() && password) onSubmit({ user: user.trim(), password })
  }
  return (
    <form onSubmit={handleSubmit}>
      <Stack gap={4}>
        <Field.Root required>
          <Field.Label htmlFor="senior-user" fontSize="sm">
            Usuário Senior
          </Field.Label>
          <Input
            id="senior-user"
            name="username"
            autoComplete="username"
            placeholder="Seu usuário ou e-mail"
            value={user}
            onChange={(event) => setUser(event.target.value)}
          />
        </Field.Root>
        <Field.Root required>
          <Field.Label htmlFor="senior-password" fontSize="sm">
            Senha
          </Field.Label>
          <Input
            id="senior-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Sua senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field.Root>
        <Button
          type="submit"
          width="full"
          loading={loading}
          loadingText="Conectando"
          mt={2}
        >
          Acessar meu painel
        </Button>
      </Stack>
    </form>
  )
}
