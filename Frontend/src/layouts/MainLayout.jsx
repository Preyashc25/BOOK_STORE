import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

const MainLayout = ({ childern }) => {
  return (
    <div className="min-h-screen bg-parchment text-ink flex flex-col">
      <Navbar />
      <main className="flex-1">{childern}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
