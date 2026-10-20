import {
  Toaster as ChakraToaster,
  Portal,
  Stack,
  Toast,
  createToaster
} from '@chakra-ui/react'

export const toaster = createToaster({
  placement: 'bottom-end',
  pauseOnPageIdle: true
})

export const Toaster = () => (
  <Portal>
    <ChakraToaster toaster={toaster} insetInline={{ base: 4, md: 6 }}>
      {(toast) => (
        <Toast.Root maxW="400px">
          <Toast.Indicator />
          <Stack gap={1} flex={1}>
            {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
            {toast.description && (
              <Toast.Description>{toast.description}</Toast.Description>
            )}
          </Stack>
          {toast.closable && (
            <Toast.CloseTrigger aria-label="Fechar notificação" />
          )}
        </Toast.Root>
      )}
    </ChakraToaster>
  </Portal>
)
