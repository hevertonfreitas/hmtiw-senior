import { useContext } from 'react'
import { SeniorContext } from '../../contexts/SeniorContext'

export const useSeniorContext = () => useContext(SeniorContext)!
export { useSenior } from './useSenior'
