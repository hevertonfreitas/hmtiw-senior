/** Dates and times are strings in the Senior API, not JavaScript Date objects. */
export interface ClockingEventByActiveUserQueryResponse {
  count: number
  totalPages: number
  result: ClockingEvent[]
}

export interface ClockingEvent {
  id: string
  dateEvent: string
  timeEvent: string
  cnpj?: string
  caepf?: string
  cnoNumber?: string
  pis?: string
  cpfNumber?: string
  createdAt?: string
  appVersion?: string
  platform?: string
  device?: Device | null
  geolocation?: Geolocation | null
  employee?: Employee | null
  readed?: boolean
  fenceState?: string
  connectionType?: string
  use?: number
  appointmentId?: string
  mode?: string
  online?: boolean
  signature?: string
  signatureVersion?: number
  signatureStatus?: string
  origin?: string
  nsrNumber?: number
  timeZone?: string
  deviceTimeZone?: string
  arpId?: string
  arpSyncDate?: string
  arpHash?: string
  _discriminator?: string
}

export interface Device {
  id?: string
  name?: string
  model?: string
  imei?: string
  status?: string
  activations?: unknown[]
  _discriminator?: string
  $ref?: string
}

export interface HeadQuarter {
  id?: string
  code?: number
  name?: string
  dataOrigin?: string
  externalId?: string
}

export interface CostCenter {
  id?: string
  code?: string
  name?: string
  dataOrigin?: string
  externalId?: string
}

export interface Employee {
  id?: string
  externalId?: string
  name?: string
  pis?: string
  cpfNumber?: string
  mail?: string
  company?: Company | null
  managers?: unknown[]
  platformUserName?: string
  platformUsers?: { id?: string; username?: string }[]
  biometricPatterns?: unknown[]
  lastUpdate?: string
  fences?: unknown[]
  enabled?: boolean
  dataOrigin?: string
  registrationNumber?: number
  employeeType?: string
  pushMessages?: unknown[]
  pushFCMToken?: string
  deviceTypeToken?: string
  arpId?: string
  arpSyncDate?: string
  shift?: string
  workSchedule?: string
  timeTable?: string
  externalControlTimezone?: boolean
  headQuarter?: HeadQuarter | null
  costCenter?: CostCenter | null
  _discriminator?: string
  $ref?: string
}

export interface Company {
  id?: string
  cnpj?: string
  name?: string
  dataOrigin?: string
  timezone?: string
  headquarters?: boolean
  externalId?: string
  cnoNumber?: string
  caepf?: string
  arpId?: string
  arpSyncDate?: string
  address?: Address | null
  legalRepresentativeIdentifier?: number | string
  employerType?: string
  externalControlTimezone?: boolean
  headQuarter?: HeadQuarter | null
  _discriminator?: string
}

export interface Address {
  id?: string
  cep?: string
  address?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  country?: string
}

export interface Geolocation {
  id?: string
  latitude: number
  longitude: number
  dateAndTime?: string
  _discriminator?: string
}

/** A record keeps the API metadata alongside its absolute instant. */
export interface AttendanceEvent extends ClockingEvent {
  timestamp: Date
}

export type Result = ClockingEvent
