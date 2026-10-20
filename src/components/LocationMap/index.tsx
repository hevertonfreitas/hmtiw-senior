import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Box, Flex, Link, SimpleGrid, Text } from '@chakra-ui/react'
import { Geolocation } from '../../services/senior/dtos/clocking-event-by-active-user-query'

type LocationMapProps = {
  location: Geolocation
  collectedAt: string
}

export const LocationMap = ({ location, collectedAt }: LocationMapProps) => {
  const { latitude, longitude } = location
  const bounds = [
    Math.max(-180, longitude - 0.004),
    Math.max(-90, latitude - 0.0025),
    Math.min(180, longitude + 0.004),
    Math.min(90, latitude + 0.0025)
  ]
  const query = new URLSearchParams({
    bbox: bounds.join(','),
    layer: 'mapnik',
    marker: `${latitude},${longitude}`
  })
  const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`

  return (
    <Box
      border="1px solid var(--line)"
      borderRadius="14px"
      overflow="hidden"
      mb={4}
    >
      <Box
        as="iframe"
        src={`https://www.openstreetmap.org/export/embed.html?${query}`}
        title="Localização da marcação no OpenStreetMap"
        width="100%"
        height={{ base: '220px', md: '250px' }}
        border={0}
        display="block"
        bg="var(--soft)"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      <Box p={4} bg="var(--soft)" borderTop="1px solid var(--line)">
        <Flex justify="space-between" align="center" gap={3} wrap="wrap" mb={4}>
          <Text fontSize="xs" fontWeight={600}>
            Local da marcação
          </Text>
          <Link
            href={mapUrl}
            isExternal
            title="Abrir no Google Maps"
            color="var(--accent)"
            fontSize="11px"
            fontWeight={600}
          >
            Ampliar mapa <ExternalLinkIcon ml={1} />
          </Link>
        </Flex>
        <SimpleGrid columns={2} spacing={4} as="dl">
          <Box>
            <Text as="dt" fontSize="10px" color="var(--muted)" mb={1}>
              Latitude
            </Text>
            <Text as="dd" fontSize="sm" className="numeral">
              {latitude.toFixed(6)}
            </Text>
          </Box>
          <Box>
            <Text as="dt" fontSize="10px" color="var(--muted)" mb={1}>
              Longitude
            </Text>
            <Text as="dd" fontSize="sm" className="numeral">
              {longitude.toFixed(6)}
            </Text>
          </Box>
        </SimpleGrid>
        <Text fontSize="10px" color="var(--muted)" mt={3}>
          Coletada em {collectedAt}
        </Text>
      </Box>
    </Box>
  )
}
