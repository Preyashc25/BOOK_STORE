import { useState } from "react";
import BookCard from "../components/books/BookCard";
const GENRES = [
  "All",
  "Fiction",
  "Non-Fiction",
  "Poetry",
  "Biography",
  "Children's",
  "Academic",
];

const Shop = ({ books = [] }) => {
  const [activeGenre, setActiveGenre] = useState(null);
  const filteredBooks =
    activeGenre === "All"
      ? books
      : books.filter((b) => b.category === activeGenre);

  return (
    <div>
      <h1>The Full Shelf</h1>
      <div>
        <aside>
          <h2>Genres</h2>
          <ul>
            {GENRES.map((genre) => (
              <li key={genre}>
                <button onClick={() => setActiveGenre(genre)}>{genre}</button>
              </li>
            ))}
          </ul>
        </aside>
        <div>
          {filteredBooks.length === 0 ? (
            <p>No titles found in this genre yet</p>
          ) : (
            <div>
              {filteredBooks.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
