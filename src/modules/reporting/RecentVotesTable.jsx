import * as Tooltip from '@radix-ui/react-tooltip'
import {
  Table,
  TableShowMore,
  TableWrapper,
  TBody,
  THead
} from '@/common/Table/Table'
import OpenInNewIcon from '@/icons/OpenInNewIcon'
import { getTxLink } from '@/lib/connect-wallet/utils/explorer'
import { classNames } from '@/utils/classnames'
import { convertFromUnits } from '@/utils/bn'
import { useNetwork } from '@/src/context/Network'
import { useRecentVotes } from '@/src/hooks/useRecentVotes'
import { fromNow } from '@/utils/formatter/relative-time'
import DateLib from '@/lib/date/DateLib'
import { formatCurrency } from '@/utils/formatter/currency'
import { t, Trans } from '@lingui/macro'
import { useRouter } from 'next/router'
import { usePagination } from '@/src/hooks/usePagination'
import { useAppConstants } from '@/src/context/AppConstants'
import ClockIcon from '@/icons/ClockIcon'

const renderHeader = (col) => (
  <th
    scope='col'
    className={classNames(
      'px-6 py-6 font-bold text-sm tracking-wider uppercase',
      col.align === 'right' ? 'text-right' : 'text-left'
    )}
  >
    {col.name}
  </th>
)

const renderWhen = (row) => <WhenRenderer row={row} />

const renderAccount = (row) => (
  <td className='px-6 py-6'>
    <span className='whitespace-nowrap'>{row.witness}</span>
  </td>
)

const renderAmount = (row) => <AmountRenderer row={row} />

const renderActions = (row) => <ActionsRenderer row={row} />

const columns = [
  {
    name: t`when`,
    align: 'left',
    renderHeader,
    renderData: renderWhen
  },
  {
    name: t`Account`,
    align: 'left',
    renderHeader,
    renderData: renderAccount
  },
  {
    name: t`Weight`,
    align: 'right',
    renderHeader,
    renderData: renderAmount
  },
  {
    name: '',
    align: 'right',
    renderHeader,
    renderData: renderActions
  }
]

export const RecentVotesTable = ({ coverKey, productKey, incidentDate }) => {
  const { page, limit, setPage } = usePagination()
  const { data, loading, hasMore } = useRecentVotes({
    coverKey,
    productKey,
    incidentDate,
    page,
    limit
  })

  const { transactions } = data

  return (
    <>
      <h3 className='mb-6 font-bold text-center text-h4 font-sora mt-14 md:text-left'>
        <Trans>Recent Votes</Trans>
      </h3>

      <TableWrapper>
        <Table>
          <THead columns={columns} />
          <TBody
            isLoading={loading}
            columns={columns}
            data={transactions}
          />
        </Table>
        {hasMore && (
          <TableShowMore
            isLoading={loading}
            onShowMore={() => {
              setPage((prev) => prev + 1)
            }}
          />
        )}
      </TableWrapper>
    </>
  )
}

const WhenRenderer = ({ row }) => {
  const router = useRouter()

  return (
    <td
      className='max-w-xs px-6 py-6 w-max whitespace-nowrap'
      title={DateLib.toLongDateFormat(row.transaction.timestamp, router.locale)}
    >
      {fromNow(row.transaction.timestamp)}
    </td>
  )
}

const AmountRenderer = ({ row }) => {
  const router = useRouter()
  const { NPMTokenSymbol } = useAppConstants()

  return (
    <td className='max-w-sm px-6 py-6'>
      <div className='flex items-center justify-end whitespace-nowrap'>
        <div
          className={classNames(
            'w-4 h-4 mr-4 rounded',
            row.voteType === 'Attested' ? 'bg-21AD8C' : 'bg-FA5C2F'
          )}
        />
        <div
          className='text-right'
          title={
            formatCurrency(
              convertFromUnits(row.stake),
              router.locale,
              NPMTokenSymbol,
              true
            ).long
          }
        >
          {
            formatCurrency(
              convertFromUnits(row.stake),
              router.locale,
              NPMTokenSymbol,
              true
            ).short
          }
        </div>
      </div>
    </td>
  )
}

const ActionsRenderer = ({ row }) => {
  const { networkId } = useNetwork()
  const router = useRouter()

  return (
    <td className='px-6 py-6 min-w-60'>
      <div className='flex items-center justify-end'>
        {/* Tooltip */}
        <Tooltip.Root>
          <Tooltip.Trigger className='p-1 mr-4 text-9B9B9B'>
            <span className='sr-only'>
              <Trans>Timestamp</Trans>
            </span>
            <ClockIcon className='w-4 h-4' />
          </Tooltip.Trigger>

          <Tooltip.Content side='top'>
            <div className='max-w-sm p-3 text-sm leading-6 text-white bg-black rounded-xl'>
              <p>
                {DateLib.toLongDateFormat(
                  row.transaction.timestamp,
                  router.locale,
                  'UTC'
                )}
              </p>
            </div>
            <Tooltip.Arrow offset={16} className='fill-black' />
          </Tooltip.Content>
        </Tooltip.Root>

        <a
          href={getTxLink(networkId, { hash: row.transaction.id })}
          target='_blank'
          rel='noreferrer noopener nofollow'
          className='p-1 text-black'
          title='Open in explorer'
        >
          <span className='sr-only'>Open in explorer</span>
          <OpenInNewIcon className='w-4 h-4' />
        </a>
      </div>
    </td>
  )
}
