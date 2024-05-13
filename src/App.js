import Home from "./components/Home/Home";
import Lend from "./components/Lend/Lend";
import Offers from "./components/offers/Offers";
import OrderBook from "./components/orderBook/OrderBook";
import Borrow from "./components/borrow/Borrow";
import { Route, Routes } from "react-router-dom"
import Loans from "./components/loans/Loans";
import VideoBG from "./components/global/VideoBG";

window.Buffer = window.Buffer || require("buffer").Buffer;

function App() {
  return (
    <div className="App">
      <VideoBG />
      <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/lend" element={<Lend />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/orderbook" element={<OrderBook/>} />
          <Route path="/borrow" element={<Borrow />} />
          <Route path="/loans" element={<Loans />} />
      </Routes>

    </div>
  );
}

export default App;
