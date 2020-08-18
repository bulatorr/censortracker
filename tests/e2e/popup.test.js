import { createDriver, getPopupFor } from './selenium'
import { isElementExists, waitGetElement } from './selenium/utils'

describe('Testing popup of the extension', () => {
  let driver
  let extensionId
  const timeout = 35000

  beforeAll(async () => {
    ({ driver, extensionId } = await createDriver())
  })

  afterAll(async () => {
    await driver.quit()
  })

  describe('checks that extension shows that website is or is not ORI', () => {
    const urls = [
      { url: 'https://meduza.io/', isORI: false },
      { url: 'https://2ch.hk/', isORI: true },
      { url: 'https://netflix.com/', isORI: false },
      { url: 'https://vk.com/', isORI: true },
      { url: 'https://tinder.com', isORI: true },
      { url: 'https://hd.kinopoisk.ru/', isORI: false },
      { url: 'https://disk.yandex.ru', isORI: true },
      { url: 'http://avito.ru', isORI: true },
    ]

    it.each(urls)('popup contains the corresponding HTML elements', async ({ url, isORI }) => {
      await getPopupFor({ driver, extensionId }, url)

      const oriBlock = await isElementExists(driver, { id: 'isOriBlock' }, 2000)
      const notOriBlock = await isElementExists(driver, { id: 'isNotOriBlock' }, 2000)

      if (isORI) {
        const aboutOriButton =
          await waitGetElement(driver, { id: 'aboutOriButton' }, 2000)

        await aboutOriButton.click()
        const closeTextAboutOriButton =
          await waitGetElement(driver, { id: 'closeTextAboutOri' }, 1500)

        await closeTextAboutOriButton.click()

        expect(oriBlock).toBeTruthy()
        expect(notOriBlock).toBeFalsy()
      } else {
        const aboutNotOriButton =
          await waitGetElement(driver, { id: 'btnAboutNotOri' }, 2000)

        await aboutNotOriButton.click()
        const closeTextAboutNotOriButton =
          await waitGetElement(driver, { id: 'closeTextAboutNotOri' }, 1500)

        await closeTextAboutNotOriButton.click()

        expect(oriBlock).toBeFalsy()
        expect(notOriBlock).toBeTruthy()
      }
    }, timeout)
  })

  describe('checks that extension shows that website is in the registry of blocked websites', () => {
    const urls = [
      'https://tunnelbear.com/',
      'http://lostfilm.tv/',
      'https://rutracker.org/',
    ]

    it.each(urls)('popup contains isForbidden element and do not contain isNotForbidden', async (url) => {
      await getPopupFor({ driver, extensionId }, url)

      const isNotForbidden =
        await isElementExists(driver, { id: 'isNotForbidden' })

      expect(isNotForbidden).toBeFalsy()

      const isForbidden = await waitGetElement(driver, { id: 'isForbidden' })

      const aboutForbiddenButton =
        await waitGetElement(driver, { id: 'btnAboutForbidden' })

      await aboutForbiddenButton.click()

      const closeAboutForbiddenButton =
        await waitGetElement(driver, { id: 'closeTextAboutForbidden' })

      await closeAboutForbiddenButton.click()

      expect(isForbidden).toBeTruthy()
    }, timeout)
  })

  describe('Test extension after clicking on disable/enable buttons in popup', () => {
    const urls = [
      {
        url: 'https://rutracker.org',
        expectedTitle: 'RuTracker.org',
      },
      {
        url: 'https://www.tunnelbear.com/',
        expectedTitle: 'TunnelBear: Secure VPN Service',
      },
      {
        url: 'https://protonmail.com/',
        expectedTitle: 'Secure email: ProtonMail is free encrypted email.',
      },
    ]

    it.each(urls)('disable/enable buttons work fine', async ({ url, expectedTitle }) => {
      await getPopupFor({ driver, extensionId }, 'https://jestjs.io/')

      const disableExtensionButton =
        await waitGetElement(driver, { id: 'disableExtension' }, 2500)

      await disableExtensionButton.click()

      const enableExtensionButton =
        await waitGetElement(driver, { id: 'enableExtension' }, 2500)

      await enableExtensionButton.click()

      await driver.sleep(2500)

      await driver.get(url)
      const title = await driver.getTitle()

      expect(title).toBe(expectedTitle)
    }, timeout)
  })
})
