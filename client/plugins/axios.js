import * as axios from 'axios'

let options = {}
// The server-side needs a full url to works
if (process.server) {
    options.baseURL = `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}`
}

const http = axios.create(options)

export default http

function handleResp (resp) {
    if (resp.status === 200) {
        const data = resp.data
        if (data.success) {
            return data.data
        } else {
            throw new Error(data.message)
        }
    }
    const error = new Error(resp.statusText)
    error.statusCode = 500
    throw error
}

export async function httpGet (url, params) {
    if (params) {
        const suf = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')
        url += (url.indexOf('?') === -1 ? '?' : '&') + suf
    }
    return handleResp(await http.get(url))
}

export async function httpPost (url, params) {
    return handleResp(await http.post(url, params))
}

export async function httpPostBlob (url, params) {
    return http.post(url, params, {responseType: 'blob'})
}

export async function httpDelete (url, params) {
    return handleResp(await http.delete(url, params))
}
