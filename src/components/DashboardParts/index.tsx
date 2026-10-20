import {
  ArrowBackIcon,
  ArrowForwardIcon,
  ChevronRightIcon,
  SettingsIcon,
  TimeIcon
} from '../ui/icons'
import {
  Badge,
  Box,
  BoxProps,
  Button,
  CloseButton,
  Dialog,
  Field,
  Flex,
  HStack,
  Heading,
  Input,
  Portal,
  Text,
  useDisclosure
} from '@chakra-ui/react'
import { ReactNode, useState } from 'react'
import { useSeniorContext } from '../../hooks/useSenior'
import { AttendanceEvent } from '../../services/senior/dtos/clocking-event-by-active-user-query'
import { duration, originLabel } from '../../utils/attendance'

export const Panel = ({ children, ...props }: BoxProps) => (
  <Box className="panel" p={{ base: 5, md: 6 }} {...props}>
    {children}
  </Box>
)

export const SectionHeading = ({
  title,
  detail,
  action
}: {
  title: string
  detail?: string
  action?: ReactNode
}) => (
  <Flex justify="space-between" align="center" gap={3} mb={5}>
    <Box>
      <Heading fontSize="md" fontWeight={650}>
        {title}
      </Heading>
      {detail && (
        <Text fontSize="xs" color="var(--muted)" mt={1}>
          {detail}
        </Text>
      )}
    </Box>
    {action}
  </Flex>
)

export const StatCard = ({
  label,
  value,
  detail,
  icon,
  accent,
  valueColor
}: {
  label: string
  value: string
  detail: string
  icon: ReactNode
  accent?: boolean
  valueColor?: string
}) => (
  <Panel>
    <Flex justify="space-between" align="center" mb={4}>
      <Text fontSize="xs" color="var(--muted)" fontWeight={500}>
        {label}
      </Text>
      <Box color="var(--accent)">{icon}</Box>
    </Flex>
    <Text
      className="numeral"
      fontSize="28px"
      lineHeight={1.2}
      fontWeight={650}
      color={valueColor || (accent ? 'var(--accent)' : undefined)}
    >
      {value}
    </Text>
    <Text fontSize="xs" mt={2} color="var(--muted)">
      {detail}
    </Text>
  </Panel>
)

export const EmptyState = ({
  title,
  description
}: {
  title: string
  description: string
}) => (
  <Box textAlign="center" py={10} px={4}>
    <Flex
      mx="auto"
      mb={4}
      bg="var(--soft)"
      color="var(--muted)"
      w={12}
      h={12}
      borderRadius="full"
      align="center"
      justify="center"
    >
      <TimeIcon boxSize={5} />
    </Flex>
    <Text fontSize="sm" fontWeight={600}>
      {title}
    </Text>
    <Text fontSize="xs" color="var(--muted)" mt={2} maxW="300px" mx="auto">
      {description}
    </Text>
  </Box>
)

export const EventTimeline = ({
  events,
  onSelect
}: {
  events: AttendanceEvent[]
  onSelect: (event: AttendanceEvent) => void
}) => (
  <Box as="ol" className="timeline">
    {events.map((event, index) => (
      <Box as="li" className="timeline-item" key={event.id}>
        <Box
          className={`timeline-marker ${index % 2 ? 'exit' : ''}`}
          aria-hidden
        >
          {index % 2 ? (
            <ArrowBackIcon boxSize={3} />
          ) : (
            <ArrowForwardIcon boxSize={3} />
          )}
        </Box>
        <Box
          as="button"
          className="event-button"
          onClick={() => onSelect(event)}
          aria-label={`Detalhes da ${index % 2 ? 'saída' : 'entrada'} às ${
            event.timeEvent
          }`}
        >
          <Flex align="center" justify="space-between" gap={3}>
            <Box>
              <HStack gap={2}>
                <Text fontSize="sm" fontWeight={600}>
                  {index % 2 ? 'Saída' : 'Entrada'}
                </Text>
                <Text fontSize="xs" color="var(--muted)">
                  #{index + 1}
                </Text>
              </HStack>
              <Text fontSize="xs" color="var(--muted)" mt={1}>
                {originLabel(event)}
                {event.device?.name ? ` · ${event.device.name}` : ''}
              </Text>
            </Box>
            <HStack gap={3}>
              <Text className="numeral" fontSize="lg" fontWeight={600}>
                {event.timeEvent.slice(0, 5)}
              </Text>
              <ChevronRightIcon color="var(--muted)" />
            </HStack>
          </Flex>
        </Box>
      </Box>
    ))}
  </Box>
)

export const TargetSettings = () => {
  const { dailyTarget, setDailyTarget, customTarget, targetFromSchedule } =
    useSeniorContext()
  const { open, onOpen, onClose } = useDisclosure()
  const [value, setValue] = useState(duration(dailyTarget))
  const parts = value.split(':').map(Number)
  const minutes = parts[0] * 60 + parts[1]
  const valid =
    /^\d{2}:\d{2}$/.test(value) && parts[0] < 24 && parts[1] < 60 && minutes > 0

  return (
    <>
      <Button
        size="xs"
        variant="ghost"
        color="var(--muted)"
        onClick={() => {
          setValue(duration(dailyTarget))
          onOpen()
        }}
      >
        <SettingsIcon />
        Ajustar meta
      </Button>
      <Dialog.Root
        open={open}
        onOpenChange={({ open }) => {
          if (!open) onClose()
        }}
        placement="center"
        lazyMount
        unmountOnExit
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content mx={4} bg="var(--panel)" borderRadius="20px">
              <Dialog.Header>
                <Dialog.Title>Meta diária de trabalho</Dialog.Title>
              </Dialog.Header>
              <Dialog.CloseTrigger
                asChild
                position="absolute"
                top={3}
                right={3}
              >
                <CloseButton aria-label="Fechar ajuste de meta" size="sm" />
              </Dialog.CloseTrigger>
              <Dialog.Body>
                <Field.Root>
                  <Field.Label htmlFor="daily-target">
                    Horas de trabalho, sem os intervalos
                  </Field.Label>
                  <Input
                    id="daily-target"
                    type="time"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                  />
                  <Field.HelperText>
                    {targetFromSchedule
                      ? `A jornada da Senior sugere ${duration(
                          targetFromSchedule
                        )} por dia.`
                      : 'Sem jornada informada, a meta inicial é de 08:00 por dia.'}{' '}
                    A meta é usada nas estimativas e fica salva neste navegador.
                  </Field.HelperText>
                </Field.Root>
                {customTarget !== null && (
                  <Badge mt={4} colorPalette="brand">
                    Meta personalizada
                  </Badge>
                )}
              </Dialog.Body>
              <Dialog.Footer gap={2}>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setDailyTarget(null)
                    onClose()
                  }}
                >
                  Usar padrão
                </Button>
                <Button
                  disabled={!valid}
                  onClick={() => {
                    setDailyTarget(minutes)
                    onClose()
                  }}
                >
                  Salvar meta
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
}
