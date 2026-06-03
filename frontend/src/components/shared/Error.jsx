import React from 'react'

const Error = ({message = "Something went wrong."}) => {
  return (
    <div className=' animate__animated animate__fadeIn w-full p-24 bg-rose-50 border border-rose-300 rounded-xl text-center text-rose-600 font-medium'>
      {message}
    </div>
  )
}

export default Error
