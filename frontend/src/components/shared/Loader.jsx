import { Loader2 } from 'lucide-react'
import React from 'react'

const Loader = () => {
  return (
    <div className='h-screen  pt-24 flex items-center justify-center'>
      <Loader2 className='animate-spin w-16 h-16 text-gray-300'/>
    </div>
  )
}

export default Loader
