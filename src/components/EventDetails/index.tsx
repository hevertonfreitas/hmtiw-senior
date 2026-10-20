import { CheckCircleIcon, InfoIcon } from '../ui/icons'
import {
  Badge,
  Box,
  CloseButton,
  Drawer,
  Flex,
  HStack,
  Heading,
  Portal,
  Separator,
  SimpleGrid,
  Text
} from '@chakra-ui/react'
import { ReactNode } from 'react'
import { useSeniorContext } from '../../hooks/useSenior'
import { AttendanceEvent } from '../../services/senior/dtos/clocking-event-by-active-user-query'
import { dateFromKey, originLabel } from '../../utils/attendance'
import { LocationMap } from '../LocationMap'

const Field = ({ label, value }: { label: string; value: ReactNode }) => (
  <Box>
    <Text as="dt" fontSize="11px" color="var(--muted)" mb={1}>
      {label}
    </Text>
    <Text as="dd" fontSize="sm" fontWeight={500} overflowWrap="anywhere">
      {value ?? 'Não informado'}
    </Text>
  </Box>
)

export const EventDetails = ({
  event,
  onClose
}: {
  event: AttendanceEvent | null
  onClose: () => void
}) => {
  const { timeZone } = useSeniorContext()
  const formatInstant = (value?: string) => {
    if (!value || !Number.isFinite(new Date(value).getTime()))
      return 'Não informado'
    return new Date(value).toLocaleString('pt-BR', { timeZone })
  }
  const location = event?.geolocation
  const hasLocation =
    location &&
    Number.isFinite(location.latitude) &&
    Number.isFinite(location.longitude) &&
    Math.abs(location.latitude) <= 90 &&
    Math.abs(location.longitude) <= 180
  return (
    <Drawer.Root
      open={!!event}
      onOpenChange={({ open }) => {
        if (!open) onClose()
      }}
      placement="end"
      size="md"
      lazyMount
      unmountOnExit
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content bg="var(--panel)">
            <Drawer.CloseTrigger asChild position="absolute" top={4} right={4}>
              <CloseButton aria-label="Fechar detalhes" size="sm" />
            </Drawer.CloseTrigger>
            <Drawer.Header borderBottomWidth="1px" pt={8}>
              <Drawer.Title fontSize="lg">Detalhes da marcação</Drawer.Title>
            </Drawer.Header>
            {event && (
              <Drawer.Body py={7}>
                <Text className="eyebrow">
                  {dateFromKey(event.dateEvent).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </Text>
                <Text
                  className="numeral"
                  fontSize="5xl"
                  fontWeight={650}
                  my={2}
                >
                  {event.timeEvent}
                </Text>
                <HStack gap={2} mb={6} flexWrap="wrap">
                  <Badge colorPalette="brand">{originLabel(event)}</Badge>
                  {event.online !== undefined && (
                    <Badge colorPalette={event.online ? 'brand' : 'orange'}>
                      {event.online ? 'Online' : 'Offline'}
                    </Badge>
                  )}
                </HStack>
                <Flex
                  bg={
                    event.signatureStatus === 'CHECKED'
                      ? 'var(--accent-soft)'
                      : 'var(--soft)'
                  }
                  p={4}
                  gap={3}
                  borderRadius="12px"
                  mb={7}
                  align="center"
                >
                  {event.signatureStatus === 'CHECKED' ? (
                    <CheckCircleIcon color="var(--accent)" />
                  ) : (
                    <InfoIcon color="var(--muted)" />
                  )}
                  <Box>
                    <Text fontSize="sm" fontWeight={600}>
                      {event.signatureStatus === 'CHECKED'
                        ? 'Assinatura conferida pela Senior'
                        : 'Assinatura: ' +
                          (event.signatureStatus || 'não informada')}
                    </Text>
                    <Text fontSize="xs" color="var(--muted)" mt={1}>
                      Situação retornada pela plataforma de ponto.
                    </Text>
                  </Box>
                </Flex>
                <Heading fontSize="sm" mb={4}>
                  Registro e sincronização
                </Heading>
                <SimpleGrid as="dl" columns={2} gap={5}>
                  <Field label="NSR" value={event.nsrNumber} />
                  <Field
                    label="Fuso do registro"
                    value={event.timeZone && `UTC${event.timeZone}`}
                  />
                  <Field
                    label="Recebido na plataforma"
                    value={formatInstant(event.createdAt)}
                  />
                  <Field
                    label="Sincronização ARP"
                    value={formatInstant(event.arpSyncDate)}
                  />
                  <Field label="Conexão" value={event.connectionType} />
                  <Field
                    label="Modo de marcação"
                    value={event.mode === 'SINGLE' ? 'Individual' : event.mode}
                  />
                </SimpleGrid>
                <Separator my={6} />
                <Heading fontSize="sm" mb={4}>
                  Dispositivo
                </Heading>
                <SimpleGrid as="dl" columns={2} gap={5}>
                  <Field
                    label="Nome / modelo"
                    value={event.device?.name || event.device?.model}
                  />
                  <Field label="Plataforma" value={event.platform} />
                  <Field
                    label="Versão do aplicativo"
                    value={event.appVersion}
                  />
                  <Field
                    label="Autorização"
                    value={
                      event.device?.status === 'AUTHORIZED'
                        ? 'Autorizado'
                        : event.device?.status
                    }
                  />
                  <Field
                    label="Fuso do dispositivo"
                    value={event.deviceTimeZone && `UTC${event.deviceTimeZone}`}
                  />
                </SimpleGrid>
                <Separator my={6} />
                <Heading fontSize="sm" mb={4}>
                  Localização
                </Heading>
                {hasLocation && location ? (
                  <LocationMap
                    location={location}
                    collectedAt={formatInstant(location.dateAndTime)}
                  />
                ) : (
                  <Text fontSize="sm" mb={4} color="var(--muted)">
                    Localização não informada.
                  </Text>
                )}
                <Box as="dl">
                  <Field
                    label="Cerca geográfica"
                    value={
                      event.fenceState === 'NO_FENCE'
                        ? 'Sem cerca configurada'
                        : event.fenceState
                    }
                  />
                </Box>
                <Separator my={6} />
                <Heading fontSize="sm" mb={4}>
                  Vínculo
                </Heading>
                <SimpleGrid as="dl" columns={1} gap={4}>
                  <Field label="Colaborador" value={event.employee?.name} />
                  <Field
                    label="Empresa"
                    value={event.employee?.company?.name}
                  />
                  <Field
                    label="CNPJ"
                    value={(
                      event.cnpj || event.employee?.company?.cnpj
                    )?.replace(
                      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
                      '$1.$2.$3/$4-$5'
                    )}
                  />
                  <Field
                    label="Centro de custo"
                    value={event.employee?.costCenter?.name}
                  />
                  <Field label="Identificador do registro" value={event.id} />
                </SimpleGrid>
              </Drawer.Body>
            )}
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
}
