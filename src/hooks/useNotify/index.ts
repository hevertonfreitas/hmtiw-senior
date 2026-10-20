import { useToast } from '@chakra-ui/react'
import { useCallback, useEffect, useRef } from 'react'

export const useNotify = () => {
  const toast = useToast()
  const latestToast = useRef(toast)
  useEffect(() => {
    latestToast.current = toast
  }, [toast])
  const tokenError = useCallback(
    () =>
      latestToast.current({
        title: 'Sessão expirada',
        description: 'Entre novamente para consultar suas marcações.',
        status: 'error',
        isClosable: true
      }),
    []
  )
  const authenticationError = useCallback(
    () =>
      latestToast.current({
        title: 'Não foi possível entrar',
        description: 'Confira seu usuário e senha Senior.',
        status: 'error',
        isClosable: true
      }),
    []
  )
  const requestWarning = useCallback(
    () =>
      latestToast.current({
        title: 'Não foi possível atualizar',
        description: 'Tente novamente em instantes.',
        status: 'warning',
        isClosable: true
      }),
    []
  )
  return { tokenError, authenticationError, requestWarning }
}
