/** Centralized configuration constants */
export const config = {
  /** Company contact details */
  whatsapp: {
    number: '+2348023392388',
    get link() {
      return `https://wa.me/${this.number.replace('+', '')}`
    },
    getEncodedMessage(text: string) {
      return encodeURIComponent(text)
    },
    getDeepLink(text: string) {
      return `${this.link}?text=${this.getEncodedMessage(text)}`
    },
  },

  /** Company details */
  company: {
    name: 'Empathon Autos',
    email: 'empathonautos@gmail.com',
    phone1: '+234 802 339 2388',
    phone2: '+234 810 383 2403',
    address: '123 Ajao Road, off Awolowo Way, Ikeja, Lagos',
    hours: 'Mon–Sat, 8:00 AM – 6:00 PM',
    website: 'https://www.emphatonautos.com',
    estYear: 2019,
  },

  /** SEO defaults */
  seo: {
    defaultTitle: 'Empathon Autos — Premium Vehicles, Nigeria',
    defaultDescription: 'Premium vehicle imports, pre-orders, and sales. Your trusted automotive partner in Lagos, Nigeria.',
    defaultImage: '/og-image.svg',
    siteUrl: 'https://www.emphatonautos.com',
  },

  /** Social profiles — add your business URLs here to show them in the footer */
  social: {
    instagram: '', // e.g. 'https://instagram.com/empathonautos'
    facebook: '',  // e.g. 'https://facebook.com/empathonautos'
  },

  /** Rate limiting (ms) */
  rateLimit: {
    formSubmission: 2000, // 2 seconds between form submissions
  },
} as const
