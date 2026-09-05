
const Footer = () => {
  return (
    <footer className="bg-ink text-parchment/80 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <h3 className="font-display text-2xl text-parchment mb-3">
            Chapter &amp; Verse
          </h3>
          <p className="font-sans text-sm leading-relaxed text-parchment/60 max-w-xs">
            Printed and sold with care, one title at a time.
          </p>
        </div>
        <div className="font-sans text-sm ">
          <h4 className="text-parchment mb-3">Browse</h4>
          <ul className="space-y-2 text-parchment/60">
            <li><a href="/shop" className="hover:text-parchment transition-colors">Full Shelf</a></li>
            <li><a href="/shop?genre=fiction" className="hover:text-parchment transition-colors">Genres</a></li>
          </ul>
        </div>
        <div className="font-sans text-sm">
          <h4 className="text-parchment mb-3">Support</h4>
          <ul className="space-y-2 text-parchment/60">
            <li><a href="/orders" className="hover:text-parchment transition-colors">Track an order</a></li>
            <li><a href="/contact" className="hover:text-parchment transition-colors">Contact us</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-parchment/10 py-4 text-center text-xs text-parchment/40 font-sans">
        © {new Date().getFullYear()} Chapter &amp; Verse. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
