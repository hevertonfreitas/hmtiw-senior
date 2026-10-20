import axios, { AxiosError } from 'axios'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { clockingEventByActiveUserQuery } from '../../services/senior'
import {
  getTokenCookie,
  removeTokenCookie,
  setTokenCookie
} from '../../utils/token'
import { useNotify } from '../useNotify'
import { AttendanceEvent } from '../../services/senior/dtos/clocking-event-by-active-user-query'
import { login } from '../../services/senior/login'
import { AuthCredentialRequest } from '../../services/senior/dtos/auth-data'
import {
  DEFAULT_TARGET,
  DEFAULT_TIMEZONE,
  buildDay,
  dateKey,
  duration,
  monthEventsGroup,
  scheduleMinutes
} from '../../utils/attendance'

const readTarget = () => {
  try {
    const value = Number(localStorage.getItem('hmtiw-daily-target'))
    return value > 0 && value <= 1440 ? value : null
  } catch {
    return null
  }
}

export const useSenior = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [year, setYear] = useState(new Date().getFullYear())
  const [clockingEvents, setClockingEvents] = useState<AttendanceEvent[]>([])
  const [authenticating, setAuthenticating] = useState(false)
  const [token, setToken] = useState(() => getTokenCookie() || '')
  const [loading, setLoading] = useState(() => Boolean(token))
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [fetchError, setFetchError] = useState(false)
  const [customTarget, setCustomTarget] = useState<number | null>(readTarget)
  const requestId = useRef(0)
  const { requestWarning, tokenError, authenticationError } = useNotify()

  const logout = useCallback(() => {
    requestId.current += 1
    setToken('')
    removeTokenCookie()
    setClockingEvents([])
    setLastUpdated(null)
    setFetchError(false)
    setLoading(false)
  }, [])

  const loadClockingEvents = useCallback(() => {
    if (!token) return
    const id = ++requestId.current
    return clockingEventByActiveUserQuery(token)
      .then((data) => {
        if (id !== requestId.current) return
        setClockingEvents(data)
        setLastUpdated(new Date())
        setCurrentDate(new Date())
      })
      .catch((error: unknown) => {
        if (id !== requestId.current) return
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          logout()
          tokenError()
        } else {
          setFetchError(true)
          requestWarning()
        }
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false)
      })
  }, [token, logout, tokenError, requestWarning])

  const refresh = () => {
    if (!token) return
    setLoading(true)
    setFetchError(false)
    return loadClockingEvents()
  }

  const saveToken = (value: string) => {
    const clean = value.trim()
    if (!clean) return
    requestId.current += 1
    setLoading(true)
    setFetchError(false)
    setClockingEvents([])
    setLastUpdated(null)
    setToken(clean)
    setTokenCookie(clean)
  }

  const authenticate = async (data: AuthCredentialRequest) => {
    setAuthenticating(true)
    try {
      const value = await login(data)
      if (value instanceof AxiosError) return authenticationError()
      saveToken(value)
    } finally {
      setAuthenticating(false)
    }
  }

  const employee = clockingEvents[clockingEvents.length - 1]?.employee
  const timeZone = employee?.company?.timezone || DEFAULT_TIMEZONE
  const targetFromSchedule = scheduleMinutes(employee?.timeTable)
  const dailyTarget = customTarget ?? targetFromSchedule ?? DEFAULT_TARGET
  const todayKey = dateKey(currentDate, timeZone)
  const today = useMemo(
    () =>
      buildDay(
        todayKey,
        clockingEvents.filter((event) => event.dateEvent === todayKey),
        currentDate,
        timeZone
      ),
    [clockingEvents, todayKey, currentDate, timeZone]
  )
  const monthlyReport = useMemo(
    () => monthEventsGroup(clockingEvents, year, currentDate, timeZone),
    [clockingEvents, year, currentDate, timeZone]
  )
  const currentMonth = useMemo(
    () =>
      monthEventsGroup(
        clockingEvents,
        Number(todayKey.slice(0, 4)),
        currentDate,
        timeZone
      )[Number(todayKey.slice(5, 7)) - 1],
    [clockingEvents, todayKey, currentDate, timeZone]
  )

  const setDailyTarget = (minutes: number | null) => {
    if (
      minutes !== null &&
      (!Number.isFinite(minutes) || minutes <= 0 || minutes > 1440)
    )
      return
    setCustomTarget(minutes)
    try {
      if (minutes === null) localStorage.removeItem('hmtiw-daily-target')
      else localStorage.setItem('hmtiw-daily-target', String(minutes))
    } catch {
      /* The preference still works for this session. */
    }
  }

  useEffect(() => {
    loadClockingEvents()
    return () => {
      requestId.current += 1
    }
  }, [loadClockingEvents])

  useEffect(() => {
    const intervalId = setInterval(() => setCurrentDate(new Date()), 30000)
    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    document.title =
      token && today.open
        ? `${duration(today.totalMinutes)} · HMTIW Senior`
        : 'HMTIW Senior · Seu ponto, com clareza'
  }, [token, today.open, today.totalMinutes])

  return {
    token,
    authenticate,
    authenticating,
    logout,
    clockingEvents,
    today,
    employee,
    monthlyReport,
    currentMonth,
    saveToken,
    loading,
    fetchError,
    lastUpdated,
    refresh,
    year,
    setYear,
    currentDate,
    timeZone,
    dailyTarget,
    setDailyTarget,
    customTarget,
    targetFromSchedule
  }
}
