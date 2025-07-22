import { AlertCircle } from 'lucide-react'
import { Box, Callout, Text } from '@radix-ui/themes'

const GeneralWarningErrorCallout = ({
  generalErrors,
  warnings,
}: {
  generalErrors: any[]
  warnings: any[]
}) => {
  return (
    <>
      {generalErrors.length > 0 && (
        <Box mb='4'>
          <Callout.Root color='red' mb='2'>
            <Callout.Icon>
              <AlertCircle size={16} />
            </Callout.Icon>
            <Callout.Text>
              {generalErrors.length === 1 ? (
                generalErrors[0].message
              ) : (
                <Box>
                  <Text weight='bold' mb='1'>
                    Es sind Fehler aufgetreten:
                  </Text>
                  <ul style={{ margin: '0', paddingLeft: '20px' }}>
                    {generalErrors.map((error, index) => (
                      <li key={index}>{error.message}</li>
                    ))}
                  </ul>
                </Box>
              )}
            </Callout.Text>
          </Callout.Root>
        </Box>
      )}

      {warnings.length > 0 && (
        <Box mb='4'>
          <Callout.Root color='yellow' mb='2'>
            <Callout.Icon>
              <AlertCircle size={16} />
            </Callout.Icon>
            <Callout.Text>
              {warnings.length === 1 ? (
                warnings[0]
              ) : (
                <Box>
                  <Text weight='bold' mb='1'>
                    Warnungen:
                  </Text>
                  <ul style={{ margin: '0', paddingLeft: '20px' }}>
                    {warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </Box>
              )}
            </Callout.Text>
          </Callout.Root>
        </Box>
      )}
    </>
  )
}

export default GeneralWarningErrorCallout
