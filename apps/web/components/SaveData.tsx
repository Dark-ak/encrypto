'use client'

import React, { useEffect, useState } from 'react'
import { validateJson } from '../utils/validateJson'
import { savePayload } from '../utils/apiFunctions'
import CodeEditor from '@uiw/react-textarea-code-editor';

const SaveData = () => {

    const [partyId, setPartyId] = useState("")
    const [payload, setPayload] = useState("")
    const [jsonError, setJsonError] = useState("")
    const [error, setError] = useState("")


    const clear = () => {
        setPartyId("")
        setPayload("")
    }

    async function handleSubmit() {

        if (partyId.length <= 3) {
            setError("Party ID lenght Is Too Small")
            return
        }

        if (payload == "") {
            setError("Enter Payload")
            return
        }
        if (jsonError != "") {
            setError("Fix  JSON Payload Error")
            return
        }

        try {
            const res = await savePayload(partyId, payload)

            if(res.data.success == true){
                alert("Saved Succesfully Here's Your ID " + res.data.id)
                clear()
            }

        } catch (error) {
            console.log(error)
            setError("")
        }

    }
    const formatJSON = () => {
        try {
            const parsed = JSON.parse(payload);
            setPayload(JSON.stringify(parsed, null, 2));
            setJsonError('');
        } catch (error) {
            setJsonError('Invalid JSON - cannot format');
        }
    };

    useEffect(() => {

        const t = setTimeout(() => {
            if (payload == "") return
            const data = validateJson(payload)
            if (!data.valid) {
                setJsonError(data.error || "")
            }
            else {
                setJsonError("")
            }
            console.log(data)
        }, 300)

        return () => {
            clearTimeout(t)
        }
    }, [payload])


    return (
        <div className='w-full'>
            <div className='flex flex-col gap-2'>
                <p className='text-sm text-red-500'>{error}</p>
                <div className='flex flex-col gap-2'>
                    <label htmlFor="partyId" className='font-medium'>Party ID</label>
                    <input className='px-2 py-1 border-2 focus:outline-none rounded border-gray-400' type="text" value={partyId} onChange={(e) => setPartyId(e.target.value)} />
                </div>

                {/* <div className='flex flex-col gap-2'>
                    <label htmlFor="partyId" className='font-medium'>JSON Payload</label>
                    {jsonError && <p className='text-red-600 text-sm'>{jsonError}</p>}

                    <textarea
                        placeholder='{"key": "value"}'
                        spellCheck={false}
                        className='px-2 py-1 min-h-50 border-2 font-mono focus:outline-none rounded border-gray-400 resize-y'
                        value={payload}
                        onChange={(e) => setPayload(e.target.value)} />
                </div> */}

                <div  className='flex flex-col gap-2'>
                    <label htmlFor="partyId" className='font-medium'>JSON Payload</label>

                    {jsonError && <p className='text-red-600 text-sm my-2'>{jsonError}</p>}

                    <CodeEditor
                        value={payload}
                        language="json"
                        placeholder='{"key": "value"}'
                        onChange={(e) => setPayload(e.target.value)}
                        padding={15}
                         data-color-mode="light"
                        style={{             
                            fontSize: 14,
                            fontFamily: 'ui-monospace, monospace',
                            borderRadius: '8px',
                            border: '2px solid #d1d5db',
                            backgroundColor: "white"
                        }}
                    />
                </div>

                <div className='ml-auto flex gap-2'>
                    {(payload != "" && jsonError == "") && <button onClick={() => formatJSON()} className='text-black px-6 rounded border bg-gray-200 border-gray-400   py-2'>Format JSON</button>}

                    <button onClick={handleSubmit} className='bg-black px-6 rounded text-white  py-2'>Submit</button>
                </div>
            </div>
        </div>
    )
}

export default SaveData