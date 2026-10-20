import { useCallback } from 'react'
import { toaster } from '../../components/ui/toaster'

export const useNotify = () => {
  const tokenError = useCallback(
    () =>
      toaster.create({
        title: 'Sessão expirada',
        description: 'Entre novamente para consultar suas marcações.',
        type: 'error',
        closable: true
      }),
    []
  )
  const authenticationError = useCallback(
    () =>
      toaster.create({
        title: 'Não foi possível entrar',
        description: 'Confira seu usuário e senha Senior.',
        type: 'error',
        closable: true
      }),
    []
  )
  const requestWarning = useCallback(
    () =>
      toaster.create({
        title: 'Não foi possível atualizar',
        description: 'Tente novamente em instantes.',
        type: 'warning',
        closable: true
      }),
    []
  )
  return { tokenError, authenticationError, requestWarning }
}
