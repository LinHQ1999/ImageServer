import {useRef, useState} from "react";
import {Col, Modal} from "react-bootstrap";
import {ImageIndex} from "../services/swr";

interface ImageProps {
    index: ImageIndex
    children?: React.FC
}

export default function ImageCard({index}: ImageProps) {
    const [big, setBig] = useState(false)
    const imgRef = useRef<HTMLImageElement>(null)

    function autoSize(){
        const width = imgRef.current?.width
        const height = imgRef.current?.height
        if (width && height) {
            return (width > height) ? "h-100" : "w-100"
        }
        return "h-100"
    }

    return (
        <>
            {big ?
                <Modal show={big} fullscreen onHide={() => setBig(!big)}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {index.name}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body
                        onDoubleClick={() => setBig(!big)}
                        className="px-0">
                        <img
                            className={autoSize()}
                            src={"/pics/" + index.path} />
                    </Modal.Body>
                </Modal>
                :
                <Col
                    className="d-flex mh-50 flex-column align-items-center justify-content-between border border-2"
                >
                    <img
                        className="w-100 p-xs-0 p-sm-1"
                        onClick={() => setBig(!big)}
                        ref={imgRef}
                        loading="lazy"
                        src={"/pics/" + index.path} />
                    <div className="w-100 text-center justify-self-end">
                        <hr className="w-75 mx-auto" />
                        <h4 title={index.name} className="px-1 text-truncate">{index.name}</h4>
                    </div>
                </Col>
            }
        </>
    )
}
