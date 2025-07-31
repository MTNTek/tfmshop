'use client'

export function BackToTop() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div 
      className="bg-tfm-navy-light py-4 text-center text-sm hover:bg-tfm-navy-dark cursor-pointer"
      onClick={scrollToTop}
    >
      Back to top
    </div>
  )
}
