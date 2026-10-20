import { Button, FormControl, FormLabel, Input, Stack } from '@chakra-ui/react'
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
      <Stack spacing={4}>
        <FormControl isRequired>
          <FormLabel htmlFor="senior-user" fontSize="sm">
            Usuário Senior
          </FormLabel>
          <Input
            id="senior-user"
            name="username"
            autoComplete="username"
            placeholder="Seu usuário ou e-mail"
            value={user}
            onChange={(event) => setUser(event.target.value)}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel htmlFor="senior-password" fontSize="sm">
            Senha
          </FormLabel>
          <Input
            id="senior-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Sua senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </FormControl>
        <Button
          type="submit"
          width="full"
          isLoading={loading}
          loadingText="Conectando"
          mt={2}
        >
          Acessar meu painel
        </Button>
      </Stack>
    </form>
  )
}
