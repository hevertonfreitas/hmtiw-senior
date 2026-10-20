import { Badge, Box, HStack, Table, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { useSeniorContext } from '../../hooks/useSenior'
import { DailyData } from '../../hooks/useSenior/types'
import { AttendanceEvent } from '../../services/senior/dtos/clocking-event-by-active-user-query'
import {
  dateFromKey,
  dayBalance,
  dayStatus,
  duration,
  signedDuration
} from '../../utils/attendance'
import { EventDetails } from '../EventDetails'

export type MonthEventTableProps = { data: DailyData[] }

export const MonthEventTable = ({ data }: MonthEventTableProps) => {
  const { dailyTarget } = useSeniorContext()
  const [selected, setSelected] = useState<AttendanceEvent | null>(null)
  const total = data.reduce((sum, day) => sum + day.totalMinutes, 0)
  const balance = data.reduce(
    (sum, day) => sum + dayBalance(day, dailyTarget),
    0
  )
  return (
    <>
      <Text
        display={{ base: 'block', md: 'none' }}
        px={4}
        pb={3}
        fontSize="10px"
        color="var(--muted)"
      >
        Deslize a tabela para o lado para ver os totais e o saldo.
      </Text>
      <Table.ScrollArea width="full">
        <Table.Root
          className="attendance-table"
          variant="line"
          bg="var(--panel)"
        >
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Dia</Table.ColumnHeader>
              <Table.ColumnHeader>Marcações</Table.ColumnHeader>
              <Table.ColumnHeader>Situação</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">
                Trabalhado
              </Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">
                Saldo estimado
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.map((day) => {
              const difference = dayBalance(day, dailyTarget)
              return (
                <Table.Row
                  key={day.date}
                  className={day.isToday ? 'today-row' : ''}
                >
                  <Table.Cell>
                    <HStack gap={3}>
                      <Text className="numeral" fontWeight={650} fontSize="lg">
                        {String(day.day).padStart(2, '0')}
                      </Text>
                      <Box>
                        <Text fontSize="11px" textTransform="capitalize">
                          {dateFromKey(day.date)
                            .toLocaleDateString('pt-BR', { weekday: 'short' })
                            .replace('.', '')}
                        </Text>
                        {day.isToday && (
                          <Text
                            fontSize="9px"
                            color="var(--accent)"
                            fontWeight={700}
                          >
                            HOJE
                          </Text>
                        )}
                      </Box>
                    </HStack>
                  </Table.Cell>
                  <Table.Cell minW="200px" maxW="360px" whiteSpace="normal">
                    <HStack gap={1.5} flexWrap="wrap" rowGap={1.5}>
                      {day.events.length ? (
                        day.events.map((event) => (
                          <Box
                            as="button"
                            key={event.id}
                            px={2}
                            py={1}
                            borderRadius="6px"
                            border="1px solid var(--line)"
                            bg="var(--panel)"
                            fontSize="11px"
                            className="numeral"
                            _hover={{
                              borderColor: 'var(--accent)',
                              color: 'var(--accent)'
                            }}
                            onClick={() => setSelected(event)}
                            aria-label={`Detalhes da marcação de ${dateFromKey(
                              day.date
                            ).toLocaleDateString('pt-BR')} às ${
                              event.timeEvent
                            }`}
                          >
                            {event.timeEvent.slice(0, 5)}
                          </Box>
                        ))
                      ) : (
                        <Text color="var(--muted)">—</Text>
                      )}
                    </HStack>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      fontSize="10px"
                      fontWeight={500}
                      textTransform="none"
                      borderRadius="full"
                      px={2.5}
                      py={1}
                      bg={
                        day.open
                          ? day.isToday
                            ? 'var(--accent-soft)'
                            : 'var(--warning-soft)'
                          : 'var(--soft)'
                      }
                      color={
                        day.open && !day.isToday
                          ? 'var(--warning)'
                          : day.events.length
                            ? 'var(--accent)'
                            : 'var(--muted)'
                      }
                    >
                      {dayStatus(day)}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell
                    textAlign="end"
                    className="numeral"
                    fontWeight={600}
                  >
                    {day.events.length ? duration(day.totalMinutes) : '—'}
                    {day.open && (
                      <Text
                        fontSize="9px"
                        fontWeight={400}
                        color="var(--muted)"
                      >
                        {day.isToday ? 'parcial' : 'pares completos'}
                      </Text>
                    )}
                  </Table.Cell>
                  <Table.Cell
                    textAlign="end"
                    className="numeral"
                    color={difference < 0 ? 'var(--warning)' : 'var(--accent)'}
                    fontWeight={600}
                  >
                    {day.events.length && !day.open
                      ? signedDuration(difference)
                      : '—'}
                  </Table.Cell>
                </Table.Row>
              )
            })}
            <Table.Row bg="var(--soft)">
              <Table.Cell colSpan={3}>
                <Text fontSize="xs" fontWeight={600}>
                  Resumo dos dias exibidos
                </Text>
              </Table.Cell>
              <Table.Cell textAlign="end" className="numeral" fontWeight={700}>
                {duration(total)}
              </Table.Cell>
              <Table.Cell
                textAlign="end"
                className="numeral"
                fontWeight={700}
                color={balance < 0 ? 'var(--warning)' : 'var(--accent)'}
              >
                {signedDuration(balance)}
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
      <EventDetails event={selected} onClose={() => setSelected(null)} />
    </>
  )
}
