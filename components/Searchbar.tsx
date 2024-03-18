'use client'
import { scrapeandstoreproduct } from '@/lib/action'
import { FormEvent, useState } from 'react'

const isValidAmznLink = (url: string) => {
    try {
        const parsedUrl = new URL(url)
        const hostname = parsedUrl.hostname

        if (
            hostname.includes('www.amazon.com')
            || hostname.includes('amazon.')
            || hostname.endsWith('amazon')
        ) {
            return true
        }
    } catch (error) {
        return false
    }
    return false
}

const Searchbar = () => {

    const [searchPrompt, setSearchPrompt] = useState('')
    const [isLoading, setIsLoading] = useState(false);
    
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const isValidLink = isValidAmznLink(searchPrompt)
        if (!isValidLink) {
            alert('Please enter a valid Amazon product link')
        }
        try {
            setIsLoading(true)
            // fetch data
            const product = await scrapeandstoreproduct(searchPrompt)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

  return (
    <form
        className=' flex flex-wrap gap-4 mt-12'
        onSubmit={handleSubmit}        
    >
          <input
              type="text"
              placeholder='Enter Product Link'
              className=' searchbar-input'
              value={searchPrompt}
              onChange={(e) => setSearchPrompt(e.target.value)}
          />
          <button
              type='submit'
              className=' searchbar-btn'
              disabled={searchPrompt === ''}
          >
                {isLoading ? 'Searching...' : 'Search'}
          </button>
    </form>
  )
}

export default Searchbar