import React, { useEffect, useState } from 'react'
import { Header } from '@/common/Header/Header'
import { MainnetDisclaimerModal, TestnetDisclaimerModal } from '@/common/Disclaimer/DisclaimerModal'
import { ScrollToTopButton } from '@/common/ScrollToTop/ScrollToTopButton'
import { CookiePolicy, getLSAcceptedCookie } from '@/common/CookiePolicy'
import Router from 'next/router'
import { useValidateNetwork } from '@/src/hooks/useValidateNetwork'
import { useNetwork } from '@/src/context/Network'

export const PageLoader = () => {
  const [showLoader, setShowLoader] = useState(false)

  useEffect(() => {
    const show = () => setShowLoader(true)
    const hide = () => setShowLoader(false)

    Router.events.on('routeChangeStart', show)
    Router.events.on('routeChangeComplete', hide)
    Router.events.on('routeChangeError', hide)

    return () => {
      Router.events.off('routeChangeStart', show)
      Router.events.off('routeChangeComplete', hide)
      Router.events.off('routeChangeError', hide)
    }
  }, [])

  if (!showLoader) {
    return null
  }

  return (
    <div className='fixed top-0 z-50 w-full bg-gray-200'>
      <div data-testid='progress-bar' className='w-full h-2 shim-progress' />
    </div>
  )
}

export const MainLayout = ({ noHeader = false, children }) => {
  const [isCookieOpen, setIsCookieOpen] = useState(() => !getLSAcceptedCookie())
  const { networkId } = useNetwork()
  const { isMainNet } = useValidateNetwork(networkId)

  return (
    <>
      <PageLoader />
      {!noHeader && <Header />}
      <div className='relative sm:static'>
        {children}
        <CookiePolicy
          isOpen={isCookieOpen}
          onClose={() => setIsCookieOpen(false)}
        />
        {!isMainNet && !isCookieOpen && <TestnetDisclaimerModal />}
        {isMainNet && !isCookieOpen && <MainnetDisclaimerModal />}
        <ScrollToTopButton />
      </div>
    </>
  )
}
