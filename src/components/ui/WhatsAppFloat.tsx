import { MessageCircle } from 'lucide-react'
import { config } from '@/lib/config'
import styles from './WhatsAppFloat.module.css'

export function WhatsAppFloat() {
  return (
    <a
      href={`https://wa.me/${config.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.fab}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={22} />
    </a>
  )
}
