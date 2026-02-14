import axios from "axios"

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/"


export async function getEncrypted(key: string) {
    console.log(baseUrl)

    const res = await axios.get(baseUrl + `tx/${key}`)
    return res
}

export async function getDecrypted(key: string) {

    const res = await axios.get(baseUrl + `tx/${key}/decrypt`)
    return res

}

export async function savePayload(partyId: string, payload: any) {

    const postData = {
        partyId: partyId,
        payload
    }

    const res = await axios.post(baseUrl + `tx/encrypt`, postData)

    return res
}