import { CalendarIcon, RepeatIcon, TimeIcon } from '@chakra-ui/icons'
import { Box, Button, Container, Flex, HStack, Text } from '@chakra-ui/react'
import { ReactNode, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useSeniorContext } from '../../hooks/useSenior'
import { Logo } from '../Logo'
import { ToggleButton } from '../ToggleButton'

export type TemplateProps = { children?: ReactNode }

export const Template = ({ children }: TemplateProps) => {
  const { token, refresh, loading, logout, lastUpdated, timeZone } =
    useSeniorContext()
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname, token])
  return (
    <Box minH="100vh">
      <Box as="header" className="app-header">
        <Container maxW="1200px" px={{ base: 5, md: 8 }}>
          <Flex
            minH="80px"
            align="center"
            justify="space-between"
            gap={3}
            wrap="wrap"
            py={4}
          >
            <Logo />
            <HStack spacing={{ base: 1, md: 3 }}>
              {token && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<RepeatIcon />}
                    isLoading={loading}
                    onClick={refresh}
                  >
                    Atualizar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    color="var(--muted)"
                    onClick={logout}
                  >
                    Sair
                  </Button>
                </>
              )}
              <ToggleButton />
            </HStack>
          </Flex>
          {token && (
            <Flex align="center" justify="space-between" pb={4} gap={4}>
              <HStack as="nav" aria-label="Navegação principal" spacing={1}>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <TimeIcon /> Visão geral
                </NavLink>
                <NavLink
                  to="/historico"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <CalendarIcon /> Histórico
                </NavLink>
              </HStack>
              <Text
                display={{ base: 'none', md: 'block' }}
                fontSize="xs"
                color="var(--muted)"
              >
                {lastUpdated
                  ? `Atualizado às ${lastUpdated.toLocaleTimeString('pt-BR', {
                      timeZone,
                      hour: '2-digit',
                      minute: '2-digit'
                    })}`
                  : 'Conectado à Senior'}
              </Text>
            </Flex>
          )}
        </Container>
      </Box>
      <Container
        as="main"
        maxW="1200px"
        px={{ base: 5, md: 8 }}
        py={{ base: 7, md: 10 }}
      >
        {children}
      </Container>
      <Container as="footer" maxW="1200px" px={{ base: 5, md: 8 }} pb={7}>
        <Flex
          borderTop="1px solid var(--line)"
          pt={5}
          justify="space-between"
          gap={3}
          wrap="wrap"
        >
          <Text fontSize="11px" color="var(--muted)">
            HMTIW Senior · Seu ponto, com clareza.
          </Text>
          <Text fontSize="11px" color="var(--muted)">
            Consulta de marcações · {timeZone.replace(/_/g, ' ')}
          </Text>
        </Flex>
      </Container>
    </Box>
  )
}
