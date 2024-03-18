// page reference from github: https://github.com/adrianhajdin/pricewise/blob/main/components/Navbar.tsx

import Link from 'next/link'
import React from 'react'
import Image from 'next/image'

const nacIcons = [
    {
        src: '/assets/icons/search.svg',
        alt: 'search',
    },
    {
        src: '/assets/icons/black-heart.svg',
        alt: 'heart',
    },
    {
        src: '/assets/icons/user.svg',
        alt: 'user',
    },
]

const Navbar = () => {
    return (
        <header className=' w-full'> 
            <nav className=' nav'>
                <Link href='/' className=' flex items-center gap-1'>
                    <Image src='/assets/icons/logo.svg' alt='logo' width={27} height={27} />
                    <p className=' nav-logo'>
                        Price
                        <span className=' text-primary'>Wise</span>
                    </p>
                </Link>

                <div className=' flex items-center gap-5'>
                    {nacIcons.map((icon) => (
                        <Image src={icon.src} className=' object-contain' alt={icon.alt} width={28} height={28} key={icon.alt} />
                    ))}
                </div>
            </nav>
        </header>
  )
}

export default Navbar