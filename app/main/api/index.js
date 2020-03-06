/*export function fetchApiRequest(url, options={}) {
    options.headers = options.headers || new Headers()
    if(options.idToken) {
        options.headers.append('Authorization', options.idToken)
    }

    const request = new Request(url, options)
    return fetch(request).then(response => {
        return response.ok ? response.json() : Promise.reject()
    }).then(responseJson => {
        return responseJson.ok ? responseJson.payload : Promise.reject(responseJson.error)
    });
}*/