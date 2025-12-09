import { BrowserRouter, Route, Routes } from "react-router-dom";
import Username from "./Username";
import Lobby from "./Lobby";
import App from "./App";
import NotFound from "./NotFound";

const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Username />} />
                <Route path="/lobby" element={<Lobby />} />
                <Route path="/game" element={<App />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
};

export default Router;