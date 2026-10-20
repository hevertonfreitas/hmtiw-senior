import { TimeIcon } from '../ui/icons'
import { Box, Flex, HStack, Text } from '@chakra-ui/react'
import { Link } from 'react-router-dom'

export const Logo = () => (
  <Link to="/" aria-label="HMTIW Senior, início">
    <HStack gap={3}>
      <Flex
        w={10}
        h={10}
        bg="brand.800"
        color="#d2e9b3"
        borderRadius="12px"
        align="center"
        justify="center"
      >
        <TimeIcon boxSize={5} />
      </Flex>
      <Box>
        <Text
          fontWeight={750}
          fontSize="lg"
          lineHeight={1.1}
          letterSpacing="-.04em"
        >
          HMTIW
          <Text as="span" color="var(--accent)">
            .
          </Text>
        </Text>
        <Text fontSize="10px" letterSpacing=".15em" color="var(--muted)" mt={1}>
          SENIOR
        </Text>
      </Box>
    </HStack>
  </Link>
)
