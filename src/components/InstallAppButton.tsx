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
  const [isSafari, setIsSafari] = useState(false)
  const [isChromeLike, setIsChromeLike] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

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
    setIsSafari(safari)
    setIsChromeLike(chromeLike)
    setIsInstalled(standalone)

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
      setShowHelp(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  if (isInstalled) return null

  const isCompatibleBrowser = isChromeLike || (isIos && isSafari)
  const canInstallNow = !!installPrompt
  const showIosFlow = isIos && isSafari

  const handleInstallClick = async () => {
    if (installPrompt) {
      await installPrompt.prompt()
      await installPrompt.userChoice
      setInstallPrompt(null)
      return
    }

    setShowHelp(true)
  }

  let helperText = ''
  if (showIosFlow) {
    helperText = t('install_ios_helper')
  } else if (!isCompatibleBrowser) {
    helperText = isMobile
      ? t('install_use_supported_mobile_browser')
      : t('install_use_supported_desktop_browser')
  } else if (!canInstallNow) {
    helperText = t('install_open_help')
  }

  const buttonLabel = canInstallNow
    ? t('install_download_app')
    : showIosFlow
      ? t('install_how_to')
      : t('install_download_app')

  return (
    <>
      <div className="relative w-full sm:w-auto sm:min-w-[160px]">
        <button
          onClick={handleInstallClick}
          className={[
            'w-full h-12 px-6 rounded-xl text-xs font-black transition-all',
            canInstallNow || showIosFlow
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md active:scale-95 hover:opacity-90 cursor-pointer'
              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer'
          ].join(' ')}
        >
          {buttonLabel}
        </button>

        {helperText && (
          <p className="mt-1 text-[10px] leading-tight text-zinc-400 dark:text-zinc-500 sm:absolute sm:top-full sm:left-0 sm:mt-1 sm:max-w-[160px]">
            {helperText}
          </p>
        )}
      </div>

      {showHelp && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-zinc-900">
            <h3 className="text-sm font-black text-zinc-900 dark:text-white">
              {t('install_modal_title')}
            </h3>

            {showIosFlow ? (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                {t('install_ios_alert')}
              </p>
            ) : isCompatibleBrowser ? (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                {t('install_browser_wait_prompt')}
              </p>
            ) : (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                {isMobile
                  ? t('install_use_supported_mobile_browser')
                  : t('install_use_supported_desktop_browser')}
              </p>
            )}

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowHelp(false)}
                className="flex-1 h-11 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
              >
                {t('install_close')}
              </button>

              {installPrompt && (
                <button
                  onClick={async () => {
                    await installPrompt.prompt()
                    await installPrompt.userChoice
                    setInstallPrompt(null)
                    setShowHelp(false)
                  }}
                  className="flex-1 h-11 rounded-xl bg-zinc-900 text-sm font-black text-white dark:bg-zinc-100 dark:text-zinc-900"
                >
                  {t('install_download_app')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}