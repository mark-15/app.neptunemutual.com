import { DescriptionComponent } from '@/modules/my-policies/PurchasePolicyReceipt/DescriptionComponent'
import { useRouter } from 'next/router'
import { safeParseBytes32String } from '@/utils/formatter/bytes32String'
import { useCoverOrProductData } from '@/src/hooks/useCoverOrProductData'
import { convertFromUnits, sumOf, toBN } from '@/utils/bn'
import { useAppConstants } from '@/src/context/AppConstants'
import { formatCurrency } from '@/utils/formatter/currency'
import { formatPercent } from '@/utils/formatter/percent'

import { useFetchCoverPurchasedEvent } from '@/src/hooks/useFetchCoverPurchasedEvent'
import DateLib from '@/lib/date/DateLib'
import { CoverParameters } from '@/common/CoverParameters/CoverParameters'
import { Alert } from '@/common/Alert/Alert'
import { t } from '@lingui/macro'
import Link from 'next/link'
import { Routes } from '@/src/config/routes'
import { useFetchCoverStats } from '@/src/hooks/useFetchCoverStats'
import { StandardsTerms } from '@/modules/cover/cover-terms/StandardTerms'

export const PurchasePolicyReceipt = ({ txHash }) => {
  const router = useRouter()

  const { liquidityTokenDecimals, liquidityTokenSymbol } = useAppConstants()
  const { data: event } = useFetchCoverPurchasedEvent({ txHash })
  const { coverInfo } = useCoverOrProductData({
    coverKey: event?.coverKey,
    productKey: event?.productKey
  })
  const { info } = useFetchCoverStats({
    coverKey: event?.coverKey,
    productKey: event?.productKey
  })

  if (!txHash || !event) return null

  const purchaser = event.onBehalfOf
  const onBehalfOf = event.onBehalfOf

  const policyName =
    coverInfo?.infoObj?.productName || coverInfo?.infoObj?.coverName
  const date = new Date(
    parseInt(event.createdAtTimestamp) * 1000
  ).toUTCString()
  const receiptNo = event.policyId

  const daysCovered = toBN(event.expiresOn)
    .minus(event.createdAtTimestamp)
    .dividedBy(24 * 60 * 60)
    .toString()

  const duration = Math.ceil(
    parseFloat(toBN(daysCovered).dividedBy(30).toString())
  )

  const rate = toBN(event.fee)
    .multipliedBy(365)
    .dividedBy(
      toBN(event.amountToCover).multipliedBy(
        Math.floor(parseFloat(daysCovered))
      )
    )
    .toString()

  const startsAt = DateLib.getEodInUTC(DateLib.fromUnix(sumOf(event.createdAtTimestamp, info.coverageLag)))

  const onBehalfOfData = [
    {
      label: 'Protection',
      value: formatCurrency(
        convertFromUnits(
          event.amountToCover,
          liquidityTokenDecimals
        ).toString(),
        router.locale,
        liquidityTokenSymbol,
        true
      ).long
    },
    {
      label: 'Premium Rate',
      value: formatPercent(rate, router.locale)
    },
    {
      label: 'Duration',
      value: `${duration} months`
    },
    {
      label: 'Start Date',
      value: DateLib.toLongDateFormat(startsAt, 'en-GB', '')
    },
    {
      label: 'End Date',
      value: DateLib.toLongDateFormat(event.expiresOn, 'en-GB', '')
    },
    {
      label: 'Cashback Code',
      value: safeParseBytes32String(event.referralCode) || '---'
    }
  ]

  const premuimPaid = formatCurrency(
    convertFromUnits(event.fee, liquidityTokenDecimals).toString(),
    router.locale,
    liquidityTokenSymbol,
    true
  ).long

  const text = {
    policyInfo: coverInfo?.infoObj?.about,
    coverRules: [
      'Carefully read the following terms and conditions. For a successful claim payout, all of the following points must be true.',
      <CoverParameters key='cover_params' parameters={coverInfo?.infoObj?.parameters} titleClassName='text-lg font-bold mt-6 leading-5 mb-2 font-arial' />
    ],
    exclusions: coverInfo?.infoObj?.exclusions
  }

  const policyReceiptData = [
    [
      'Date:',
      new Date(date).toUTCString()
    ],
    [
      'Receipt no:',
      receiptNo
    ],
    [
      'Purchaser:',
      purchaser
    ]
  ]

  return (
    <div className='bg-white font-arial'>

      <div className='px-10 pt-4 m-auto md:px-10 lg:max-w-5xl pb-52'>
        <div className='flex cursor-pointer mt-9'>

          <Link href={Routes.Home} replace>
            <a>
              <picture>
                <img
                  loading='lazy'
                  alt={t`Neptune Mutual`}
                  srcSet='/logos/neptune-mutual-full-beta.svg'
                  className='w-full text-black h-9'
                  data-testid='header-logo'
                />
              </picture>
            </a>
          </Link>
          <div className='flex-grow'> </div>
          <a
            href='https://neptunemutual.com'
            className='items-end mt-2 text-black'
          >
            neptunemutual.com
          </a>
        </div>

        <hr className='mt-4 mb-10' />
        <h1 className='font-bold leading-9 text-receipt-info'>
          {policyName} Policy Receipt
        </h1>

        {
          policyReceiptData.map(([label, value]) => (
            <div className='flex mt-4 text-lg leading-7' key={label}>
              <p className='mr-2 font-bold'>{label}</p>
              <p>{value}</p>
            </div>
          ))
        }

        <hr className='mt-12' />

        <div className='mt-10'>

          <div className='text-lg leading-6 mt-3.5 mb-10'>
            <p className='mb-2 mr-2 font-bold leading-7 text-receipt-info'>On Behalf Of</p>
            <p className='text-md'>{onBehalfOf}</p>
          </div>

          {onBehalfOfData.map(({ label, value }, i) => (
            <div
              key={i}
              className='flex pb-4 text-lg leading-6'
            >
              <p className='flex-shrink-0 w-full font-bold leading-5 max-w-60'>{label}</p>
              <div className='overflow-hidden'>{value}</div>
            </div>
          ))}

          <div className='flex text-lg font-bold leading-6'>
            <p className='w-full max-w-60'>Premium Paid</p>
            <p className='uppercase'>{premuimPaid}</p>
          </div>

          <hr className='mt-12' />

          <div className='flex mt-10 text-lg leading-5'>
            <p className='flex-shrink-0 w-full font-bold max-w-60'>Your {'cx' + liquidityTokenSymbol} Address</p>
            <div className='flex items-center break-all'>
              {event.cxToken}
            </div>
          </div>
          <div className='flex mt-6 text-lg leading-5'>
            <p className='flex-shrink-0 w-full font-bold max-w-60'>Transaction Receipt</p>
            <div className='flex items-center break-all'>
              {txHash}
            </div>
          </div>
        </div>

        <hr className='my-10' />

        <Alert printable>
          <p className='text-lg font-bold text-E03636'>Beta Version Disclaimer</p>
          <p className='mt-1 text-lg text-E03636'>As you are participating in the beta version of the Neptune Mutual protocol, it is possible that the terms and exclusions may change.</p>
        </Alert>

        <DescriptionComponent
          title='Cover Rules'
          text={text.coverRules}
          className='mt-13'
          bullets
        />

        <DescriptionComponent
          title='Exclusions'
          text={text.exclusions}
          className='mt-6'
          bullets
        />

        <StandardsTerms className='mt-8 text-lg' />
      </div>
    </div>
  )
}
