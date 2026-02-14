'use client'

import React, { useState } from 'react'
import { getDecrypted, getEncrypted } from '../utils/apiFunctions'
import axios from 'axios'

const GetData = () => {

  const [key, setKey] = useState("")
  const [encrypted, setEncrypted] = useState("")
  const [data, setData] = useState("")
  const [decrypted, setDecrypted] = useState("")
  const [error, setError] = useState("")

  const validation = () => {
    if (key == "") {
      setError("Enter Key First")
      return false
    }
    return true
  }

  const clear = () => {
    setDecrypted("")
    setEncrypted("")
    setError("")
  }

  const handleGetData = async (type: string) => {
    if (!validation()) {
      return
    }
    clear()
    try {
      const result = type == "encrypted" ? await getEncrypted(key) : await getDecrypted(key);
      setData(JSON.stringify(result.data.data, null, 2))
      console.log(result.data)
    } catch (error) {
      console.log(error)

      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setError("Transaction not found");
      } else {
        setError("Network error. Please try again.");
      }
    }
  }


  return (
    <div>
      <div className='flex flex-col items-center'>
        <p className='text-red-500'>{error}</p>
        <div className='flex flex-col gap-2 w-full'>
          <label htmlFor="partyId" className='font-medium'>Enter Key</label>
          <input className='px-2 py-1 border-2 focus:outline-none rounded border-gray-400' type="text" value={key} onChange={(e) => setKey(e.target.value)} />
        </div>

        <div className='w-full ml-auto flex justify-end gap-4 my-3'>
          <button onClick={() => handleGetData("decrypted")} className='bg-black px-6 rounded text-white  py-2'>Get Decrypted</button>
          <button onClick={() => handleGetData("encrypted")} className='text-black px-6 rounded border bg-gray-200 border-gray-400   py-2'>Get Encrypted</button>
        </div>


       {data != "" && <div className='w-full lg:min-w-125 lg:w-fit'>
          <p className='font-medium'>Result</p>
          <pre className='bg-gray-100 p-4 rounded font-mono overflow-auto'
            >
            <code>{data}</code>
          </pre>
        </div>}
      </div>
    </div>
  )
}

export default GetData