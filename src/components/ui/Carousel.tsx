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
  const itemsCount = items.length
  const [currentIndex, setCurrentIndex] = useState(0)
  const pauseRef = useRef(false)
  const touchStartX = useRef<number | null>(null)

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex((itemsCount + index) % itemsCount)
  }, [itemsCount])

  const goToNext = useCallback(() => {
    setCurrentIndex(i => (i + 1) % itemsCount)
  }, [itemsCount])

  const goToPrev = useCallback(() => {
    setCurrentIndex(i => (i - 1 + itemsCount) % itemsCount)
  }, [itemsCount])

  // Auto-play advances on a fixed interval, paused while hovered/focused.
  useEffect(() => {
    if (!autoPlay || itemsCount <= 1) return
    const id = setInterval(() => {
      if (!pauseRef.current) {
        setCurrentIndex(i => (i + 1) % itemsCount)
      }
    }, interval)
    return () => clearInterval(id)
  }, [autoPlay, itemsCount, interval])

  const handlePause = useCallback((paused: boolean) => {
    pauseRef.current = paused
  }, [])

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(diff) > 40) { diff > 0 ? goToPrev() : goToNext() }
    touchStartX.current = null
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goToPrev() }
    else if (e.key === 'ArrowRight') { e.preventDefault(); goToNext() }
    else if (e.key === 'Home') { e.preventDefault(); goToSlide(0) }
    else if (e.key === 'End') { e.preventDefault(); goToSlide(itemsCount - 1) }
  }

  if (itemsCount === 0) return null

  return (
    <div
      className={`${styles.carousel} ${className}`}
      onMouseEnter={() => pauseOnHover && handlePause(true)}
      onMouseLeave={() => pauseOnHover && handlePause(false)}
      onFocus={() => pauseOnHover && handlePause(true)}
      onBlur={() => pauseOnHover && handlePause(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Carousel"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className={styles.carouselViewport}>
        <div
          className={styles.carouselTrack}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className={styles.carouselSlide}
              role="group"
              aria-label={`Slide ${index + 1} of ${itemsCount}`}
              aria-hidden={index !== currentIndex}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
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