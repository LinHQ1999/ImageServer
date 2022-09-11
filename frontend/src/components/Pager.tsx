import {faChevronLeft, faChevronRight, faSearch} from "@fortawesome/free-solid-svg-icons"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {FormEvent, useRef} from "react"
import {Button, Col, Form, InputGroup, Row} from "react-bootstrap"
import {useNavigate} from "react-router-dom"
import {FormFields} from "../services/swr"

interface PagerProps {
    formField: FormFields
    total: number
    setForm: React.Dispatch<React.SetStateAction<FormFields>>
    children?: React.FC
}

export default function Pager({formField, total, setForm}: PagerProps) {
    const searchRef = useRef<HTMLInputElement>(null)
    const pageRef = useRef<HTMLInputElement>(null)
    const sizeRef = useRef<HTMLSelectElement>(null)
    const nav = useNavigate()

    // 计算应该有多少页
    function caclPage(total: number, size: number) {
        let div = total % size
        return (div == 0) ? Math.floor(total / size) : Math.floor(total / size + 1)
    }

    function handleNav(next = true) {
        let oldPage = formField.pg
        let maxPage = caclPage(total, formField.sz)
        if (next) {
            let newPage = (oldPage + 1 > maxPage) ? maxPage : oldPage + 1
            setForm({...formField, pg: newPage})
            pageRef.current!.value = `${newPage}`
        } else {
            if (oldPage == 1) nav("/")
            else {
                setForm({...formField, pg: oldPage - 1})
                pageRef.current!.value = `${oldPage - 1}`
            }
        }
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault()

        let newPage = parseInt(pageRef.current?.value ?? "0")
        const newPageSize = parseInt(sizeRef.current?.value ?? "48")
        const newKeyword = searchRef.current?.value ?? ""
        // 计算并确保在最大页数之内
        const maxPage = caclPage(total, newPageSize)

        if (newPage > maxPage) {
            newPage = maxPage
            pageRef.current!.value = `${maxPage}`
        }
        // 关键字变动和每页图片数变动回到第一页
        if (newKeyword != formField.keyword || newPageSize != formField.sz) {
            newPage = 1
            pageRef.current!.value = `${newPage}`
        }

        setForm({
            keyword: newKeyword,
            pg: newPage,
            sz: newPageSize
        })
    }

    return (
        <Form onSubmit={handleSubmit} className="p-1">
            <Row className="align-items-center g-1">
                <Col xs="auto">
                    <Button type="button" variant="outline-secondary" size="sm" onClick={() => handleNav(false)}>
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </Button>
                </Col>
                <Col xs={3} md={4}>
                    <InputGroup size="sm">
                        <InputGroup.Text>
                            <FontAwesomeIcon icon={faSearch} />
                        </InputGroup.Text>
                        <Form.Control
                            ref={searchRef}
                            type="search"
                            defaultValue={formField.keyword}
                        />
                    </InputGroup>
                </Col>
                <Col>
                    <InputGroup size="sm">
                        <InputGroup.Text>
                            #
                        </InputGroup.Text>
                        <Form.Control
                            type="number"
                            max={999}
                            ref={pageRef}
                            defaultValue={formField.pg}
                        />
                    </InputGroup>
                </Col>
                <Col xs="auto">
                    <Form.Select size="sm" ref={sizeRef} defaultValue={formField.sz}>
                        <option value="24">24</option>
                        <option value="48">48</option>
                        <option value="72">72</option>
                    </Form.Select>
                </Col>
                <Col>
                    <Button size="sm" type="submit">Go</Button>
                </Col>
                <Col xs="auto" className="text-end">
                    <Button type="button" variant="outline-secondary" size="sm" onClick={() => handleNav(true)}>
                        <FontAwesomeIcon icon={faChevronRight} />
                    </Button>
                </Col>
            </Row>
        </Form>
    )
}
