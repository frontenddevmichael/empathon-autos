import { describe, it, expect } from 'vitest'
import { config } from '../config'

describe('config', () => {
  describe('whatsapp', () => {
    it('has a valid phone number', () => {
      expect(config.whatsapp.number).toMatch(/^\+\d{13}$/)
    })

    it('generates a valid WhatsApp link', () => {
      expect(config.whatsapp.link).toContain('wa.me/')
      expect(config.whatsapp.link).toContain('2348023392388')
    })

    it('generates encoded messages', () => {
      const encoded = config.whatsapp.getEncodedMessage('Hello World')
      expect(encoded).toBe('Hello%20World')
    })

    it('generates deep links with text', () => {
      const link = config.whatsapp.getDeepLink('Test message')
      expect(link).toContain('wa.me/')
      expect(link).toContain('text=')
    })
  })

  describe('company', () => {
    it('has required company details', () => {
      expect(config.company.name).toBe('Empathon Autos')
      expect(config.company.email).toContain('@')
      expect(config.company.address).toBeTruthy()
      expect(config.company.hours).toBeTruthy()
      expect(config.company.estYear).toBe(2019)
    })
  })

  describe('seo', () => {
    it('has SEO defaults', () => {
      expect(config.seo.defaultTitle).toBeTruthy()
      expect(config.seo.defaultDescription).toBeTruthy()
      expect(config.seo.siteUrl).toContain('https://')
    })
  })

  describe('rateLimit', () => {
    it('has a reasonable form submission interval', () => {
      expect(config.rateLimit.formSubmission).toBeGreaterThanOrEqual(1000)
      expect(config.rateLimit.formSubmission).toBeLessThanOrEqual(10000)
    })
  })
})
