import { Fragment, ReactNode } from 'react'

import { useTranslation } from '../../lib/withT'

import Me from '../Auth/Me'
import Meta from '../Frame/Meta'
import Loader from '../Loader'

import ErrorFrame from './Frame'

import { Interaction } from '@project-r/styleguide'

const StatusError = ({
  statusCode,
  children,
}: {
  statusCode: number
  children?: ReactNode
}) => {
  const { t } = useTranslation()

  return (
    <Loader
      render={() => (
        <Fragment>
          <Meta data={{ title: statusCode }} />
          <ErrorFrame statusCode={statusCode}>
            {children || (
              <Interaction.P>
                {t(`error/${statusCode}`, undefined, null)}
              </Interaction.P>
            )}
            <div style={{ height: 60 }} />
            <Me />
          </ErrorFrame>
        </Fragment>
      )}
    />
  )
}

export default StatusError
