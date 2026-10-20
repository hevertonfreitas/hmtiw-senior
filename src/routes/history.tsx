import {
  CalendarIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  TimeIcon,
  WarningIcon
} from '@chakra-ui/icons'
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  IconButton,
  Select,
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
      <Stack spacing={6} aria-label="Carregando histórico">
        <Skeleton h="80px" borderRadius="xl" />
        <Skeleton h="450px" borderRadius="xl" />
      </Stack>
    )

  return (
    <Stack spacing={7}>
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
          leftIcon={<DownloadIcon />}
          isDisabled={!visible.some((day) => day.events.length)}
          onClick={() =>
            exportMonth(visible, dailyTarget, `${year}-${twoDigits(month + 1)}`)
          }
        >
          Exportar CSV
        </Button>
      </Flex>
      {fetchError && (
        <Alert status="warning" borderRadius="12px">
          <AlertIcon />
          <Text fontSize="sm" flex={1}>
            Não foi possível atualizar o histórico.
            {lastUpdated ? ' Exibindo a última consulta.' : ''}
          </Text>
          <Button size="sm" variant="ghost" onClick={refresh}>
            Tentar novamente
          </Button>
        </Alert>
      )}
      <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={4}>
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
          <HStack spacing={2} flexWrap="wrap">
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Mês anterior"
              icon={<ChevronLeftIcon />}
              onClick={() => navigate(-1)}
            />
            <FormControl w={{ base: '110px', md: '160px' }}>
              <FormLabel
                htmlFor="history-month"
                fontSize="10px"
                color="var(--muted)"
                mb={1}
              >
                MÊS
              </FormLabel>
              <Select
                id="history-month"
                size="sm"
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
              </Select>
            </FormControl>
            <FormControl w="80px">
              <FormLabel
                htmlFor="history-year"
                fontSize="10px"
                color="var(--muted)"
                mb={1}
              >
                ANO
              </FormLabel>
              <Select
                id="history-year"
                size="sm"
                borderRadius="8px"
                value={year}
                onChange={(event) => setYear(Number(event.target.value))}
              >
                {years.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </FormControl>
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Próximo mês"
              icon={<ChevronRightIcon />}
              onClick={() => navigate(1)}
            />
          </HStack>
          <FormControl w={{ base: 'full', sm: '190px' }}>
            <FormLabel
              htmlFor="history-status"
              fontSize="10px"
              color="var(--muted)"
              mb={1}
            >
              SITUAÇÃO
            </FormLabel>
            <Select
              id="history-status"
              size="sm"
              borderRadius="8px"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="all">Todas as situações</option>
              <option value="complete">Concluído</option>
              <option value="pending">Pendente</option>
              <option value="active">Em andamento</option>
            </Select>
          </FormControl>
        </Flex>
        <Flex
          px={{ base: 4, md: 5 }}
          pb={4}
          justify="space-between"
          align="center"
          gap={3}
          wrap="wrap"
        >
          <FormControl display="flex" alignItems="center" w="auto">
            <Switch
              id="show-empty"
              size="sm"
              colorScheme="brand"
              isChecked={showEmpty}
              onChange={(event) => setShowEmpty(event.target.checked)}
            />
            <FormLabel
              htmlFor="show-empty"
              mb={0}
              ml={2}
              fontSize="xs"
              color="var(--muted)"
            >
              Mostrar dias sem registros
            </FormLabel>
          </FormControl>
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
          útil com registros completos. Fins de semana contam como extra. Dias
          sem registros ou pendentes não geram débito. Feriados, justificativas,
          tolerâncias e regras de banco de horas não estão disponíveis nesta
          consulta.
        </Text>
      </Flex>
    </Stack>
  )
}
