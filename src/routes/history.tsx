import {
  CalendarIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  TimeIcon,
  WarningIcon
} from '../components/ui/icons'
import {
  Alert,
  Box,
  Button,
  Field,
  Flex,
  HStack,
  Heading,
  IconButton,
  NativeSelect,
  SimpleGrid,
  Skeleton,
  Stack,
  Switch,
  Text
} from '@chakra-ui/react'
import { useState } from 'react'
import { AuthForm } from '../components/AuthForm'
import {
  EmptyState,
  StatCard,
  TargetSettings
} from '../components/DashboardParts'
import { MonthEventTable } from '../components/MonthEventTable'
import { useSeniorContext } from '../hooks/useSenior'
import {
  BALANCE_TOLERANCE_MINUTES,
  dayBalance,
  duration,
  exportMonth,
  signedDuration
} from '../utils/attendance'
import { twoDigits } from '../utils/format'

const months = Array.from({ length: 12 }, (_, month) =>
  new Date(2024, month, 1).toLocaleDateString('pt-BR', { month: 'long' })
)

export const History = () => {
  const {
    token,
    monthlyReport,
    year,
    setYear,
    today,
    dailyTarget,
    clockingEvents,
    loading,
    lastUpdated,
    fetchError,
    refresh
  } = useSeniorContext()
  const [month, setMonth] = useState(Number(today.date.slice(5, 7)) - 1)
  const [status, setStatus] = useState('all')
  const [showEmpty, setShowEmpty] = useState(false)
  const data = monthlyReport[month]
  const recorded = data.filter((day) => day.events.length)
  const pending = recorded.filter((day) => day.open && !day.isToday)
  const total = data.reduce((sum, day) => sum + day.totalMinutes, 0)
  const balance = data.reduce(
    (sum, day) => sum + dayBalance(day, dailyTarget),
    0
  )
  const years = Array.from(
    new Set([
      Number(today.date.slice(0, 4)),
      Number(today.date.slice(0, 4)) - 1,
      year,
      ...clockingEvents.map((event) => Number(event.dateEvent.slice(0, 4)))
    ])
  ).sort((a, b) => b - a)
  const visible = data.filter((day) => {
    if (!showEmpty && !day.events.length) return false
    if (status === 'complete') return day.events.length > 0 && !day.open
    if (status === 'pending') return day.open && !day.isToday
    if (status === 'active') return day.open && day.isToday
    return true
  })
  const navigate = (direction: number) => {
    const date = new Date(year, month + direction, 1)
    setYear(date.getFullYear())
    setMonth(date.getMonth())
  }

  if (!token) return <AuthForm />
  if (loading && !lastUpdated)
    return (
      <Stack gap={6} aria-label="Carregando histórico">
        <Skeleton h="80px" borderRadius="xl" />
        <Skeleton h="450px" borderRadius="xl" />
      </Stack>
    )

  return (
    <Stack gap={7}>
      <Flex justify="space-between" align="flex-end" gap={4} wrap="wrap">
        <Box>
          <Text className="eyebrow" mb={2}>
            CADA DIA CONTA
          </Text>
          <Heading
            fontSize={{ base: '27px', md: '32px' }}
            fontWeight={650}
            letterSpacing="-.04em"
          >
            Sua jornada, em detalhes.
          </Heading>
          <Text fontSize="sm" color="var(--muted)" mt={2}>
            Consulte marcações, acompanhe os totais e encontre pendências.
          </Text>
        </Box>
        <Button
          size="sm"
          variant="outline"
          disabled={!visible.some((day) => day.events.length)}
          onClick={() =>
            exportMonth(visible, dailyTarget, `${year}-${twoDigits(month + 1)}`)
          }
        >
          <DownloadIcon />
          Exportar CSV
        </Button>
      </Flex>
      {fetchError && (
        <Alert.Root status="warning" borderRadius="12px">
          <Alert.Indicator />
          <Text fontSize="sm" flex={1}>
            Não foi possível atualizar o histórico.
            {lastUpdated ? ' Exibindo a última consulta.' : ''}
          </Text>
          <Button size="sm" variant="ghost" onClick={refresh}>
            Tentar novamente
          </Button>
        </Alert.Root>
      )}
      <SimpleGrid columns={{ base: 2, lg: 4 }} gap={4}>
        <StatCard
          label="Horas no mês"
          value={duration(total)}
          detail="Inclui a jornada de hoje"
          icon={<TimeIcon />}
        />
        <StatCard
          label="Saldo estimado"
          value={signedDuration(balance)}
          valueColor={balance < 0 ? 'var(--warning)' : undefined}
          detail="Somente dias completos"
          icon={<CalendarIcon />}
          accent
        />
        <StatCard
          label="Dias completos"
          value={String(recorded.filter((day) => !day.open).length).padStart(
            2,
            '0'
          )}
          detail="Com pares de marcações"
          icon={<CheckCircleIcon />}
        />
        <StatCard
          label="Dias pendentes"
          value={String(pending.length).padStart(2, '0')}
          detail="Dias anteriores em aberto"
          icon={<WarningIcon />}
        />
      </SimpleGrid>
      <Box className="panel" overflow="hidden">
        <Flex
          p={{ base: 4, md: 5 }}
          gap={4}
          align="flex-end"
          justify="space-between"
          wrap="wrap"
        >
          <HStack gap={2} flexWrap="wrap">
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Mês anterior"
              onClick={() => navigate(-1)}
            >
              <ChevronLeftIcon />
            </IconButton>
            <Field.Root w={{ base: '110px', md: '160px' }}>
              <Field.Label
                htmlFor="history-month"
                fontSize="10px"
                color="var(--muted)"
                mb={1}
              >
                MÊS
              </Field.Label>
              <NativeSelect.Root size="sm">
                <NativeSelect.Field
                  id="history-month"
                  borderRadius="8px"
                  value={month}
                  onChange={(event) => setMonth(Number(event.target.value))}
                  textTransform="capitalize"
                >
                  {months.map((name, index) => (
                    <option key={name} value={index}>
                      {name}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>
            <Field.Root w="80px">
              <Field.Label
                htmlFor="history-year"
                fontSize="10px"
                color="var(--muted)"
                mb={1}
              >
                ANO
              </Field.Label>
              <NativeSelect.Root size="sm">
                <NativeSelect.Field
                  id="history-year"
                  borderRadius="8px"
                  value={year}
                  onChange={(event) => setYear(Number(event.target.value))}
                >
                  {years.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Próximo mês"
              onClick={() => navigate(1)}
            >
              <ChevronRightIcon />
            </IconButton>
          </HStack>
          <Field.Root w={{ base: 'full', sm: '190px' }}>
            <Field.Label
              htmlFor="history-status"
              fontSize="10px"
              color="var(--muted)"
              mb={1}
            >
              SITUAÇÃO
            </Field.Label>
            <NativeSelect.Root size="sm">
              <NativeSelect.Field
                id="history-status"
                borderRadius="8px"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="all">Todas as situações</option>
                <option value="complete">Concluído</option>
                <option value="pending">Pendente</option>
                <option value="active">Em andamento</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>
        </Flex>
        <Flex
          px={{ base: 4, md: 5 }}
          pb={4}
          justify="space-between"
          align="center"
          gap={3}
          wrap="wrap"
        >
          <Switch.Root
            size="sm"
            colorPalette="brand"
            checked={showEmpty}
            onCheckedChange={({ checked }) => setShowEmpty(checked)}
          >
            <Switch.HiddenInput id="show-empty" />
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Switch.Label fontSize="xs" color="var(--muted)">
              Mostrar dias sem registros
            </Switch.Label>
          </Switch.Root>
          <TargetSettings />
        </Flex>
        {visible.length ? (
          <MonthEventTable data={visible} />
        ) : (
          <EmptyState
            title="Nenhum dia para exibir"
            description="Não há marcações para este período e filtro. Experimente outro mês ou situação."
          />
        )}
      </Box>
      <Flex
        gap={3}
        align="flex-start"
        p={4}
        bg="var(--soft)"
        borderRadius="12px"
      >
        <CalendarIcon color="var(--muted)" mt={1} />
        <Text fontSize="11px" color="var(--muted)" lineHeight={1.8}>
          O saldo é uma estimativa com meta de {duration(dailyTarget)} por dia
          útil com registros completos. Diferenças diárias de até ±
          {BALANCE_TOLERANCE_MINUTES} min são zeradas; acima disso, a diferença
          conta por inteiro. Fins de semana contam como extra. Dias sem
          registros ou pendentes não geram débito. Feriados, justificativas e
          regras de banco de horas não estão disponíveis nesta consulta.
        </Text>
      </Flex>
    </Stack>
  )
}
