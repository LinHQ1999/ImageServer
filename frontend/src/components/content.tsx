import {useState} from "react";
import {Badge, ListGroup, Stack, Spinner, Form} from "react-bootstrap";
import {useNavigate} from "react-router";
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
                <ListGroup>
                    {authors
                        .filter(author => {
                            if (key) {
                                return author.author.toLowerCase().includes(key.toLowerCase())
                            }
                            return true
                        })
                        .map(author => (
                            <ListGroup.Item
                                className="d-flex justify-content-between"
                                action
                                key={author.author}
                                onClick={() => nav(`${author.author}?total=${author.submissions}`)}
                            >
                                <span className="fw-bold">
                                    {author.author}
                                </span>
                                <Badge>
                                    {author.submissions}
                                </Badge>
                            </ListGroup.Item>
                        ))}
                </ListGroup>
            }
        </Stack>
    )
}
