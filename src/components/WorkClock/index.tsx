import { ArrowForwardIcon, CheckCircleIcon, TimeIcon } from '@chakra-ui/icons'
import { Box, Flex, HStack, SimpleGrid, Text } from '@chakra-ui/react'
import { useSeniorContext } from '../../hooks/useSenior'
import { dateKey, duration, estimateExit } from '../../utils/attendance'
import { StatCard, TargetSettings } from '../DashboardParts'

export const WorkClock = () => {
  const { today, dailyTarget, currentDate, timeZone } = useSeniorContext()
  const remaining = Math.max(0, dailyTarget - today.totalMinutes)
  const percent = Math.round((today.totalMinutes / dailyTarget) * 100)
  const lastEvent = today.events[today.events.length - 1]
  const exit =
    today.open && lastEvent.timestamp <= currentDate
      ? estimateExit(today.events, dailyTarget)
      : null
  const status = today.open
    ? 'Em jornada'
    : !today.events.length
    ? 'Ainda não iniciado'
    : today.totalMinutes >= dailyTarget
    ? 'Meta atingida'
    : 'Fora de jornada'

  return (
    <>
      <Box className="clock-card" p={{ base: 6, md: 8 }}>
        <Flex justify="space-between" align="center" gap={3} mb={5} wrap="wrap">
          <HStack spacing={2} color="#d1e0d6">
            <TimeIcon boxSize={4} />
            <Text fontSize="sm" fontWeight={500}>
              Tempo trabalhado hoje
            </Text>
          </HStack>
          <HStack
            spacing={2}
            bg="#ffffff12"
            border="1px solid #ffffff18"
            px={3}
            py={1.5}
            borderRadius="full"
            fontSize="11px"
            color="#d2e9b3"
          >
            <Box className="live-dot" />
            <Text>{status}</Text>
          </HStack>
        </Flex>
        <Text
          className="numeral"
          fontSize={{ base: '68px', md: '88px' }}
          lineHeight={1.08}
          fontWeight={550}
          letterSpacing="-.065em"
          aria-label={`${duration(today.totalMinutes)} trabalhadas hoje`}
        >
          {duration(today.totalMinutes)}
          <Text
            as="span"
            fontSize="sm"
            color="#aac4b4"
            letterSpacing="normal"
            ml={3}
          >
            horas
          </Text>
        </Text>
        <Flex
          justify="space-between"
          fontSize="xs"
          mt={6}
          mb={2}
          color="#c0d2c6"
        >
          <Text>
            {remaining
              ? `Faltam ${duration(remaining)} para a sua meta`
              : 'Meta diária alcançada'}
          </Text>
          <Text fontWeight={600}>{percent}%</Text>
        </Flex>
        <Box
          h="6px"
          bg="#ffffff16"
          borderRadius="full"
          overflow="hidden"
          role="progressbar"
          aria-label="Progresso da meta diária"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.min(100, percent)}
        >
          <Box
            h="full"
            w={`${Math.min(100, percent)}%`}
            bg="#c7e5a4"
            borderRadius="full"
            transition="width .4s"
          />
        </Box>
        <Flex
          mt={5}
          pt={5}
          borderTop="1px solid #ffffff16"
          justify="space-between"
          align="center"
          gap={4}
        >
          <Box>
            <Text fontSize="11px" color="#aac4b4">
              Meta do dia
            </Text>
            <Text fontSize="sm" fontWeight={600} mt={1}>
              {duration(dailyTarget)} de trabalho
            </Text>
          </Box>
          <Box textAlign="right">
            <Text fontSize="11px" color="#aac4b4">
              {today.open
                ? remaining
                  ? 'Previsão de saída'
                  : 'Meta atingida às'
                : 'Última marcação'}
            </Text>
            <Text fontSize="lg" fontWeight={600} mt={1} className="numeral">
              {exit
                ? exit.toLocaleTimeString('pt-BR', {
                    timeZone,
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : today.open
                ? '—'
                : lastEvent?.timeEvent.slice(0, 5) || '—'}
            </Text>
            {exit && dateKey(exit, timeZone) !== today.date && (
              <Text fontSize="10px" color="#aac4b4">
                {exit.toLocaleDateString('pt-BR', {
                  timeZone,
                  day: '2-digit',
                  month: '2-digit'
                })}
              </Text>
            )}
          </Box>
        </Flex>
        {today.open && remaining > 0 && (
          <Text fontSize="10px" color="#aac4b4" mt={3}>
            Previsão se continuar trabalhando sem novas pausas.
          </Text>
        )}
      </Box>
      <Flex justify="space-between" align="center" py={3} gap={3}>
        <Text fontSize="11px" color="var(--muted)">
          Atualização do contador a cada 30 segundos.
        </Text>
        <TargetSettings />
      </Flex>
      <SimpleGrid columns={{ base: 1, sm: 3 }} gap={4}>
        <StatCard
          label="Intervalos"
          value={duration(today.breakMinutes)}
          detail="Entre pares de marcações"
          icon={<TimeIcon />}
        />
        <StatCard
          label="Marcações hoje"
          value={String(today.events.length).padStart(2, '0')}
          detail={
            today.open
              ? 'Há uma jornada em aberto'
              : 'Registros disponíveis na Senior'
          }
          icon={<CheckCircleIcon />}
        />
        <StatCard
          label={remaining ? 'Até a meta' : 'Acima da meta'}
          value={duration(
            remaining || Math.max(0, today.totalMinutes - dailyTarget)
          )}
          detail={
            remaining
              ? 'Tempo de trabalho restante'
              : 'Tempo além da meta diária'
          }
          icon={<ArrowForwardIcon />}
          accent
        />
      </SimpleGrid>
    </>
  )
}
