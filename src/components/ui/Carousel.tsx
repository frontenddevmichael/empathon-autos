import styles from './Carousel.module.css'

interface CarouselProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  speed?: number
  className?: string
}

export function Carousel<T>({
  items,
  renderItem,
  speed = 36,
  className = '',
}: CarouselProps<T>) {
  if (items.length === 0) return null

  const loopItems = [...items, ...items]

  return (
    <div className={`${styles.carousel} ${className}`}>
      <div className={styles.carouselViewport}>
        <div
          className={styles.carouselTrack}
          style={{ ['--carousel-duration' as string]: `${speed}s` }}
        >
          {loopItems.map((item, index) => (
            <div
              key={index}
              className={styles.carouselSlide}
              role="group"
              aria-label={`Slide ${(index % items.length) + 1} of ${items.length}`}
            >
              {renderItem(item, index % items.length)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
