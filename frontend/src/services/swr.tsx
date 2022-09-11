import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then(res => res.data)

export interface Author {
    author: string
    submissions: number
    latest_img: string
}


export interface FormFields {
    keyword: string
    pg: number
    sz: number
}

export interface ImageIndex {
    id: number
    name: string
    path: string
    author: string
}

// 响应的查询结果
export interface ImageSearchResp {
    max: number
    data: ImageIndex[]
}

export function useAuthorList() {
    const {data, error} = useSWR<Author[], any>("/api/authors", fetcher)

    return {
        authors: data!,
        error: error
    }
}

export function useImageSearch(author: string, form: FormFields) {
    const {data, error} = useSWR<ImageSearchResp, any>(() => `/api/${author}/submissions?query=${form.keyword}&sz=${form.sz}&pg=${form.pg}`, fetcher)

    return {
        total: data?.max,
        imageIndexes: data?.data,
        error: error
    }
}
