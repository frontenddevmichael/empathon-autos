import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './Carousel.module.css'

interface CarouselProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  autoPlay?: boolean
  interval?: number
  showArrows?: boolean
  showDots?: boolean
  pauseOnHover?: boolean
  className?: string
}

export function Carousel<T>({
  items,
  renderItem,
  autoPlay = true,
  interval = 5000,
  showArrows = true,
  showDots = true,
  pauseOnHover = true,
  className = '',
}: CarouselProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const itemsCount = items.length

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex((itemsCount + index) % itemsCount)
  }, [itemsCount])

  const goToNext = useCallback(() => goToSlide(currentIndex + 1), [currentIndex, goToSlide])
  const goToPrev = useCallback(() => goToSlide(currentIndex - 1), [currentIndex, goToSlide])

  const startAutoPlay = useCallback(() => {
    if (!autoPlay || itemsCount <= 1) return
    intervalRef.current = setInterval(goToNext, interval)
  }, [autoPlay, interval, itemsCount, goToNext])

  const stopAutoPlay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    startAutoPlay()
    return stopAutoPlay
  }, [startAutoPlay, stopAutoPlay])

  useEffect(() => {
    if (pauseOnHover && isHovered) {
      stopAutoPlay()
    } else if (pauseOnHover && !isHovered && !isFocused) {
      startAutoPlay()
    }
  }, [isHovered, isFocused, pauseOnHover, startAutoPlay, stopAutoPlay])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goToPrev()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      goToNext()
    } else if (e.key === 'Home') {
      e.preventDefault()
      goToSlide(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      goToSlide(itemsCount - 1)
    }
  }

  if (itemsCount === 0) return null

  return (
    <div
      className={`${styles.carousel} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      role="region"
      aria-label="Carousel"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className={styles.carouselTrack} role="list">
        {items.map((item, index) => (
          <div
            key={index}
            className={`${styles.carouselSlide} ${index === currentIndex ? styles.carouselSlideActive : ''}`}
            role="listitem"
            aria-hidden={index !== currentIndex}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {showArrows && itemsCount > 1 && (
        <>
          <button
            className={`${styles.carouselArrow} ${styles.carouselArrowPrev}`}
            onClick={goToPrev}
            aria-label="Previous slide"
            type="button"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            className={`${styles.carouselArrow} ${styles.carouselArrowNext}`}
            onClick={goToNext}
            aria-label="Next slide"
            type="button"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {showDots && itemsCount > 1 && (
        <div className={styles.carouselDots} role="tablist" aria-label="Slide indicators">
          {items.map((_, index) => (
            <button
              key={index}
              className={`${styles.carouselDot} ${index === currentIndex ? styles.carouselDotActive : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              role="tab"
              aria-selected={index === currentIndex}
              type="button"
            />
          ))}
        </div>
      )}
    </div>
  )
}