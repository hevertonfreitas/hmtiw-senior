import { ArrowForwardIcon, CheckCircleIcon, TimeIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  SimpleGrid,
  Stack,
  Text
} from '@chakra-ui/react'
import { useState } from 'react'
import { TokenForm } from './TokenForm'
import { LoginForm } from './LoginForm'
import { useSeniorContext } from '../../hooks/useSenior'

export const AuthForm = () => {
  const [useToken, setUseToken] = useState(false)
  const { saveToken, authenticate, authenticating } = useSeniorContext()
  return (
    <SimpleGrid
      columns={{ base: 1, md: 2 }}
      gap={{ base: 8, md: 16 }}
      alignItems="center"
      py={{ base: 4, md: 14 }}
    >
      <Box>
        <Text className="eyebrow" color="var(--accent)" mb={4}>
          MAIS CLAREZA PARA O SEU DIA
        </Text>
        <Heading
          fontSize={{ base: '36px', md: '48px' }}
          fontWeight={650}
          lineHeight={1.15}
          letterSpacing="-.05em"
        >
          Seu tempo merece
          <br />
          <Text as="span" color="var(--accent)">
            um olhar melhor.
          </Text>
        </Heading>
        <Text
          color="var(--muted)"
          mt={5}
          maxW="380px"
          fontSize="sm"
          lineHeight={1.8}
        >
          Acompanhe suas horas, entenda sua jornada e tenha cada marcação ao
          alcance de um toque.
        </Text>
        <Stack spacing={4} mt={8}>
          <HStack spacing={3}>
            <TimeIcon color="var(--accent)" />
            <Text fontSize="sm">Sua jornada atualizada ao longo do dia</Text>
          </HStack>
          <HStack spacing={3}>
            <CheckCircleIcon color="var(--accent)" />
            <Text fontSize="sm">
              Histórico completo e detalhes dos registros
            </Text>
          </HStack>
          <HStack spacing={3}>
            <ArrowForwardIcon color="var(--accent)" />
            <Text fontSize="sm">
              Metas, previsões e exportação em um só lugar
            </Text>
          </HStack>
        </Stack>
      </Box>
      <Box className="panel" p={{ base: 6, md: 9 }}>
        <Text className="eyebrow" mb={2}>
          BEM-VINDO AO HMTIW
        </Text>
        <Heading fontSize="2xl" letterSpacing="-.03em" mb={2}>
          Vamos acompanhar seu dia?
        </Heading>
        <Text fontSize="sm" color="var(--muted)" mb={7}>
          Conecte sua conta Senior para começar.
        </Text>
        {useToken ? (
          <TokenForm onSubmit={saveToken} />
        ) : (
          <LoginForm onSubmit={authenticate} loading={authenticating} />
        )}
        <Flex align="center" gap={4} my={5}>
          <Box flex={1} h="1px" bg="var(--line)" />
          <Text fontSize="xs" color="var(--muted)">
            ou
          </Text>
          <Box flex={1} h="1px" bg="var(--line)" />
        </Flex>
        <Button
          width="full"
          variant="outline"
          onClick={() => setUseToken((value) => !value)}
        >
          {useToken ? 'Entrar com usuário e senha' : 'Entrar com token Senior'}
        </Button>
        <Text
          fontSize="10px"
          color="var(--muted)"
          textAlign="center"
          mt={5}
          lineHeight={1.7}
        >
          O HMTIW consulta seus registros de ponto na Senior.
          <br />O token de acesso fica em um cookie neste navegador.
        </Text>
      </Box>
    </SimpleGrid>
  )
}
