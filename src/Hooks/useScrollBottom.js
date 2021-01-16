import { useEffect, useState } from 'react'

const useScrollBottom = () => {
    const [isBottom, setOnBottom] = useState(false)
  
    useEffect(() => {
      function handleScroll() {
        if (window.innerHeight + window.pageYOffset >= document.body.scrollHeight) {
          setOnBottom(true)
        } else if (isBottom) {
          setOnBottom(false)
        }
      }
      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }, [])
  
    return [ isBottom, () => setOnBottom(false) ]
}

export default useScrollBottom