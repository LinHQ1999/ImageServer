import {useState} from "react";
import {Badge, Card, Col, Container, Form, Row, Spinner, Stack} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import {useAuthorList} from "../services/swr";

export default function Content() {
    const {authors, error} = useAuthorList()
    const [key, setKey] = useState<string>("")
    const nav = useNavigate()

    return (
        <Stack gap={3} className="p-3 col-md-8 mx-auto">
            <span className="fw-bold fs-4">作者列表</span>
            <Form.Control
                type="search"
                value={key}
                onChange={(event) => setKey(event.target.value)}
            />
            {!error && !authors ?
                <p className="fw-bold text-info">
                    <Spinner animation="border" variant="primary"></Spinner>
                </p>
                :
                <Container fluid>
                    <Row
                        xs="1" sm="2" md="3" xlg="4"
                        className="g-1 justify-content-center"
                    >
                        {authors
                            .filter(author => {
                                if (key) {
                                    return author.author.toLowerCase().includes(key.toLowerCase())
                                }
                                return true
                            })
                            .map(author => (
                                <Col>
                                    <Card>
                                        <Card.Img variant="top" src={"/pics/" + author.latest_img}></Card.Img>
                                        <Card.Body>
                                            <Card.Title onClick={() => nav("/" + author.author + "?total=" + author.submissions)}>
                                                {author.author}
                                            </Card.Title>
                                            <Card.Subtitle><Badge>Submissions: {author.submissions}</Badge></Card.Subtitle>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                    </Row>
                </Container>
            }
        </Stack>
    )
}
