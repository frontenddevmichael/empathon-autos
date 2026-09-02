import { useEffect, useState } from 'react'
import styles from './Toast.module.css'

interface ToastProps {
  message: string
  type?: 'success' | 'error'
  duration?: number
  onDone: () => void
}

export function Toast({ message, type = 'success', duration = 4000, onDone }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 300)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onDone])

  if (!visible) return null

  return (
    <div className={`${styles.toast} ${styles[type]}`} role="alert">
      {message}
    </div>
  )
}
