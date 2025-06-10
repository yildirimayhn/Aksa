import { useState, useEffect } from 'react';
import { apiUrl } from './utils';

export const useApiCall = (url, method, body, isToken = false) => {
    const [apiData, setData] = useState(null);
    const [apiError, setError] = useState(null);
    const [apiLoading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (isToken && !token) {
                    throw new Error("Token not found");
                }

                const headers = {"Content-Type": "application/json"};
                if (isToken && token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
               const apiUrlStr = `${apiUrl}${url}`;
               
                const response = await fetch(apiUrlStr, {
                    method: method,
                    headers: {
                        ...headers,
                    },
                    // body: body ? JSON.stringify({value: encripted}) : null
                    body:body ? JSON.stringify(body): null
                });

                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }

                const result = await response.json();
                setData(result);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url, method, body]);

    return { apiData, apiError, apiLoading };
}

// export const useApiHandleSubmit = (url, method, body, isToken = false) => {
//     const [apiData, setData] = useState(null);
//     const [apiError, setError] = useState(null);
//     const [apiLoading, setLoading] = useState(false);

//     const submitApiCall = async () => {
//         try {
//             setLoading(true);
//             const token = localStorage.getItem("token");
//             if (isToken && !token) {
//                 throw new Error("Token not found");
//             }

//             const headers = {"Content-Type": "application/json"};
//             if (isToken && token) {
//                 headers['Authorization'] = `Bearer ${token}`;
//             }
//             // URL'yi güncelle
//             url = 'http://localhost:5001/api' + url;
//             // Method'u güncelle

//             const response = await fetch(url, {
//                 method: method,
//                 headers: {
//                     ...headers,
//                 },
//                 body: body ? JSON.stringify(body) : null,
//             });

//             if (!response.ok) {
//                 throw new Error("Network response was not ok");
//             }

//             const result = await response.json();
//             setData(result);
//         } catch (error) {
//             setError(error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return { apiData, apiError, apiLoading, submitApiCall };
// }   
