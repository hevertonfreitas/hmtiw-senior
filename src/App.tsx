import {
  ArrowForwardIcon,
  CalendarIcon,
  InfoIcon,
  WarningIcon
} from '@chakra-ui/icons'
import {
  Alert,
  AlertIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Heading,
  SimpleGrid,
  Skeleton,
  Stack,
  Text
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthForm } from './components/AuthForm'
import {
  EmptyState,
  EventTimeline,
  Panel,
  SectionHeading
} from './components/DashboardParts'
import { EventDetails } from './components/EventDetails'
import { WorkClock } from './components/WorkClock'
import { useSeniorContext } from './hooks/useSenior'
import { AttendanceEvent } from './services/senior/dtos/clocking-event-by-active-user-query'
import {
  buildDay,
  dateFromKey,
  dateKey,
  dayBalance,
  duration,
  signedDuration
} from './utils/attendance'

function App() {
  const {
    token,
    loading,
    lastUpdated,
    employee,
    today,
    currentDate,
    timeZone,
    clockingEvents,
    currentMonth,
    dailyTarget,
    fetchError,
    refresh
  } = useSeniorContext()
  const [selected, setSelected] = useState<AttendanceEvent | null>(null)
  useEffect(() => setSelected(null), [token])
  if (!token) return <AuthForm />
  if (loading && !lastUpdated)
    return (
      <Stack spacing={6} aria-label="Carregando marcações">
        <Skeleton h="70px" borderRadius="xl" />
        <Skeleton h="350px" borderRadius="xl" />
        <Skeleton h="200px" borderRadius="xl" />
      </Stack>
    )

  const name = employee?.name?.split(' ')[0].toLocaleLowerCase('pt-BR')
  const greeting = name
    ? name[0].toLocaleUpperCase('pt-BR') + name.slice(1)
    : ''
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = dateFromKey(today.date)
    date.setDate(date.getDate() - 6 + index)
    const key = dateKey(date, Intl.DateTimeFormat().resolvedOptions().timeZone)
    return buildDay(
      key,
      clockingEvents.filter((event) => event.dateEvent === key),
      currentDate,
      timeZone
    )
  })
  const max = Math.max(
    dailyTarget * 1.25,
    ...week.map((day) => day.totalMinutes)
  )
  const closedDays = currentMonth.filter(
    (day) => day.events.length && !day.open
  )
  const monthTotal = currentMonth.reduce(
    (sum, day) => sum + day.totalMinutes,
    0
  )
  const balance = currentMonth.reduce(
    (sum, day) => sum + dayBalance(day, dailyTarget),
    0
  )
  const pending = currentMonth.filter((day) => day.open && !day.isToday)

  return (
    <Stack spacing={7}>
      <Flex justify="space-between" align="flex-end" gap={4} wrap="wrap">
        <Box>
          <Text className="eyebrow" mb={2}>
            SEU TEMPO, BEM ACOMPANHADO
          </Text>
          <Heading
            fontSize={{ base: '27px', md: '32px' }}
            fontWeight={650}
            letterSpacing="-.04em"
          >
            {greeting ? `Olá, ${greeting}.` : 'Seu dia, em perspectiva.'}
          </Heading>
          <Text color="var(--muted)" fontSize="sm" mt={2}>
            Um olhar claro sobre a sua jornada de trabalho.
          </Text>
        </Box>
        <HStack color="var(--muted)" fontSize="xs" spacing={2} pb={1}>
          <CalendarIcon />
          <Text textTransform="capitalize">
            {dateFromKey(today.date).toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}
          </Text>
        </HStack>
      </Flex>
      {fetchError && (
        <Alert status="warning" borderRadius="12px">
          <AlertIcon />
          <Box flex={1}>
            <Text fontSize="sm">
              Não foi possível carregar os dados mais recentes.
              {lastUpdated ? ' Exibindo a última consulta.' : ''}
            </Text>
          </Box>
          <Button size="sm" variant="ghost" onClick={refresh}>
            Tentar novamente
          </Button>
        </Alert>
      )}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} alignItems="start">
        <Box>
          <WorkClock />
        </Box>
        <Panel>
          <SectionHeading
            title="Marcações de hoje"
            detail="Acompanhe cada momento da sua jornada"
            action={
              <Badge
                bg="var(--soft)"
                color="var(--muted)"
                borderRadius="full"
                px={2.5}
                py={1}
              >
                {today.events.length}{' '}
                {today.events.length === 1 ? 'registro' : 'registros'}
              </Badge>
            }
          />
          {today.events.length ? (
            <>
              <EventTimeline events={today.events} onSelect={setSelected} />
              <Flex
                mt={4}
                pt={4}
                borderTop="1px solid var(--line)"
                gap={2}
                color="var(--muted)"
                align="flex-start"
              >
                <InfoIcon mt={0.5} boxSize={3} />
                <Text fontSize="11px">
                  Entradas e saídas estimadas pela ordem das marcações. Toque em
                  um registro para ver os detalhes.
                </Text>
              </Flex>
            </>
          ) : (
            <EmptyState
              title="Seu dia começa por aqui"
              description="As marcações aparecerão após o registro na Senior. Use Atualizar para consultar novamente."
            />
          )}
        </Panel>
      </SimpleGrid>
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <Panel>
          <SectionHeading
            title="Seu ritmo na semana"
            detail="Horas trabalhadas nos últimos 7 dias"
            action={
              <HStack fontSize="10px" color="var(--muted)">
                <Box w={4} borderTop="1px dashed var(--muted)" />
                <Text>Meta {duration(dailyTarget)}</Text>
              </HStack>
            }
          />
          <Box
            className="week-chart"
            role="img"
            aria-label={week
              .map((day) => `${day.date}: ${duration(day.totalMinutes)}`)
              .join('; ')}
          >
            {week.map((day) => (
              <Box
                key={day.date}
                textAlign="center"
                title={`${day.date}: ${duration(day.totalMinutes)}`}
              >
                <Text
                  className="numeral"
                  fontSize="10px"
                  fontWeight={600}
                  color={day.isToday ? 'var(--accent)' : 'var(--muted)'}
                  mb={2}
                >
                  {day.events.length ? duration(day.totalMinutes) : '—'}
                </Text>
                <Box className="week-bar-track">
                  <Box
                    position="absolute"
                    left={0}
                    right={0}
                    bottom={`${(dailyTarget / max) * 100}%`}
                    borderTop="1px dashed var(--line)"
                  />
                  <Box
                    className={`week-bar ${day.isToday ? 'current' : ''}`}
                    h={`${(day.totalMinutes / max) * 100}%`}
                    opacity={day.events.length ? 1 : 0.35}
                  />
                </Box>
                <Text
                  fontSize="10px"
                  mt={3}
                  color={day.isToday ? 'var(--accent)' : 'var(--muted)'}
                  fontWeight={day.isToday ? 700 : 400}
                >
                  {day.isToday
                    ? 'Hoje'
                    : dateFromKey(day.date)
                        .toLocaleDateString('pt-BR', { weekday: 'short' })
                        .replace('.', '')}
                </Text>
                <Text fontSize="10px" color="var(--muted)" mt={0.5}>
                  {day.date.slice(-2)}
                </Text>
              </Box>
            ))}
          </Box>
        </Panel>
        <Panel>
          <SectionHeading
            title="O mês até aqui"
            detail={dateFromKey(today.date).toLocaleDateString('pt-BR', {
              month: 'long',
              year: 'numeric'
            })}
            action={
              <Button
                as={Link}
                to="/historico"
                size="xs"
                variant="ghost"
                rightIcon={<ArrowForwardIcon />}
              >
                Ver histórico
              </Button>
            }
          />
          <SimpleGrid columns={2} gap={6} mb={6}>
            <Box>
              <Text fontSize="xs" color="var(--muted)">
                Total trabalhado
              </Text>
              <Text className="numeral" fontSize="32px" fontWeight={650} mt={2}>
                {duration(monthTotal)}
                <Text as="span" fontSize="xs" color="var(--muted)" ml={1}>
                  h
                </Text>
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="var(--muted)">
                Saldo estimado
              </Text>
              <Text
                className="numeral"
                fontSize="32px"
                fontWeight={650}
                color={balance < 0 ? 'var(--warning)' : 'var(--accent)'}
                mt={2}
              >
                {signedDuration(balance)}
                <Text as="span" fontSize="xs" ml={1}>
                  h
                </Text>
              </Text>
            </Box>
          </SimpleGrid>
          <Flex
            p={3}
            bg={pending.length ? 'var(--warning-soft)' : 'var(--soft)'}
            borderRadius="10px"
            align="center"
            gap={3}
          >
            {pending.length ? (
              <WarningIcon color="var(--warning)" />
            ) : (
              <CalendarIcon color="var(--accent)" />
            )}
            <Text fontSize="xs" color="var(--muted)">
              {pending.length
                ? `${pending.length} ${
                    pending.length === 1
                      ? 'dia com marcação pendente'
                      : 'dias com marcações pendentes'
                  }. Confira no histórico.`
                : `${closedDays.length} ${
                    closedDays.length === 1
                      ? 'dia com marcações completas'
                      : 'dias com marcações completas'
                  } neste mês.`}
            </Text>
          </Flex>
          <Text fontSize="10px" color="var(--muted)" mt={3}>
            Saldo dos dias completos com registros. Fins de semana contam como
            extra. Não inclui regras de banco de horas.
          </Text>
        </Panel>
      </SimpleGrid>
      {employee && (
        <Panel>
          <Flex gap={5} align="center" wrap="wrap">
            <HStack spacing={3} flex={1} minW="220px">
              <Avatar
                name={employee.name}
                size="sm"
                bg="var(--accent-soft)"
                color="var(--accent)"
              />
              <Box>
                <Text fontSize="xs" fontWeight={600} textTransform="capitalize">
                  {employee.name?.toLocaleLowerCase('pt-BR')}
                </Text>
                <Text fontSize="11px" color="var(--muted)" mt={1}>
                  Matrícula {employee.registrationNumber ?? 'não informada'}
                  {employee.shift ? ` · Turno ${employee.shift}` : ''}
                </Text>
              </Box>
            </HStack>
            <Box flex={1} minW="220px">
              <Text className="eyebrow" fontSize="9px">
                Empresa / Centro de custo
              </Text>
              <Text fontSize="11px" mt={1}>
                {employee.company?.name || 'Não informado'}
              </Text>
              <Text fontSize="11px" color="var(--muted)" mt={1}>
                {employee.costCenter?.name || 'Centro de custo não informado'}
              </Text>
            </Box>
            <Box>
              <Text className="eyebrow" fontSize="9px">
                Jornada informada
              </Text>
              <Text fontSize="xs" mt={2} className="numeral">
                {employee.timeTable || 'Não informada'}
              </Text>
            </Box>
          </Flex>
        </Panel>
      )}
      {!clockingEvents.length && !fetchError && (
        <Center>
          <Text fontSize="xs" color="var(--muted)">
            Nenhuma marcação foi retornada para este usuário.
          </Text>
        </Center>
      )}
      <EventDetails event={selected} onClose={() => setSelected(null)} />
    </Stack>
  )
}

export default App
