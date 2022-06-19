import {BrowserRouter, Route, Routes} from "react-router-dom";
import Content from "./components/content";
import Viewer from "./components/viewer";
export default function App() {
    return (
        <BrowserRouter basename="/app">
            <Routes>
                <Route path="*" element={<Content />} />
                <Route path="/:author" element={<Viewer/>} />
            </Routes>
        </BrowserRouter>
    )
}
