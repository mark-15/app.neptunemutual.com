import { useState } from 'react'
import { useRouter } from 'next/router'
import { AcceptRulesForm } from '@/common/AcceptRulesForm/AcceptRulesForm'
import { ProvideLiquidityForm } from '@/common/LiquidityForms/ProvideLiquidityForm'
import { CoverActionsFooter } from '@/common/Cover/CoverActionsFooter'
import { Container } from '@/common/Container/Container'
import { SeeMoreParagraph } from '@/common/SeeMoreParagraph'
import { CoverProfileInfo } from '@/common/CoverProfileInfo/CoverProfileInfo'
import { BreadCrumbs } from '@/common/BreadCrumbs/BreadCrumbs'
import { CoverParameters } from '@/common/CoverParameters/CoverParameters'
import { Hero } from '@/common/Hero'
import { getCoverImgSrc } from '@/src/helpers/cover'
import { t, Trans } from '@lingui/macro'
import { safeFormatBytes32String } from '@/utils/formatter/bytes32String'
import { LiquidityResolutionSources } from '@/common/LiquidityResolutionSources/LiquidityResolutionSources'
import { useCoverOrProductData } from '@/src/hooks/useCoverOrProductData'
import { DiversifiedCoverProfileInfo } from '@/common/CoverProfileInfo/DiversifiedCoverProfileInfo'
import { CoveredProducts } from '@/modules/my-liquidity/content/CoveredProducts'
import { DiversifiedCoverRules } from '@/modules/my-liquidity/content/rules'
import { useLiquidityFormsContext } from '@/common/LiquidityForms/LiquidityFormsContext'
import { Routes } from '@/src/config/routes'
import { classNames } from '@/utils/classnames'
import { logAddLiquidityRulesAccepted } from '@/src/services/logs'
import { useWeb3React } from '@web3-react/core'
import { StandardTermsConditionsLink } from '@/common/StandardTermsConditionsLink'
import { analyticsLogger } from '@/utils/logger'

export const CoverAddLiquidityDetailsPage = () => {
  const [acceptedRules, setAcceptedRules] = useState(false)
  const router = useRouter()
  const { coverId } = router.query
  const coverKey = safeFormatBytes32String(coverId)
  const productKey = safeFormatBytes32String('')
  const { coverInfo, loading } = useCoverOrProductData({ coverKey, productKey })
  const { account, chainId } = useWeb3React()

  const isDiversified = coverInfo?.supportsProducts

  const { info, isWithdrawalWindowOpen, accrueInterest } =
    useLiquidityFormsContext()

  if (loading) {
    return (
      <p className='text-center'>
        <Trans>loading...</Trans>
      </p>
    )
  }

  if (!loading && !coverInfo) {
    return (
      <p className='text-center'>
        <Trans>No Data Found</Trans>
      </p>
    )
  }

  const imgSrc = getCoverImgSrc({ key: coverKey })

  const handleAcceptRules = () => {
    setAcceptedRules(true)

    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
    analyticsLogger(() => logAddLiquidityRulesAccepted(chainId ?? null, account ?? null, coverKey))
  }

  return (
    <main>
      <Hero>
        <Container className='px-2 py-20'>
          <BreadCrumbs
            pages={[
              { name: t`Home`, href: '/', current: false },
              {
                name: coverInfo?.infoObj.coverName,
                href: Routes.ViewCover(coverKey),
                current: false
              },
              { name: t`Provide Liquidity`, current: true }
            ]}
          />
          <div className='flex'>
            {isDiversified
              ? (
                <DiversifiedCoverProfileInfo
                  projectName={coverInfo?.infoObj.coverName}
                />
                )
              : (
                <CoverProfileInfo
                  coverKey={coverKey}
                  productKey={productKey}
                  imgSrc={imgSrc}
                  projectName={coverInfo?.infoObj.coverName}
                  links={coverInfo?.infoObj.links}
                />
                )}
          </div>
        </Container>
      </Hero>

      {/* Content */}
      <div className='pt-12 pb-24 border-t border-t-B0C4DB'>
        {isDiversified ? <CoveredProducts coverInfo={coverInfo} /> : null}

        <Container className='grid grid-cols-3 lg:gap-32'>
          <div className={classNames(acceptedRules ? 'col-span-3 md:col-span-2' : 'col-span-3')}>
            {/* Description */}
            <span className='hidden lg:block'>
              <SeeMoreParagraph text={coverInfo?.infoObj?.about} />
            </span>

            <StandardTermsConditionsLink />

            {acceptedRules
              ? (
                <div className='mt-12'>
                  <ProvideLiquidityForm
                    coverKey={coverKey}
                    info={info}
                    isDiversified={isDiversified}
                    underwrittenProducts={isDiversified ? coverInfo?.products.length : 0}
                  />
                </div>
                )
              : (
                <>
                  {isDiversified
                    ? (
                      <>
                        <DiversifiedCoverRules coverInfo={coverInfo} coverKey={coverKey} productKey={productKey} />
                        <AcceptRulesForm
                          onAccept={handleAcceptRules}
                          coverKey={coverKey}
                        >
                          <Trans>
                            I have read, evaluated, understood, agreed to, and
                            accepted all risks, cover terms, exclusions, standard
                            exclusions of this pool and the Neptune Mutual protocol.
                          </Trans>
                        </AcceptRulesForm>
                      </>
                      )
                    : (
                      <>
                        <CoverParameters parameters={coverInfo.infoObj?.parameters} />
                        <AcceptRulesForm
                          onAccept={handleAcceptRules}
                          coverKey={coverKey}
                        >
                          <Trans>
                            I have read, understood, and agree to the terms of cover
                            rules
                          </Trans>
                        </AcceptRulesForm>
                      </>
                      )}
                </>
                )}
          </div>

          <span className='block col-span-3 row-start-1 lg:hidden mb-11'>
            <SeeMoreParagraph text={coverInfo?.infoObj?.about} />
          </span>

          {acceptedRules && (
            <LiquidityResolutionSources
              isDiversified={isDiversified}
              info={info}
              coverInfo={coverInfo}
              isWithdrawalWindowOpen={isWithdrawalWindowOpen}
              accrueInterest={accrueInterest}
            />)}
        </Container>
      </div>

      {!isDiversified && <CoverActionsFooter
        activeKey='add-liquidity'
        coverKey={coverKey}
        productKey={productKey}
                         />}
    </main>
  )
}
