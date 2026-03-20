import { useEffect, useState } from 'react'
import { useTranslate } from '../context/LanguageContext'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

export default function InstallAppButton() {
  const { t } = useTranslate()

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [isChromeLike, setIsChromeLike] = useState(false)
  const [isSafari, setIsSafari] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const ua = window.navigator.userAgent
    const uaLower = ua.toLowerCase()

    const ios = /iphone|ipad|ipod/.test(uaLower)
    const mobile = /iphone|ipad|ipod|android|mobile/.test(uaLower)

    const edge = /edg\//i.test(ua)
    const samsung = /samsungbrowser/i.test(ua)
    const chromeLike =
      (/chrome|chromium|crios/i.test(ua) && !edge && !samsung) || edge || samsung

    const safari =
      /safari/i.test(ua) &&
      !/chrome|chromium|crios|edg\//i.test(ua) &&
      !samsung

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    setIsIos(ios)
    setIsMobile(mobile)
    setIsChromeLike(chromeLike)
    setIsSafari(safari)
    setIsInstalled(standalone)

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (installPrompt) {
      await installPrompt.prompt()
      await installPrompt.userChoice
      setInstallPrompt(null)
      return
    }

    if (isIos && isSafari) {
      alert(t('install_ios_alert'))
    }
  }

  if (isInstalled) return null

  const isCompatibleBrowser = isChromeLike || (isIos && isSafari)
  const canInstallNow = !!installPrompt
  const showIosHelp = isIos && isSafari

  let helperText = ''

  if (showIosHelp) {
    helperText = t('install_ios_helper')
  } else if (!isCompatibleBrowser) {
    helperText = isMobile
      ? t('install_use_supported_mobile_browser')
      : t('install_use_supported_desktop_browser')
  } else if (!canInstallNow) {
    helperText = t('install_interact_to_enable')
  }

  const buttonEnabled = canInstallNow || showIosHelp

  return (
    <div className="relative w-full sm:w-auto sm:min-w-[160px]">
      <button
        onClick={buttonEnabled ? handleInstallClick : undefined}
        disabled={!buttonEnabled}
        className={[
          'w-full h-14 px-8 rounded-2xl text-sm font-black transition-all',
          buttonEnabled
            ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg active:scale-95 hover:opacity-90 cursor-pointer'
            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-800 cursor-not-allowed'
        ].join(' ')}
      >
        {showIosHelp ? t('install_how_to') : t('install_download_app')}
      </button>

      {helperText && (
        <p className="mt-2 text-[11px] leading-tight text-zinc-400 dark:text-zinc-500 sm:absolute sm:top-full sm:left-0 sm:mt-2 sm:max-w-[160px]">
          {helperText}
        </p>
      )}
    </div>
  )
}