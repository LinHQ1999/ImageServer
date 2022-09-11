import {useState} from "react";
import {Alert, Container, Row, Spinner} from "react-bootstrap";
import {useSearchParams, useParams} from "react-router-dom";
import {FormFields, useImageSearch} from "../services/swr";
import ImageCard from "./Image";
import Pager from "./Pager";

export default function Viewer() {
    const [form, setForm] = useState<FormFields>({keyword: "", pg: 1, sz: 48})
    const {author} = useParams()
    const [searchParams] = useSearchParams()
    const {imageIndexes} = useImageSearch(author ?? "", form)
    const total = parseInt(searchParams.get("total") ?? "0")

    return (
        <Container fluid>
            <Row
                className="shadow mb-2 sticky-top"
                style={{
                    background: "rgba(255 255 255 / .5)",
                    backdropFilter: "blur(2px)"
                }}
            >
                <Pager total={total} formField={form} setForm={setForm}></Pager>
            </Row>
            <Row
                xs="1" sm="2" md="3" xlg="4"
                className="g-1 justify-content-center"
            >
                {!imageIndexes ?
                    <Spinner animation="border" variant="secondary"></Spinner>
                    :
                    imageIndexes.length == 0 ?
                        <Alert variant="warning">
                            没有更多图片了！
                        </Alert>
                        :
                        imageIndexes?.map(imageIndex => <div key={imageIndex.id}><ImageCard key={imageIndex.id} index={imageIndex}></ImageCard></div>)
                }
            </Row>
        </Container>
    )
}
