import { Button, Field, Input } from '@chakra-ui/react'
import { useState } from 'react'

type TokenFormProps = { onSubmit: (token: string) => void }

export const TokenForm = ({ onSubmit }: TokenFormProps) => {
  const [token, setToken] = useState('')
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    if (token.trim()) onSubmit(token.trim())
  }
  return (
    <form onSubmit={handleSubmit}>
      <Field.Root required>
        <Field.Label htmlFor="senior-token" fontSize="sm">
          Token de autenticação
        </Field.Label>
        <Input
          id="senior-token"
          type="password"
          autoComplete="off"
          placeholder="Cole seu token Senior"
          value={token}
          onChange={(event) => setToken(event.target.value)}
        />
        <Field.HelperText>
          Use o token obtido ao entrar na plataforma Senior.
        </Field.HelperText>
      </Field.Root>
      <Button type="submit" mt={5} width="full">
        Acessar meu painel
      </Button>
    </form>
  )
}
